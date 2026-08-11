const express = require("express");
const { runQuery } = require("../config/db");
const queries = require("../queries/cypher");

const router = express.Router();

// GET /api/candidates
router.get("/", async (req, res, next) => {
  try {
    const rows = await runQuery(queries.listCandidates);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/candidates/:id
router.get("/:id", async (req, res, next) => {
  try {
    const rows = await runQuery(queries.getCandidateById, {
      candidateId: req.params.id,
    });
    if (!rows.length || !rows[0].candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/candidates/:id/recommended-jobs
router.get("/:id/recommended-jobs", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const rows = await runQuery(queries.recommendJobsForCandidate, {
      candidateId: req.params.id,
      limit,
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/candidates/:id/similar
router.get("/:id/similar", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const rows = await runQuery(queries.findSimilarCandidates, {
      candidateId: req.params.id,
      limit,
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/candidates/:id/referral-network?hops=2
router.get("/:id/referral-network", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 15;
    const cypher = queries.getReferralNetwork(req.query.hops);
    const rows = await runQuery(cypher, {
      candidateId: req.params.id,
      limit,
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/candidates/:candidateId/skill-gap/:jobId
router.get("/:candidateId/skill-gap/:jobId", async (req, res, next) => {
  try {
    const rows = await runQuery(queries.getSkillGap, {
      candidateId: req.params.candidateId,
      jobId: req.params.jobId,
    });
    res.json(rows[0] || { missingSkills: [] });
  } catch (err) {
    next(err);
  }
});

// POST /api/candidates
// body: { id, name, location, experienceYears, bio, skills: [{name, proficiency}] }
router.post("/", async (req, res, next) => {
  try {
    const { id, name, location, experienceYears, bio, skills } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: "id and name are required" });
    }
    const rows = await runQuery(queries.createCandidate, {
      id,
      name,
      location: location || "",
      experienceYears: experienceYears || 0,
      bio: bio || "",
      skills: skills || [],
    });
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
