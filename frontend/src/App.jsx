import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import CandidateDetail from "./pages/CandidateDetail";
import JobDetail from "./pages/JobDetail";
import AddCandidate from "./pages/AddCandidate";
import AddJob from "./pages/AddJob";
import BrandMark from "./components/BrandMark";
import { api } from "./api/client";

export default function App() {
  const location = useLocation();
  const [dbDown, setDbDown] = useState(false);

  useEffect(() => {
    api.health().catch(() => setDbDown(true));
  }, []);

  return (
    <div className="app-shell">
      <div className="topbar">
        <Link to="/" className="brand">
          <BrandMark />
          Skillgraph
        </Link>
        <div className="topnav">
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>Browse</Link>
        </div>
      </div>

      {dbDown && (
        <div className="error-state section" style={{ marginTop: 0, marginBottom: 24 }}>
          <strong>Database unreachable.</strong> The API is up but can't reach CognoDB
          right now. Pages will show this same message instead of crashing until the
          connection is back.
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/candidates/:id" element={<CandidateDetail />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/add-candidate" element={<AddCandidate />} />
        <Route path="/add-job" element={<AddJob />} />
        <Route path="*" element={<p>Page not found. <Link to="/">Go back home.</Link></p>} />
      </Routes>
    </div>
  );
}
