import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { sql } from "@vercel/postgres";

// Database initialization logic
let db: any;
const isPostgres = !!process.env.POSTGRES_URL;

async function initDb() {
  if (isPostgres) {
    console.log("Using Vercel Postgres");
    await sql`
      CREATE TABLE IF NOT EXISTS rsvps (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        attending BOOLEAN NOT NULL,
        dish TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  } else {
    console.log("Using SQLite");
    db = new Database("potluck.db");
    db.exec(`
      CREATE TABLE IF NOT EXISTS rsvps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        attending BOOLEAN NOT NULL,
        dish TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
}

// Call init
initDb().catch(console.error);

const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes
app.get("/api/rsvps", async (req, res) => {
  try {
    let rsvps;
    if (isPostgres) {
      const result = await sql`SELECT * FROM rsvps ORDER BY created_at DESC`;
      rsvps = result.rows;
    } else {
      rsvps = db.prepare("SELECT * FROM rsvps ORDER BY created_at DESC").all();
    }
    res.json(rsvps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch RSVPs" });
  }
});

app.delete("/api/rsvps", async (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD || "admin";
  const providedPassword = req.headers["x-admin-password"];

  if (providedPassword !== adminPassword) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    if (isPostgres) {
      await sql`DELETE FROM rsvps`;
    } else {
      db.prepare("DELETE FROM rsvps").run();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to wipe RSVPs" });
  }
});

app.post("/api/rsvps", async (req, res) => {
  const { name, attending, dish } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }

  const trimmedName = name.trim();

  try {
    let existing;
    if (isPostgres) {
      const result = await sql`SELECT id FROM rsvps WHERE LOWER(name) = LOWER(${trimmedName}) LIMIT 1`;
      existing = result.rows[0];
    } else {
      existing = db.prepare("SELECT id FROM rsvps WHERE LOWER(name) = LOWER(?)").get(trimmedName);
    }
    
    if (existing) {
      if (isPostgres) {
        await sql`
          UPDATE rsvps 
          SET attending = ${attending}, dish = ${dish || null} 
          WHERE id = ${existing.id}
        `;
      } else {
        const update = db.prepare(
          "UPDATE rsvps SET attending = ?, dish = ? WHERE id = ?"
        );
        update.run(attending ? 1 : 0, dish || null, existing.id);
      }
      return res.status(200).json({ success: true, updated: true });
    }

    if (isPostgres) {
      await sql`
        INSERT INTO rsvps (name, attending, dish) 
        VALUES (${trimmedName}, ${attending}, ${dish || null})
      `;
    } else {
      const insert = db.prepare(
        "INSERT INTO rsvps (name, attending, dish) VALUES (?, ?, ?)"
      );
      insert.run(trimmedName, attending ? 1 : 0, dish || null);
    }
    res.status(201).json({ success: true, updated: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save RSVP" });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(process.cwd(), "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(process.cwd(), "dist/index.html"));
  });
}

if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
