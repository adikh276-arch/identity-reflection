import 'dotenv/config';
import { pool } from './src/lib/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function validate() {
  console.log("Starting Database Validation...");

  try {
    // 1. Schema Creation
    console.log("Applying schema...");
    const schemaSql = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log("✔ Schema applied");

    const userId = 999999999;
    const constellationId = '00000000-0000-0000-0000-000000000000';

    // 2. Insert User
    console.log("Inserting test user...");
    await pool.query("INSERT INTO users (id) VALUES ($1) ON CONFLICT (id) DO NOTHING", [userId]);
    console.log("✔ User inserted");

    // 3. Insert Constellation
    console.log("Inserting test constellation...");
    await pool.query("INSERT INTO constellations (id, user_id) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING", [constellationId, userId]);
    await pool.query("INSERT INTO stars (constellation_id, star_id_client, x, y, label) VALUES ($1, $2, $3, $4, $5)", [constellationId, 1, 10.5, 20.5, "Test Star"]);
    console.log("✔ Constellation and stars inserted");

    // 4. Read record
    console.log("Reading test record...");
    const res = await pool.query("SELECT * FROM stars WHERE constellation_id = $1", [constellationId]);
    if (res.rows.length > 0 && res.rows[0].label === "Test Star") {
      console.log("✔ Record read matches");
    } else {
      throw new Error("Read mismatch");
    }

    // 5. Delete record
    console.log("Deleting test records...");
    await pool.query("DELETE FROM constellations WHERE id = $1", [constellationId]);
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    console.log("✔ Records deleted");

    console.log("\nDATABASE VALIDATION SUCCESSFUL! 🚀");
  } catch (err) {
    console.error("\nDATABASE VALIDATION FAILED! ❌");
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

validate();
