import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import { Loading, ErrorBlock, Empty } from "../components/StateBlock";

export default function JobDetail() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setProfile(null);
    setMatches(null);
    setError(null);
    api.getJob(id).then(setProfile).catch((e) => setError(e.message));
    api.getMatchedCandidates(id).then(setMatches).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <ErrorBlock message={error} />;
  if (!profile) return <Loading label="loading job" />;

  const { job, company, requiredSkills } = profile;
  const skills = requiredSkills.filter((s) => s.skill);

  return (
    <div>
      <Link to="/" style={{ fontSize: 13, color: "var(--ink-soft)" }}>&larr; back</Link>
      <div className="eyebrow" style={{ marginTop: 14 }}>open role</div>
      <h1>{job.title}</h1>
      <p className="lede">{job.description}</p>
      <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>
        {company.name} ({company.industry}) · {job.location} · {job.seniority}
      </p>

      <div className="section">
        <h2>Required skills</h2>
        <div className="tag-row">
          {skills.map((s) => (
            <span key={s.skill} className="tag">{s.skill} · weight {s.weight}</span>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>Matched candidates</h2>
        <p className="lede" style={{ fontSize: 13, marginBottom: 12 }}>
          Job &rarr; skill &rarr; candidate, ranked by how many required skills they have.
        </p>
        {matches === null ? (
          <Loading label="finding candidates" />
        ) : matches.length === 0 ? (
          <Empty message="No candidates match this job's required skills yet." />
        ) : (
          <div className="grid">
            {matches.map(({ candidate, matchScore, matchedSkills }) => (
              <Link key={candidate.id} to={`/candidates/${candidate.id}`} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <div className="card-title">{candidate.name}</div>
                    <div className="card-sub">{candidate.location} · {candidate.experienceYears} yrs</div>
                  </div>
                  <span className="score-badge">{matchScore} skill match</span>
                </div>
                <div className="tag-row">
                  {matchedSkills.map((s) => <span key={s} className="tag matched">{s}</span>)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
