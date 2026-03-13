import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./src/lib/db.js";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Database Schema
async function initDb() {
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, "database", "schema.sql"), "utf8");
    await pool.query(schemaSql);
    console.log("Database schema initialized successfully.");
  } catch (err) {
    console.error("Error initializing database schema:", err);
  }
}

// Subpath hosting: /identity_reflection/
const subpath = "/identity_reflection";

// API Endpoints
app.post(`${subpath}/api/user/init`, async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    // Check if user exists
    const userRes = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
    if (userRes.rows.length === 0) {
      await pool.query("INSERT INTO users (id) VALUES ($1)", [userId]);
    }
    res.json({ success: true, userId });
  } catch (err) {
    console.error("User initialization failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Save Constellation
app.post(`${subpath}/api/constellations`, async (req, res) => {
  const { userId, stars } = req.body;
  if (!userId || !stars) return res.status(400).json({ error: "Missing data" });

  try {
    await pool.query("BEGIN");
    const constellationRes = await pool.query(
      "INSERT INTO constellations (user_id) VALUES ($1) RETURNING id",
      [userId]
    );
    const constellationId = constellationRes.rows[0].id;

    for (const star of stars) {
      await pool.query(
        "INSERT INTO stars (constellation_id, star_id_client, x, y, label) VALUES ($1, $2, $3, $4, $5)",
        [constellationId, star.id, star.x, star.y, star.label]
      );
    }
    await pool.query("COMMIT");
    res.json({ success: true, id: constellationId });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Constellation save failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get Constellations
app.get(`${subpath}/api/constellations`, async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    // Phase 12: Enforce User Isolation
    const resConsts = await pool.query(
      `SELECT c.id, c.created_at as "createdAt",
       COALESCE(json_agg(json_build_object(
         'id', s.star_id_client,
         'x', s.x,
         'y', s.y,
         'label', s.label
       )) FILTER (WHERE s.id IS NOT NULL), '[]') as stars
       FROM constellations c
       LEFT JOIN stars s ON c.id = s.constellation_id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [userId]
    );
    res.json(resConsts.rows);
  } catch (err) {
    console.error("Fetch constellations failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete Constellation
app.delete(`${subpath}/api/constellations/:id`, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;
  if (!id || !userId) return res.status(400).json({ error: "Missing data" });

  try {
    const delRes = await pool.query(
      "DELETE FROM constellations WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (delRes.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Static files
app.use(subpath, express.static(path.join(__dirname, "dist")));

// Fallback to index.html for SPA routing
app.get(`${subpath}*`, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Redirect root to subpath
app.get("/", (req, res) => {
  res.redirect(subpath);
});

initDb().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}${subpath}`);
  });
});
