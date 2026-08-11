import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { ErrorBlock } from "../components/StateBlock";

function slugify(prefix, name) {
  return prefix + "-" + name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);
}

export default function AddJob() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [seniority, setSeniority] = useState("Junior");
  const [description, setDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [skills, setSkills] = useState([{ name: "", weight: 2 }]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function updateSkill(i, field, value) {
    setSkills((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !companyName.trim()) {
      setError("Job title and company name are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const id = slugify("j", title);
      const companyId = slugify("co", companyName);
      const cleanSkills = skills
        .filter((s) => s.name.trim())
        .map((s) => ({ name: s.name, weight: Number(s.weight) || 1 }));

      const result = await api.createJob({
        id,
        title,
        location,
        seniority,
        description,
        companyId,
        companyName,
        companyIndustry,
        skills: cleanSkills,
      });
      navigate(`/jobs/${result.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link to="/" style={{ fontSize: 13, color: "var(--ink-soft)" }}>&larr; back</Link>
      <div className="eyebrow" style={{ marginTop: 14 }}>new node</div>
      <h1>Add a job</h1>
      <p className="lede">
        Creates or reuses a Company node, creates a Job node, and merges
        REQUIRES_SKILL edges to each listed skill.
      </p>

      {error && <div className="section"><ErrorBlock message={error} /></div>}

      <form className="form-grid section" onSubmit={handleSubmit}>
        <label>
          Job title
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Backend Engineer" />
        </label>
        <label>
          Company name
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Acme Corp" />
        </label>
        <label>
          Company industry
          <input value={companyIndustry} onChange={(e) => setCompanyIndustry(e.target.value)} placeholder="e.g. Fintech" />
        </label>
        <label>
          Location
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Remote" />
        </label>
        <label>
          Seniority
          <select value={seniority} onChange={(e) => setSeniority(e.target.value)}>
            <option>Junior</option>
            <option>Mid</option>
            <option>Senior</option>
          </select>
        </label>
        <label>
          Description
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <div>
          <h3>Required skills</h3>
          {skills.map((s, i) => (
            <div key={i} className="skill-row" style={{ marginBottom: 8 }}>
              <input
                placeholder="Skill name"
                value={s.name}
                onChange={(e) => updateSkill(i, "name", e.target.value)}
              />
              <input
                type="number"
                min="1"
                max="3"
                value={s.weight}
                onChange={(e) => updateSkill(i, "weight", e.target.value)}
                title="Importance weight, 1-3"
              />
              <button
                type="button"
                className="btn secondary"
                onClick={() => setSkills((prev) => prev.filter((_, idx) => idx !== i))}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn secondary"
            onClick={() => setSkills((prev) => [...prev, { name: "", weight: 2 }])}
          >
            + Add skill row
          </button>
        </div>

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Create job"}
        </button>
      </form>
    </div>
  );
}
