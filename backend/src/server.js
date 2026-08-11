require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { verifyConnection, closeDriver } = require("./config/db");

const candidateRoutes = require("./routes/candidates");
const jobRoutes = require("./routes/jobs");
const skillRoutes = require("./routes/skills");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    await verifyConnection();
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    // The app should still respond, just say clearly what's wrong.
    res.status(503).json({ status: "degraded", database: "unreachable", detail: err.message });
  }
});

app.use("/api/candidates", candidateRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/skills", skillRoutes);

// Central error handler. Every route calls next(err) on failure, so a
// dropped CognoDB connection turns into one clean JSON response instead
// of a stack trace or a crashed process.
app.use((err, req, res, next) => {
  console.error(err);
  const isConnectionIssue = /ServiceUnavailable|connect|ECONNREFUSED/i.test(err.message || "");
  res.status(isConnectionIssue ? 503 : 500).json({
    error: isConnectionIssue
      ? "Could not reach the database. Check that your CognoDB instance is running and your .env credentials are correct."
      : "Something went wrong processing that request.",
  });
});

async function start() {
  try {
    await verifyConnection();
    console.log("Connected to CognoDB.");
  } catch (err) {
    console.warn("Warning: could not verify CognoDB connection at startup.");
    console.warn(err.message);
    console.warn("The server will still start, but requests will fail until the database is reachable.");
  }

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

process.on("SIGINT", async () => {
  await closeDriver();
  process.exit(0);
});

start();
