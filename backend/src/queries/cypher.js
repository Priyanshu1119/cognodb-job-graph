/**
 * Every query here is parameterised ($param), never string-concatenated.
 * Grouped by what they're for so the route files stay thin.
 */

module.exports = {
  // ---------- Basic browse / read ----------

  listCandidates: `
    MATCH (c:Candidate)
    OPTIONAL MATCH (c)-[:HAS_SKILL]->(s:Skill)
    RETURN c { .id, .name, .location, .experienceYears, .bio } AS candidate,
           collect(DISTINCT s.name) AS skills
    ORDER BY c.name
  `,

  listJobs: `
    MATCH (j:Job)<-[:POSTED]-(co:Company)
    OPTIONAL MATCH (j)-[:REQUIRES_SKILL]->(s:Skill)
    RETURN j { .id, .title, .location, .seniority, .description } AS job,
           co { .id, .name, .industry } AS company,
           collect(DISTINCT s.name) AS requiredSkills
    ORDER BY j.title
  `,

  getCandidateById: `
    MATCH (c:Candidate {id: $candidateId})
    OPTIONAL MATCH (c)-[r:HAS_SKILL]->(s:Skill)
    OPTIONAL MATCH (c)-[w:WORKED_AT]->(co:Company)
    RETURN c { .id, .name, .location, .experienceYears, .bio } AS candidate,
           collect(DISTINCT { skill: s.name, proficiency: r.proficiency }) AS skills,
           collect(DISTINCT { company: co.name, role: w.role, years: w.years }) AS workHistory
  `,

  getJobById: `
    MATCH (j:Job {id: $jobId})<-[:POSTED]-(co:Company)
    OPTIONAL MATCH (j)-[r:REQUIRES_SKILL]->(s:Skill)
    RETURN j { .id, .title, .location, .seniority, .description } AS job,
           co { .id, .name, .industry } AS company,
           collect(DISTINCT { skill: s.name, weight: r.weight }) AS requiredSkills
  `,

  // ---------- Multi-hop: job recommendations (2 hops) ----------
  // Candidate -> Skill <- Job
  // Ranks jobs by how many of the candidate's skills they require.
  recommendJobsForCandidate: `
    MATCH (c:Candidate {id: $candidateId})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES_SKILL]-(j:Job)<-[:POSTED]-(co:Company)
    WITH j, co, count(DISTINCT s) AS matchScore, collect(DISTINCT s.name) AS matchedSkills
    RETURN j { .id, .title, .location, .seniority } AS job,
           co.name AS company,
           matchScore,
           matchedSkills
    ORDER BY matchScore DESC
    LIMIT $limit
  `,

  // ---------- Multi-hop: matched candidates for a job (2 hops) ----------
  // Job -> Skill <- Candidate. Same shape as recommendJobsForCandidate,
  // mirrored, so a recruiter viewing a job can see who fits it.
  matchCandidatesForJob: `
    MATCH (j:Job {id: $jobId})-[:REQUIRES_SKILL]->(s:Skill)<-[:HAS_SKILL]-(c:Candidate)
    WITH c, count(DISTINCT s) AS matchScore, collect(DISTINCT s.name) AS matchedSkills
    RETURN c { .id, .name, .location, .experienceYears } AS candidate,
           matchScore,
           matchedSkills
    ORDER BY matchScore DESC
    LIMIT $limit
  `,

  // ---------- Multi-hop: similar candidates (2 hops) ----------
  // Candidate -> Skill <- other Candidate
  // Useful for "find backup candidates" or "who else could do this".
  findSimilarCandidates: `
    MATCH (c:Candidate {id: $candidateId})-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(other:Candidate)
    WHERE other.id <> $candidateId
    WITH other, count(DISTINCT s) AS sharedSkillCount, collect(DISTINCT s.name) AS sharedSkills
    RETURN other { .id, .name, .location, .experienceYears } AS candidate,
           sharedSkillCount,
           sharedSkills
    ORDER BY sharedSkillCount DESC
    LIMIT $limit
  `,

  // ---------- Skill gap between a candidate and a job ----------
  // Required skills the candidate does NOT have. In SQL this needs a
  // LEFT JOIN + NOT EXISTS across two junction tables; here it's one pattern.
  getSkillGap: `
    MATCH (j:Job {id: $jobId})-[:REQUIRES_SKILL]->(required:Skill)
    OPTIONAL MATCH (c:Candidate {id: $candidateId})-[:HAS_SKILL]->(required)
    WITH required, c
    WHERE c IS NULL
    RETURN collect(required.name) AS missingSkills
  `,

  // ---------- Relational-awkward: variable-length referral network ----------
  // "People who worked alongside people I worked with" - a 1..N hop walk
  // through shared companies. This is a recursive query in SQL (a
  // recursive CTE, re-written for every depth); here it's one traversal
  // with a variable-length relationship pattern.
  //
  // Cypher does not allow a parameter inside the *1..N hop bound, so this
  // is a function: it clamps maxHops to a safe integer range (never takes
  // it from raw user input) and interpolates that integer only. Every
  // actual value (candidateId, limit) still goes through $params.
  getReferralNetwork: (maxHops = 2) => {
    const hops = Math.min(Math.max(parseInt(maxHops, 10) || 2, 1), 3);
    return `
      MATCH (c:Candidate {id: $candidateId})-[:WORKED_AT]->(:Company)<-[:WORKED_AT*1..${hops}]-(colleague:Candidate)
      WHERE colleague.id <> $candidateId
      WITH DISTINCT colleague
      OPTIONAL MATCH (colleague)-[:HAS_SKILL]->(s:Skill)
      RETURN colleague { .id, .name, .location, .experienceYears } AS candidate,
             collect(DISTINCT s.name) AS skills
      LIMIT $limit
    `;
  },

  // ---------- Skill co-occurrence: what skills tend to travel together ----------
  // Used on the skill explorer page. Skill -> Job <- Skill, 2 hops.
  getRelatedSkills: `
    MATCH (s:Skill {name: $skillName})<-[:REQUIRES_SKILL]-(j:Job)-[:REQUIRES_SKILL]->(related:Skill)
    WHERE related.name <> $skillName
    WITH related, count(DISTINCT j) AS coOccurrence
    RETURN related.name AS skill, coOccurrence
    ORDER BY coOccurrence DESC
    LIMIT $limit
  `,

  // ---------- Writes (all parameterised, used by the add-data forms) ----------

  createCandidate: `
    MERGE (c:Candidate {id: $id})
    SET c.name = $name, c.location = $location, c.experienceYears = $experienceYears, c.bio = $bio
    WITH c
    UNWIND $skills AS skillInput
    MERGE (s:Skill {name: skillInput.name})
    MERGE (c)-[r:HAS_SKILL]->(s)
    SET r.proficiency = skillInput.proficiency
    RETURN c.id AS id
  `,

  createJob: `
    MERGE (co:Company {id: $companyId})
    SET co.name = $companyName, co.industry = $companyIndustry
    MERGE (j:Job {id: $id})
    SET j.title = $title, j.location = $location, j.seniority = $seniority, j.description = $description
    MERGE (co)-[:POSTED]->(j)
    WITH j
    UNWIND $skills AS skillInput
    MERGE (s:Skill {name: skillInput.name})
    MERGE (j)-[r:REQUIRES_SKILL]->(s)
    SET r.weight = skillInput.weight
    RETURN j.id AS id
  `,

  applyToJob: `
    MATCH (c:Candidate {id: $candidateId})
    MATCH (j:Job {id: $jobId})
    MERGE (c)-[r:APPLIED_TO]->(j)
    SET r.status = $status, r.appliedAt = datetime()
    RETURN r.status AS status
  `,
};
