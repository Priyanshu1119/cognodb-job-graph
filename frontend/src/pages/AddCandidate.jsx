import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { ErrorBlock } from "../components/StateBlock";

function slugify(name) {
  return "c-" + name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);
}

export default function AddCandidate() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState([{ name: "", proficiency: "intermediate" }]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function updateSkill(i, field, value) {
    setSkills((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const id = slugify(name);
      const cleanSkills = skills.filter((s) => s.name.trim());
      const result = await api.createCandidate({
        id,
        name,
        location,
        experienceYears: Number(experienceYears) || 0,
        bio,
        skills: cleanSkills,
      });
      navigate(`/candidates/${result.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link to="/" style={{ fontSize: 13, color: "var(--ink-soft)" }}>&larr; back</Link>
      <div className="eyebrow" style={{ marginTop: 14 }}>new node</div>
      <h1>Add a candidate</h1>
      <p className="lede">Creates a Candidate node and merges HAS_SKILL edges to each skill.</p>

      {error && <div className="section"><ErrorBlock message={error} /></div>}

      <form className="form-grid section" onSubmit={handleSubmit}>
        <label>
          Full name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Sharma" />
        </label>
        <label>
          Location
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Agra" />
        </label>
        <label>
          Years of experience
          <input type="number" min="0" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
        </label>
        <label>
          Short bio
          <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
        </label>

        <div>
          <h3>Skills</h3>
          {skills.map((s, i) => (
            <div key={i} className="skill-row" style={{ marginBottom: 8 }}>
              <input
                placeholder="Skill name"
                value={s.name}
                onChange={(e) => updateSkill(i, "name", e.target.value)}
              />
              <select value={s.proficiency} onChange={(e) => updateSkill(i, "proficiency", e.target.value)}>
                <option value="beginner">beginner</option>
                <option value="intermediate">intermediate</option>
                <option value="advanced">advanced</option>
              </select>
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
            onClick={() => setSkills((prev) => [...prev, { name: "", proficiency: "intermediate" }])}
          >
            + Add skill row
          </button>
        </div>

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Create candidate"}
        </button>
      </form>
    </div>
  );
}
