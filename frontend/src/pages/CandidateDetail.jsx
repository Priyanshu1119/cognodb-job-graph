import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import { Loading, ErrorBlock, Empty } from "../components/StateBlock";

export default function CandidateDetail() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [similar, setSimilar] = useState(null);
  const [network, setNetwork] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setProfile(null);
    setJobs(null);
    setSimilar(null);
    setNetwork(null);
    setError(null);

    api.getCandidate(id).then(setProfile).catch((e) => setError(e.message));
    api.getRecommendedJobs(id).then(setJobs).catch((e) => setError(e.message));
    api.getSimilarCandidates(id).then(setSimilar).catch((e) => setError(e.message));
    api.getReferralNetwork(id, 2).then(setNetwork).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <ErrorBlock message={error} />;
  if (!profile) return <Loading label="loading candidate" />;

  const { candidate, skills, workHistory } = profile;
  const realSkills = skills.filter((s) => s.skill);
  const realWork = workHistory.filter((w) => w.company);

  return (
    <div>
      <Link to="/" style={{ fontSize: 13, color: "var(--ink-soft)" }}>&larr; back</Link>
      <div className="eyebrow" style={{ marginTop: 14 }}>candidate profile</div>
      <h1>{candidate.name}</h1>
      <p className="lede">{candidate.bio}</p>
      <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>
        {candidate.location} · {candidate.experienceYears} years experience
      </p>

      <div className="section">
        <h2>Skills</h2>
        <div className="tag-row">
          {realSkills.map((s) => (
            <span key={s.skill} className="tag">{s.skill} · {s.proficiency}</span>
          ))}
        </div>
      </div>

      {realWork.length > 0 && (
        <div className="section">
          <h2>Work history</h2>
          <div className="edge-list">
            {realWork.map((w, i) => (
              <div key={i} className="card">
                <div className="card-title">{w.role}</div>
                <div className="card-sub">{w.company} · {w.years} yrs</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section">
        <h2>Recommended jobs</h2>
        <p className="lede" style={{ fontSize: 13, marginBottom: 12 }}>
          Two-hop traversal: candidate &rarr; skill &rarr; job, ranked by overlap.
        </p>
        {jobs === null ? (
          <Loading label="finding matches" />
        ) : jobs.length === 0 ? (
          <Empty message="No overlapping jobs yet — try adding more skills to this profile." />
        ) : (
          <div className="grid">
            {jobs.map(({ job, company, matchScore, matchedSkills }) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <div className="card-title">{job.title}</div>
                    <div className="card-sub">{company} · {job.location}</div>
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

      <div className="section">
        <h2>Similar candidates</h2>
        <p className="lede" style={{ fontSize: 13, marginBottom: 12 }}>
          Same shape, other direction: candidate &rarr; skill &rarr; other candidate.
        </p>
        {similar === null ? (
          <Loading label="finding overlap" />
        ) : similar.length === 0 ? (
          <Empty message="No one else shares skills with this profile yet." />
        ) : (
          <div className="grid">
            {similar.map(({ candidate: other, sharedSkillCount, sharedSkills }) => (
              <Link key={other.id} to={`/candidates/${other.id}`} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <div className="card-title">{other.name}</div>
                    <div className="card-sub">{other.location} · {other.experienceYears} yrs</div>
                  </div>
                  <span className="score-badge">{sharedSkillCount} shared</span>
                </div>
                <div className="tag-row">
                  {sharedSkills.map((s) => <span key={s} className="tag matched">{s}</span>)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <h2>Referral network</h2>
        <p className="lede" style={{ fontSize: 13, marginBottom: 12 }}>
          Variable-length walk (1–2 hops) through shared employers — colleagues,
          and colleagues of colleagues. This is the query that gets awkward in SQL:
          each extra hop needs another self-join, or a recursive CTE.
        </p>
        {network === null ? (
          <Loading label="walking the network" />
        ) : network.length === 0 ? (
          <Empty message="No connected colleagues in the graph yet." />
        ) : (
          <div className="grid">
            {network.map(({ candidate: c, skills: s }) => (
              <Link key={c.id} to={`/candidates/${c.id}`} className="card">
                <div className="card-title">{c.name}</div>
                <div className="card-sub">{c.location} · {c.experienceYears} yrs</div>
                <div className="tag-row">
                  {s.slice(0, 4).map((sk) => <span key={sk} className="tag">{sk}</span>)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
