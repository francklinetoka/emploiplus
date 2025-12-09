// backend/src/server.ts
import express from "express";
import cors from "cors";
import { pool } from "./config/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "secret123";

// ──────────────────────────────────────────────────
// 1. AUTH — INSCRIPTION & CONNEXION ADMIN
// ──────────────────────────────────────────────────
app.post("/api/admin/register", async (req, res) => {
  try {
    const { email, password, full_name, role = "admin" } = req.body;

    const { rows: existing } = await pool.query("SELECT id FROM admins WHERE email = $1", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Cet email est déjà utilisé" });
    }

    const hashed = bcrypt.hashSync(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO admins (email, password, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, created_at`,
      [email, hashed, full_name || null, role]
    );

    const admin = rows[0];
    const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, token, admin });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query("SELECT * FROM admins WHERE email = $1", [email]);
    const admin = rows[0];

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ success: false, message: "Identifiants incorrects" });
    }

    const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: "7d" });
    const { password: _, ...safeAdmin } = admin;

    res.json({ success: true, token, admin: safeAdmin });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false });
  }
});

// ──────────────────────────────────────────────────
// 2. OFFRES D'EMPLOI — API COMPLÈTE
// ──────────────────────────────────────────────────
app.get("/api/jobs", async (_, res) => {
  const { rows } = await pool.query("SELECT * FROM jobs ORDER BY created_at DESC");
  res.json(rows);
});

app.post("/api/jobs", async (req, res) => {
  try {
    const { title, company, location, type, salary, description } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO jobs (title, company, location, type, salary, description, published)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`,
      [title, company, location, type, salary || null, description]
    );
    res.json({ success: true, job: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.put("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, company, location, type, salary, description } = req.body;
    await pool.query(
      `UPDATE jobs SET title=$1, company=$2, location=$3, type=$4, salary=$5, description=$6 WHERE id=$7`,
      [title, company, location, type, salary || null, description, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.patch("/api/jobs/:id/publish", async (req, res) => {
  try {
    const { id } = req.params;
    const { published } = req.body;
    await pool.query("UPDATE jobs SET published = $1 WHERE id = $2", [published, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.delete("/api/jobs/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM jobs WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ──────────────────────────────────────────────────
// 3. FORMATIONS — API COMPLÈTE
// ──────────────────────────────────────────────────
app.get("/api/formations", async (_, res) => {
  const { rows } = await pool.query("SELECT * FROM formations ORDER BY created_at DESC");
  res.json(rows);
});

app.post("/api/formations", async (req, res) => {
  try {
    const { title, category, level, duration, price, description } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO formations (title, category, level, duration, price, description, published)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`,
      [title, category, level, duration, price || null, description]
    );
    res.json({ success: true, formation: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ──────────────────────────────────────────────────
// 4. GESTION DES ADMINS — API COMPLÈTE
// ──────────────────────────────────────────────────
app.get("/api/admins", async (_, res) => {
  const { rows } = await pool.query(
    "SELECT id, email, full_name, role, created_at FROM admins ORDER BY created_at DESC"
  );
  res.json(rows);
});

// Création par Super Admin
app.post("/api/admin/create", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false });

    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== "super_admin") {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const { email, password, full_name, role = "admin" } = req.body;
    const check = await pool.query("SELECT id FROM admins WHERE email = $1", [email]);
    if (check.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Email déjà utilisé" });
    }

    const hashed = bcrypt.hashSync(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO admins (email, password, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role`,
      [email, hashed, full_name || null, role]
    );

    res.json({ success: true, admin: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ──────────────────────────────────────────────────
// 5. STATISTIQUES POUR LE DASHBOARD (DYNAMIQUE)
// ──────────────────────────────────────────────────
app.get("/api/stats", async (_, res) => {
  try {
    const [jobs, formations, admins] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM jobs"),
      pool.query("SELECT COUNT(*) FROM formations"),
      pool.query("SELECT COUNT(*) FROM admins"),
    ]);

    res.json({
      jobs: parseInt(jobs.rows[0].count),
      formations: parseInt(formations.rows[0].count),
      admins: parseInt(admins.rows[0].count),
      users: 1842, // à connecter plus tard
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur stats" });
  }
});

app.listen(5000, () => {
  console.log("Backend prêt → http://localhost:5000");
});