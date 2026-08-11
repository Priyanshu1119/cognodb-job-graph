require("dotenv").config();
const { getDriver, closeDriver } = require("../src/config/db");
const { companies, skills, candidates, jobs } = require("./data");

async function run() {
  const driver = getDriver();
  const session = driver.session();

  try {
    console.log("Verifying connection to CognoDB...");
    await driver.verifyConnectivity();

    console.log("Creating uniqueness constraints...");
    await session.run(`CREATE CONSTRAINT candidate_id IF NOT EXISTS FOR (c:Candidate) REQUIRE c.id IS UNIQUE`);
    await session.run(`CREATE CONSTRAINT job_id IF NOT EXISTS FOR (j:Job) REQUIRE j.id IS UNIQUE`);
    await session.run(`CREATE CONSTRAINT company_id IF NOT EXISTS FOR (co:Company) REQUIRE co.id IS UNIQUE`);
    await session.run(`CREATE CONSTRAINT skill_name IF NOT EXISTS FOR (s:Skill) REQUIRE s.name IS UNIQUE`);

    console.log("Clearing any existing sample data...");
    await session.run(`
      MATCH (n)
      WHERE n:Candidate OR n:Job OR n:Company OR n:Skill
      DETACH DELETE n
    `);

    console.log(`Loading ${skills.length} skills...`);
    await session.run(
      `UNWIND $skills AS name MERGE (:Skill {name: name})`,
      { skills }
    );

    console.log(`Loading ${companies.length} companies...`);
    await session.run(
      `UNWIND $companies AS co
       MERGE (c:Company {id: co.id})
       SET c.name = co.name, c.industry = co.industry`,
      { companies }
    );

    console.log(`Loading ${candidates.length} candidates and their skills/work history...`);
    for (const cand of candidates) {
      await session.run(
        `
        MERGE (c:Candidate {id: $id})
        SET c.name = $name, c.location = $location, c.experienceYears = $experienceYears, c.bio = $bio
        WITH c
        UNWIND $skillPairs AS pair
        MERGE (s:Skill {name: pair[0]})
        MERGE (c)-[r:HAS_SKILL]->(s)
        SET r.proficiency = pair[1]
        WITH c
        UNWIND $workPairs AS wp
        MERGE (co:Company {id: wp[0]})
        MERGE (c)-[w:WORKED_AT]->(co)
        SET w.role = wp[1], w.years = wp[2]
        `,
        {
          id: cand.id,
          name: cand.name,
          location: cand.location,
          experienceYears: cand.experienceYears,
          bio: cand.bio,
          skillPairs: cand.skills,
          workPairs: cand.workedAt,
        }
      );
    }

    console.log(`Loading ${jobs.length} jobs and their required skills...`);
    for (const job of jobs) {
      await session.run(
        `
        MATCH (co:Company {id: $companyId})
        MERGE (j:Job {id: $id})
        SET j.title = $title, j.location = $location, j.seniority = $seniority, j.description = $description
        MERGE (co)-[:POSTED]->(j)
        WITH j
        UNWIND $skillPairs AS pair
        MERGE (s:Skill {name: pair[0]})
        MERGE (j)-[r:REQUIRES_SKILL]->(s)
        SET r.weight = pair[1]
        `,
        {
          id: job.id,
          companyId: job.companyId,
          title: job.title,
          location: job.location,
          seniority: job.seniority,
          description: job.description,
          skillPairs: job.skills,
        }
      );
    }

    console.log("Seed complete.");
  } finally {
    await session.close();
    await closeDriver();
  }
}

run().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
