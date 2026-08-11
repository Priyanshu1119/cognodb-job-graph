const express = require("express");
const { runQuery } = require("../config/db");
const queries = require("../queries/cypher");

const router = express.Router();

// GET /api/jobs
router.get("/", async (req, res, next) => {
  try {
    const rows = await runQuery(queries.listJobs);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs/:id
router.get("/:id", async (req, res, next) => {
  try {
    const rows = await runQuery(queries.getJobById, { jobId: req.params.id });
    if (!rows.length || !rows[0].job) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs/:id/matched-candidates
router.get("/:id/matched-candidates", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const rows = await runQuery(queries.matchCandidatesForJob, {
      jobId: req.params.id,
      limit,
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs
// body: { id, title, location, seniority, description,
//         companyId, companyName, companyIndustry,
//         skills: [{name, weight}] }
router.post("/", async (req, res, next) => {
  try {
    const {
      id, title, location, seniority, description,
      companyId, companyName, companyIndustry, skills,
    } = req.body;
    if (!id || !title || !companyId || !companyName) {
      return res.status(400).json({
        error: "id, title, companyId and companyName are required",
      });
    }
    const rows = await runQuery(queries.createJob, {
      id,
      title,
      location: location || "",
      seniority: seniority || "",
      description: description || "",
      companyId,
      companyName,
      companyIndustry: companyIndustry || "",
      skills: skills || [],
    });
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/:id/apply
// body: { candidateId, status }
router.post("/:id/apply", async (req, res, next) => {
  try {
    const { candidateId, status } = req.body;
    if (!candidateId) {
      return res.status(400).json({ error: "candidateId is required" });
    }
    const rows = await runQuery(queries.applyToJob, {
      candidateId,
      jobId: req.params.id,
      status: status || "applied",
    });
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
