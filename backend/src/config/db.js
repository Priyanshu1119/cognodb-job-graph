const neo4j = require("neo4j-driver");

let driver = null;

function getDriver() {
  if (driver) return driver;

  const { COGNODB_URI, COGNODB_USER, COGNODB_PASSWORD } = process.env;

  if (!COGNODB_URI || !COGNODB_USER || !COGNODB_PASSWORD) {
    throw new Error(
      "Missing CognoDB connection details. Set COGNODB_URI, COGNODB_USER and COGNODB_PASSWORD in your .env file."
    );
  }

  driver = neo4j.driver(
    COGNODB_URI,
    neo4j.auth.basic(COGNODB_USER, COGNODB_PASSWORD),
    { maxConnectionPoolSize: 20 }
  );

  return driver;
}

// Called once at server startup so we fail fast with a clear message
// instead of letting every route hit a confusing connection error.
async function verifyConnection() {
  const d = getDriver();
  await d.verifyConnectivity();
}

// Neo4j returns large numbers as {low, high} Integer objects instead of
// plain JS numbers, so we recursively convert them before sending JSON
// to the frontend, otherwise React crashes trying to render an object.
function cleanRecord(value) {
  if (value === null || value === undefined) return value;
  if (neo4j.isInt(value)) return value.toNumber();
  if (Array.isArray(value)) return value.map(cleanRecord);
  if (typeof value === "object") {
    if (value.properties) {
      // Neo4j Node/Relationship objects: flatten to just their properties
      return cleanRecord(value.properties);
    }
    const result = {};
    for (const key in value) {
      result[key] = cleanRecord(value[key]);
    }
    return result;
  }
  return value;
}

// Every route goes through this helper so a session is always opened
// and closed correctly, and driver errors turn into a clean JSON response
// instead of crashing the process.
async function runQuery(cypher, params = {}) {
  const session = getDriver().session();
  try {
    const result = await session.run(cypher, params);
    return result.records.map((r) => cleanRecord(r.toObject()));
  } finally {
    await session.close();
  }
}

async function closeDriver() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

module.exports = { getDriver, verifyConnection, runQuery, closeDriver };