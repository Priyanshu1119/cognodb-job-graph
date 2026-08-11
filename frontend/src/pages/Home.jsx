import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Loading, ErrorBlock, Empty } from "../components/StateBlock";

export default function Home() {
  const [tab, setTab] = useState("candidates");
  const [candidates, setCandidates] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    Promise.all([api.listCandidates(), api.listJobs()])
      .then(([c, j]) => {
        setCandidates(c);
        setJobs(j);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <ErrorBlock message={error} />;
  if (!candidates || !jobs) return <Loading label="loading the graph" />;

  const q = query.trim().toLowerCase();

  const filteredCandidates = candidates.filter((row) => {
    if (!q) return true;
    return (
      row.candidate.name.toLowerCase().includes(q) ||
      row.skills.some((s) => s.toLowerCase().includes(q))
    );
  });

  const filteredJobs = jobs.filter((row) => {
    if (!q) return true;
    return (
      row.job.title.toLowerCase().includes(q) ||
      row.company.name.toLowerCase().includes(q) ||
      row.requiredSkills.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div className="eyebrow">skillgraph · candidate ↔ job graph</div>
      <h1>Two ways into the same graph.</h1>
      <p className="lede">
        Every candidate, job, company and skill here is a node. Browse from either
        side — the matches underneath are the same traversal either way.
      </p>

      <div className="search-bar" style={{ marginTop: 24 }}>
        <input
          placeholder="Search by name, title, company or skill..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="topnav" style={{ marginBottom: 18 }}>
        <a
          className={tab === "candidates" ? "active" : ""}
          onClick={() => setTab("candidates")}
          style={{ cursor: "pointer" }}
        >
          Candidates ({filteredCandidates.length})
        </a>
        <a
          className={tab === "jobs" ? "active" : ""}
          onClick={() => setTab("jobs")}
          style={{ cursor: "pointer" }}
        >
          Jobs ({filteredJobs.length})
        </a>
        <Link to="/add-candidate" style={{ marginLeft: "auto" }}>+ Add candidate</Link>
        <Link to="/add-job">+ Add job</Link>
      </div>

      {tab === "candidates" && (
        filteredCandidates.length === 0 ? (
          <Empty message="No candidates match that search." />
        ) : (
          <div className="grid">
            {filteredCandidates.map(({ candidate, skills }) => (
              <Link key={candidate.id} to={`/candidates/${candidate.id}`} className="card">
                <div className="card-title">{candidate.name}</div>
                <div className="card-sub">{candidate.location} · {candidate.experienceYears} yrs exp</div>
                <div className="tag-row">
                  {skills.slice(0, 5).map((s) => <span key={s} className="tag">{s}</span>)}
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {tab === "jobs" && (
        filteredJobs.length === 0 ? (
          <Empty message="No jobs match that search." />
        ) : (
          <div className="grid">
            {filteredJobs.map(({ job, company, requiredSkills }) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="card">
                <div className="card-title">{job.title}</div>
                <div className="card-sub">{company.name} · {job.location} · {job.seniority}</div>
                <div className="tag-row">
                  {requiredSkills.slice(0, 5).map((s) => <span key={s} className="tag">{s}</span>)}
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
