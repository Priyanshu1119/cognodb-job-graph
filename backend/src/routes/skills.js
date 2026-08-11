const express = require("express");
const { runQuery } = require("../config/db");
const queries = require("../queries/cypher");

const router = express.Router();

// GET /api/skills/:name/related
router.get("/:name/related", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const rows = await runQuery(queries.getRelatedSkills, {
      skillName: req.params.name,
      limit,
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
