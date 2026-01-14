// backend/src/server.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pool, isConnected } from "./config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from 'fs';
import path from 'path';
const app = express();
// Security middlewares
app.use(helmet());
// CORS: allow origins configured via CORS_ORIGINS env (comma-separated), fallback to localhost during dev
// Include common dev ports (Vite default 5173 and alternate 5174)
const rawOrigins = process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174';
const allowedOrigins = rawOrigins.split(',').map((s) => s.trim());
app.use(cors({ origin: (origin, cb) => {
        if (!origin)
            return cb(null, true); // allow non-browser requests like curl/postman
        if (allowedOrigins.includes(origin))
            return cb(null, true);
        return cb(new Error('Origin not allowed'));
    } }));
// Limit JSON body size to mitigate large payload attacks
// Increased to 10mb to allow base64 image uploads from the frontend
app.use(express.json({ limit: '10mb' }));
// Rate limiter for API endpoints
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use('/api/', apiLimiter);
// JWT secret must come from env in production
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';
if (!isConnected) {
    console.warn("Database unavailable — skipping initial table creation and migrations.");
}
else {
    // Ensure the `faqs` table exists
    pool.query(`CREATE TABLE IF NOT EXISTS faqs (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`).catch((err) => console.error("Could not ensure faqs table exists:", err));
    // Ensure the `jobs` table exists (including optional sector column)
    pool.query(`CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT,
    location TEXT,
    sector TEXT,
    type TEXT,
    salary TEXT,
    description TEXT,
    image_url TEXT,
    application_url TEXT,
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure jobs table exists:", err));
    // Add application_url column if it doesn't exist
    pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS application_url TEXT`).catch((err) => console.error("Could not add application_url column:", err));
    // Ensure the `formations` table exists
    pool.query(`CREATE TABLE IF NOT EXISTS formations (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    level TEXT,
    duration TEXT,
    price TEXT,
    description TEXT,
    image_url TEXT,
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure formations table exists:", err));
    // Ensure basic `admins` table exists (safe to run)
    pool.query(`CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure admins table exists:", err));
    // Ensure `users` table exists with proper structure
    pool.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    user_type TEXT NOT NULL DEFAULT 'candidate',
    phone TEXT,
    company_name TEXT,
    company_address TEXT,
    profession TEXT,
    job_title TEXT,
    diploma TEXT,
    experience_years INTEGER DEFAULT 0,
    profile_image_url TEXT,
    skills JSONB DEFAULT '[]',
    is_verified BOOLEAN DEFAULT false,
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure users table exists:", err));
    // Add any missing columns to existing table
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_contract_type TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_sector TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_location TEXT`).catch((err) => { });
    // Ensure users have a country column to enforce registration locality
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT`).catch((err) => { });
    // Add additional personal fields if missing
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS birthdate DATE`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT`).catch((err) => { });
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS nationality TEXT`).catch((err) => { });
    // Ensure publications table exists for newsfeed
    pool.query(`CREATE TABLE IF NOT EXISTS publications (
    id SERIAL PRIMARY KEY,
    author_id INTEGER,
    content TEXT,
    hashtags TEXT[],
    visibility TEXT DEFAULT 'public',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure publications table exists:", err));
    // Ensure `portfolios` (réalisations) table exists for dynamic portfolio management
    pool.query(`CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    project_url TEXT,
    service_category TEXT NOT NULL,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure portfolios table exists:", err));
    // Ensure `communication_channels` table exists
    pool.query(`CREATE TABLE IF NOT EXISTS communication_channels (
    id SERIAL PRIMARY KEY,
    channel_name TEXT NOT NULL,
    channel_url TEXT NOT NULL,
    channel_type TEXT NOT NULL,
    icon_name TEXT,
    display_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure communication_channels table exists:", err));
    // Ensure `service_catalogs` table exists for service catalog management
    pool.query(`CREATE TABLE IF NOT EXISTS service_catalogs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price INTEGER,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure service_catalogs table exists:", err));
    // Add optional columns for promotions and new flag if missing
    pool.query(`ALTER TABLE service_catalogs ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false`).catch(() => { });
    pool.query(`ALTER TABLE service_catalogs ADD COLUMN IF NOT EXISTS promotion TEXT`).catch(() => { });
    // Ensure `visitor_interactions` table exists to store basic analytics/events
    pool.query(`CREATE TABLE IF NOT EXISTS visitor_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NULL,
    service TEXT,
    event_type TEXT,
    payload JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure visitor_interactions table exists:", err));
    // Ensure `user_documents` table exists for user-uploaded documents (CV, certificates, etc.)
    pool.query(`CREATE TABLE IF NOT EXISTS user_documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    doc_type TEXT NOT NULL,
    title TEXT,
    storage_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`).catch((err) => console.error("Could not ensure user_documents table exists:", err));
    // Ensure `user_skills` table exists for user skills/recommendations
    pool.query(`CREATE TABLE IF NOT EXISTS user_skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    skill_name TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`).catch((err) => console.error("Could not ensure user_skills table exists:", err));
    // Ensure verification requests table exists for account certification workflow
    pool.query(`CREATE TABLE IF NOT EXISTS verification_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    requested_name TEXT,
    phone TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, revoked
    admin_id INTEGER,
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`).catch((err) => console.error("Could not ensure verification_requests table exists:", err));
    // Notifications table for simple in-app notifications
    pool.query(`CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`).catch((err) => console.error("Could not ensure notifications table exists:", err));
        // Site-wide notifications targeting candidates/companies/all
        pool.query(`CREATE TABLE IF NOT EXISTS site_notifications (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT,
        target TEXT DEFAULT 'all',
        category TEXT,
        image_url TEXT,
        link TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    )`).catch((err) => console.error("Could not ensure site_notifications table exists:", err));
        // Track which users have read which site notifications
        pool.query(`CREATE TABLE IF NOT EXISTS site_notification_reads (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        site_notification_id INTEGER NOT NULL,
        read_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (site_notification_id) REFERENCES site_notifications(id) ON DELETE CASCADE,
        UNIQUE (user_id, site_notification_id)
    )`).catch((err) => console.error("Could not ensure site_notification_reads table exists:", err));
}
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
        const { rows } = await pool.query(`INSERT INTO admins (email, password, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, created_at`, [email, hashed, full_name || null, role]);
        const admin = rows[0];
        const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: "7d" });
        res.json({ success: true, token, admin });
    }
    catch (err) {
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
    }
    catch (err) {
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
        const { title, company, location, sector = null, type, salary, description, application_url } = req.body;
        const { rows } = await pool.query(`INSERT INTO jobs (title, company, location, sector, type, salary, description, application_url, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
       RETURNING *`, [title, company, location, sector, type, salary || null, description, application_url || null]);
        res.json({ success: true, job: rows[0] });
    }
    catch (err) {
        console.error("Error creating job:", err);
        res.status(500).json({ success: false, message: err.message || "Erreur serveur" });
    }
});
app.put("/api/jobs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, company, location, sector = null, type, salary, description, application_url } = req.body;
        await pool.query(`UPDATE jobs SET title=$1, company=$2, location=$3, sector=$4, type=$5, salary=$6, description=$7, application_url=$8 WHERE id=$9`, [title, company, location, sector, type, salary || null, description, application_url || null, id]);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
app.patch("/api/jobs/:id/publish", async (req, res) => {
    try {
        const { id } = req.params;
        const { published } = req.body;
        if (published) {
            await pool.query("UPDATE jobs SET published = $1, published_at = NOW() WHERE id = $2", [published, id]);
        }
        else {
            await pool.query("UPDATE jobs SET published = $1, published_at = NULL WHERE id = $2", [published, id]);
        }
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
app.delete("/api/jobs/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM jobs WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    }
    catch (err) {
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
        const { rows } = await pool.query(`INSERT INTO formations (title, category, level, duration, price, description, published)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`, [title, category, level, duration, price || null, description]);
        res.json({ success: true, formation: rows[0] });
    }
    catch (err) {
        console.error("Error creating formation:", err);
        res.status(500).json({ success: false, message: err.message || "Erreur serveur" });
    }
});
app.put("/api/formations/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, level, duration, price, description } = req.body;
        const { rows } = await pool.query(`UPDATE formations SET title=$1, category=$2, level=$3, duration=$4, price=$5, description=$6 WHERE id=$7
       RETURNING *`, [title, category, level, duration, price || null, description, id]);
        res.json({ success: true, formation: rows[0] });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
app.patch("/api/formations/:id/publish", async (req, res) => {
    try {
        const { id } = req.params;
        const { published } = req.body;
        if (published) {
            await pool.query("UPDATE formations SET published = $1, published_at = NOW() WHERE id = $2", [published, id]);
        }
        else {
            await pool.query("UPDATE formations SET published = $1, published_at = NULL WHERE id = $2", [published, id]);
        }
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
app.delete("/api/formations/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM formations WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// 4. GESTION DES ADMINS — API COMPLÈTE
// ──────────────────────────────────────────────────
app.get("/api/admins", async (_, res) => {
    const { rows } = await pool.query("SELECT id, email, full_name, role, created_at FROM admins ORDER BY created_at DESC");
    res.json(rows);
});
// Création par Super Admin
app.post("/api/admin/create", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token)
            return res.status(401).json({ success: false });
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== "super_admin") {
            return res.status(403).json({ success: false, message: "Accès refusé" });
        }
        const { email, password, full_name, role = "admin" } = req.body;
        const check = await pool.query("SELECT id FROM admins WHERE email = $1", [email]);
        if (check.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Email déjà utilisé" });
        }
        const hashed = bcrypt.hashSync(password, 10);
        const { rows } = await pool.query(`INSERT INTO admins (email, password, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role`, [email, hashed, full_name || null, role]);
        res.json({ success: true, admin: rows[0] });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// 5. UTILISATEURS — API COMPLÈTE
// ──────────────────────────────────────────────────
app.get("/api/users", async (_, res) => {
    try {
        const { rows } = await pool.query("SELECT id, full_name, email, user_type, created_at, is_blocked FROM users ORDER BY created_at DESC");
        res.json(rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
app.post("/api/users", async (req, res) => {
    try {
        const { full_name, email, user_type } = req.body;
        const { rows } = await pool.query(`INSERT INTO users (full_name, email, user_type)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email, user_type, created_at, is_blocked`, [full_name, email, user_type]);
        res.json({ success: true, user: rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
// Public registration endpoint for candidates and companies
app.post("/api/register", async (req, res) => {
    try {
        const { email, password, user_type = "candidate", full_name, company_name, company_address, phone, country } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: "Email et mot de passe requis" });
        // Basic validations
        const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailRe.test(String(email)))
            return res.status(400).json({ success: false, message: 'Email invalide' });
        if (String(password).length < 8)
            return res.status(400).json({ success: false, message: 'Mot de passe trop court (>=8 caractères)' });
        if (phone && !/^[0-9+\-\s()]{6,20}$/.test(String(phone)))
            return res.status(400).json({ success: false, message: 'Numéro de téléphone invalide' });
        const { rows: existing } = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existing.length > 0)
            return res.status(400).json({ success: false, message: "Email déjà utilisé" });
        // Enforce registration limited to République du Congo (server-side)
        if (!country || String(country).toLowerCase().indexOf('congo') === -1) {
            return res.status(403).json({ success: false, message: 'Inscription autorisée uniquement depuis la République du Congo' });
        }
        const hashed = bcrypt.hashSync(password, 10);
        const { rows } = await pool.query(`INSERT INTO users (full_name, email, password, user_type, company_name, company_address, phone, country, is_verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false)
       RETURNING id, full_name, email, user_type, company_name, company_address, phone, country, created_at`, [full_name || null, email, hashed, user_type, company_name || null, company_address || null, phone || null, country || null]);
        const user = rows[0];
        const token = jwt.sign({ id: user.id, role: user.user_type }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user });
    }
    catch (err) {
        console.error('Register user error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});
// Public login for users
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = rows[0];
        if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
        }
        const { password: _, ...safeUser } = user;
        const token = jwt.sign({ id: user.id, role: user.user_type }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user: safeUser });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});
const userAuth = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth)
        return res.status(401).json({ success: false, message: 'Token manquant' });
    const token = (auth.split(' ')[1] || "");
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    }
    catch (err) {
        console.error('userAuth verify error (JS runtime):', err && err.stack ? err.stack : err);
        return res.status(401).json({ success: false, message: 'Token invalide' });
    }
};
// Admin auth middleware - only allow admin roles
const adminAuth = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth)
        return res.status(401).json({ success: false, message: 'Token manquant' });
    const token = (auth.split(' ')[1] || "");
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const allowed = ['admin', 'super_admin', 'admin_content'];
        if (!decoded.role || !allowed.includes(decoded.role)) {
            return res.status(403).json({ success: false, message: 'Accès admin requis' });
        }
        req.userId = decoded.id; // admin id
        req.userRole = decoded.role;
        next();
    }
    catch (err) {
        return res.status(401).json({ success: false, message: 'Token invalide' });
    }
};
// Get current user profile
app.get('/api/users/me', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { rows } = await pool.query('SELECT id, full_name, email, user_type, company_name, company_address, phone, profession, job_title, diploma, experience_years, profile_image_url, skills, is_verified, country, city, address, birthdate, gender, nationality, created_at FROM users WHERE id = $1', [userId]);
        res.json(rows[0]);
    }
    catch (err) {
        console.error('Get profile error (JS runtime):', err && err.stack ? err.stack : err);
        // attempt a minimal fallback query
        try {
            const { rows: smallRows } = await pool.query('SELECT id, full_name, email, user_type, created_at FROM users WHERE id = $1', [req.userId]);
            if (smallRows && smallRows.length > 0) return res.json(smallRows[0]);
        } catch (fallbackErr) {
            console.error('Fallback profile query failed (JS runtime):', fallbackErr && fallbackErr.stack ? fallbackErr.stack : fallbackErr);
        }
        res.status(500).json({ success: false });
    }
});
// Update current user profile (including profile_image_url)
app.put('/api/users/me', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { full_name, company_name, company_address, phone, profession, job_title, diploma, experience_years, profile_image_url, skills, country, city, address, birthdate, gender, nationality } = req.body;
        const { rows } = await pool.query(`UPDATE users SET full_name=$1, company_name=$2, company_address=$3, phone=$4, profession=$5, job_title=$6, diploma=$7, experience_years=$8, profile_image_url=$9, skills=$10, country=$11, city=$12, address=$13, birthdate=$14, gender=$15, nationality=$16 WHERE id=$17 RETURNING id, full_name, email, user_type, company_name, company_address, phone, profession, job_title, diploma, experience_years, profile_image_url, skills, country, city, address, birthdate, gender, nationality, is_verified, created_at`, [full_name || null, company_name || null, company_address || null, phone || null, profession || null, job_title || null, diploma || null, experience_years || 0, profile_image_url || null, skills || null, country || null, city || null, address || null, birthdate || null, gender || null, nationality || null, userId]);
        res.json(rows[0]);
    }
    catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ success: false });
    }
});
// Change password endpoint
app.put('/api/users/me/password', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Ancien et nouveau mot de passe requis' });
        }
        // Get user current password
        const { rows: users } = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
        const user = users[0];
        if (!user || !user.password || !bcrypt.compareSync(oldPassword, user.password)) {
            return res.status(401).json({ success: false, message: 'Ancien mot de passe incorrect' });
        }
        // Hash new password
        const hashed = bcrypt.hashSync(newPassword, 10);
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, userId]);
        res.json({ success: true, message: 'Mot de passe changé avec succès' });
    }
    catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ success: false });
    }
});
// Delete account endpoint
app.delete('/api/users/me', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ success: false, message: 'Mot de passe requis' });
        }
        // Verify password before deletion
        const { rows: users } = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
        const user = users[0];
        if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
        }
        // Delete user
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
        res.json({ success: true, message: 'Compte supprimé avec succès' });
    }
    catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ success: false });
    }
});
// Get recommended jobs for authenticated user
app.get("/api/jobs/recommendations/for-me", userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        // Companies should not get job recommendations
        if (req.userRole && String(req.userRole).toLowerCase() === 'company') {
            return res.json([]);
        }
        // Get user profile with preferences
        const { rows: userRows } = await pool.query(`SELECT profession, skills, preferred_sector, preferred_location, preferred_contract_type 
       FROM users WHERE id = $1`, [userId]);
        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const user = userRows[0];
        const profession = String(user.profession || "").toLowerCase();
        const skills = Array.isArray(user.skills) ? user.skills : [];
        const preferredSector = String(user.preferred_sector || "").toLowerCase();
        const preferredLocation = String(user.preferred_location || "").toLowerCase();
        const preferredType = String(user.preferred_contract_type || "").toLowerCase();
        // Get all jobs
        const { rows: jobs } = await pool.query("SELECT * FROM jobs WHERE published = true ORDER BY created_at DESC LIMIT 50");
        // Score and recommend jobs
        const recommendations = jobs.map((job) => {
            let score = 0;
            const title = String(job.title || "").toLowerCase();
            const desc = String(job.description || "").toLowerCase();
            const sector = String(job.sector || "").toLowerCase();
            const location = String(job.location || "").toLowerCase();
            const type = String(job.type || "").toLowerCase();
            // Match profession/title
            if (profession && title.includes(profession))
                score += 30;
            if (profession && desc.includes(profession))
                score += 15;
            // Match skills
            for (const skill of skills) {
                const skillLower = String(skill).toLowerCase();
                if (title.includes(skillLower))
                    score += 20;
                if (desc.includes(skillLower))
                    score += 15;
            }
            // Match sector preference
            if (preferredSector && sector.includes(preferredSector))
                score += 25;
            if (preferredSector && desc.includes(preferredSector))
                score += 10;
            // Match location preference
            if (preferredLocation && location.includes(preferredLocation))
                score += 20;
            // Match contract type preference
            if (preferredType && type.includes(preferredType))
                score += 15;
            return { ...job, recommendation_score: score };
        }).filter((j) => Number(j.recommendation_score) > 0).sort((a, b) => Number(b.recommendation_score) - Number(a.recommendation_score)).slice(0, 5);
        res.json(recommendations);
    }
    catch (err) {
        console.error("Get recommendations error:", err);
        res.status(500).json({ success: false });
    }
});
// Update user job preferences
app.put("/api/users/:id/job-preferences", userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        // Ensure user can only update their own preferences
        if (Number(userId) !== Number(id)) {
            return res.status(403).json({ success: false, message: "Accès refusé" });
        }
        const { preferred_sector, preferred_location, preferred_contract_type } = req.body;
        const { rows } = await pool.query(`UPDATE users SET preferred_sector = $1, preferred_location = $2, preferred_contract_type = $3 
       WHERE id = $4 
       RETURNING id, preferred_sector, preferred_location, preferred_contract_type`, [preferred_sector || null, preferred_location || null, preferred_contract_type || null, id]);
        res.json({ success: true, preferences: rows[0] });
    }
    catch (err) {
        console.error("Update preferences error:", err);
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// USER DOCUMENTS (CV, Certificates, etc.)
// ──────────────────────────────────────────────────
app.get('/api/user-documents', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { rows } = await pool.query('SELECT id, user_id, doc_type, title, storage_url, created_at FROM user_documents WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(rows);
    }
    catch (err) {
        console.error('Get documents error:', err);
        res.status(500).json({ success: false });
    }
});
app.post('/api/user-documents', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { doc_type, title, storage_url } = req.body;
        if (!doc_type || !storage_url) {
            return res.status(400).json({ success: false, message: 'Type de document et URL requise' });
        }
        const { rows } = await pool.query('INSERT INTO user_documents (user_id, doc_type, title, storage_url) VALUES ($1, $2, $3, $4) RETURNING *', [userId, doc_type, title || null, storage_url]);
        // If the user uploads/updates an identity document while certified, revoke certification
        if (doc_type === 'identity') {
            try {
                const { rows: userRows } = await pool.query('SELECT id, is_verified, phone, full_name FROM users WHERE id = $1', [userId]);
                const user = userRows[0];
                if (user && user.is_verified) {
                    await pool.query('UPDATE users SET is_verified = false WHERE id = $1', [userId]);
                    await pool.query('INSERT INTO verification_requests (user_id, requested_name, phone, status, reason) VALUES ($1, $2, $3, $4, $5)', [userId, user.full_name || null, user.phone || null, 'revoked', 'Identity document changed - certification revoked']);
                    // Notify the user about revocation
                    try {
                        await pool.query('INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)', [userId, 'Certification révoquée', 'Votre certification a été révoquée suite à la modification de votre pièce d\'identité.']);
                    }
                    catch (e) {
                        console.warn('Notification insert warning:', e);
                    }
                }
            }
            catch (e) {
                console.warn('Identity upload revoke warning:', e);
            }
        }
        res.json(rows[0]);
    }
    catch (err) {
        console.error('Create document error:', err);
        res.status(500).json({ success: false });
    }
});
app.delete('/api/user-documents/:id', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        // Check if document belongs to user
        const { rows: docs } = await pool.query('SELECT id FROM user_documents WHERE id = $1 AND user_id = $2', [id, userId]);
        if (docs.length === 0) {
            return res.status(403).json({ success: false, message: 'Accès refusé' });
        }
        await pool.query('DELETE FROM user_documents WHERE id = $1', [id]);
        // If the deleted document was an identity document and the user was verified, revoke certification
        try {
            const { rows: maybe } = await pool.query('SELECT doc_type, user_id FROM user_documents WHERE id = $1', [id]);
            // Note: row was deleted above; we can't rely on it here. Instead, check if user still has an identity doc.
            const { rows: userRows } = await pool.query('SELECT id, is_verified, phone, full_name FROM users WHERE id = $1', [userId]);
            const user = userRows[0];
            const { rows: idDocs } = await pool.query('SELECT id FROM user_documents WHERE user_id = $1 AND doc_type = $2', [userId, 'identity']);
            if (user && user.is_verified && idDocs.length === 0) {
                await pool.query('UPDATE users SET is_verified = false WHERE id = $1', [userId]);
                await pool.query('INSERT INTO verification_requests (user_id, requested_name, phone, status, reason) VALUES ($1, $2, $3, $4, $5)', [userId, user.full_name || null, user.phone || null, 'revoked', 'Identity document removed - certification revoked']);
                // Notify user about revocation
                try {
                    await pool.query('INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)', [userId, 'Certification révoquée', 'Votre certification a été révoquée suite à la suppression de votre pièce d\'identité.']);
                }
                catch (e) {
                    console.warn('Notification insert warning:', e);
                }
            }
        }
        catch (e) {
            console.warn('Identity delete revoke warning:', e);
        }
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete document error:', err);
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// USER SKILLS / RECOMMENDATIONS
// ──────────────────────────────────────────────────
app.get('/api/user-skills', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { rows } = await pool.query('SELECT id, user_id, skill_name, category, created_at FROM user_skills WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(rows);
    }
    catch (err) {
        console.error('Get skills error:', err);
        res.status(500).json({ success: false });
    }
});
app.post('/api/user-skills', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { skill_name, category } = req.body;
        if (!skill_name) {
            return res.status(400).json({ success: false, message: 'Nom de compétence requis' });
        }
        const { rows } = await pool.query('INSERT INTO user_skills (user_id, skill_name, category) VALUES ($1, $2, $3) RETURNING *', [userId, skill_name, category || 'general']);
        res.json(rows[0]);
    }
    catch (err) {
        console.error('Create skill error:', err);
        res.status(500).json({ success: false });
    }
});
app.delete('/api/user-skills/:id', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        // Check if skill belongs to user
        const { rows: skills } = await pool.query('SELECT id FROM user_skills WHERE id = $1 AND user_id = $2', [id, userId]);
        if (skills.length === 0) {
            return res.status(403).json({ success: false, message: 'Accès refusé' });
        }
        await pool.query('DELETE FROM user_skills WHERE id = $1', [id]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete skill error:', err);
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// ACCOUNT VERIFICATION (USER -> ADMIN workflow)
// ──────────────────────────────────────────────────
// User requests verification
app.post('/api/verify-request', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { requested_name } = req.body;
        const { rows: userRows } = await pool.query('SELECT id, full_name, phone, user_type, company_name FROM users WHERE id = $1', [userId]);
        const user = userRows[0];
        if (!user)
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
        if (!user.phone)
            return res.status(400).json({ success: false, message: 'Numéro de téléphone requis pour la vérification' });
        // For individuals: ensure identity document exists and name matches
        if (user.user_type !== 'company') {
            const { rows: idDocs } = await pool.query('SELECT id, storage_url FROM user_documents WHERE user_id = $1 AND doc_type = $2', [userId, 'identity']);
            if (idDocs.length === 0)
                return res.status(400).json({ success: false, message: 'Pièce d\'identité requise pour la vérification' });
            if (!requested_name || String(requested_name).trim().toLowerCase() !== String(user.full_name || '').trim().toLowerCase()) {
                return res.status(400).json({ success: false, message: 'Le nom fourni ne correspond pas au nom du profil.' });
            }
        }
        else {
            // For company accounts: require company_name and company documents (RCCM and guarantor identity)
            if (!user.company_name)
                return res.status(400).json({ success: false, message: 'Nom de l\'entreprise requis pour la vérification' });
            const { rows: rccm } = await pool.query('SELECT id FROM user_documents WHERE user_id = $1 AND doc_type = $2', [userId, 'rccm']);
            const { rows: guarantor } = await pool.query('SELECT id FROM user_documents WHERE user_id = $1 AND doc_type = $2', [userId, 'guarantor_identity']);
            if (rccm.length === 0)
                return res.status(400).json({ success: false, message: 'RCCM de l\'entreprise requis pour la vérification' });
            if (guarantor.length === 0)
                return res.status(400).json({ success: false, message: 'Pièce d\'identité du garant requise pour la vérification' });
            if (!requested_name || String(requested_name).trim().toLowerCase() !== String(user.company_name || '').trim().toLowerCase()) {
                return res.status(400).json({ success: false, message: 'Le nom fourni ne correspond pas au nom de l\'entreprise.' });
            }
        }
        const { rows } = await pool.query('INSERT INTO verification_requests (user_id, requested_name, phone, status) VALUES ($1, $2, $3, $4) RETURNING *', [userId, requested_name, user.phone || null, 'pending']);
        res.json({ success: true, request: rows[0] });
    }
    catch (err) {
        console.error('Verify request error:', err);
        res.status(500).json({ success: false });
    }
});
// Admin: list verification requests
app.get('/api/admin/verify-requests', adminAuth, async (req, res) => {
    try {
        const status = typeof req.query.status === 'string' ? req.query.status : null;
        let result;
        // Include related user documents (identity, rccm, guarantor) in the response
        const baseQuery = `
      SELECT vr.*, u.full_name, u.email, u.phone,
        COALESCE(json_agg(json_build_object('doc_type', ud.doc_type, 'storage_url', ud.storage_url)) FILTER (WHERE ud.id IS NOT NULL), '[]') AS documents
      FROM verification_requests vr
      JOIN users u ON u.id = vr.user_id
      LEFT JOIN user_documents ud ON ud.user_id = u.id AND ud.doc_type IN ('identity','rccm','guarantor_identity')
    `;
        if (status) {
            result = await pool.query(baseQuery + ` WHERE vr.status = $1 GROUP BY vr.id, u.full_name, u.email, u.phone ORDER BY vr.created_at DESC`, [status]);
        }
        else {
            result = await pool.query(baseQuery + ` GROUP BY vr.id, u.full_name, u.email, u.phone ORDER BY vr.created_at DESC`);
        }
        res.json(result.rows.map((r) => ({ ...r, documents: r.documents || [] })));
    }
    catch (err) {
        console.error('Admin list verify requests error:', err);
        res.status(500).json({ success: false });
    }
});
// Admin: list certified users
app.get('/api/admin/certified-users', adminAuth, async (req, res) => {
    try {
        const { rows } = await pool.query(`SELECT u.id, u.full_name, u.email, u.user_type, u.phone, u.company_name, u.created_at,
        COALESCE(json_agg(json_build_object('doc_type', ud.doc_type, 'storage_url', ud.storage_url)) FILTER (WHERE ud.id IS NOT NULL), '[]') AS documents
       FROM users u LEFT JOIN user_documents ud ON ud.user_id = u.id AND ud.doc_type IN ('identity','rccm','guarantor_identity')
       WHERE u.is_verified = true
       GROUP BY u.id ORDER BY u.created_at DESC`);
        res.json(rows);
    }
    catch (err) {
        console.error('Admin certified users error:', err);
        res.status(500).json({ success: false });
    }
});
// User: list notifications
app.get('/api/notifications', userAuth, async (req, res) => {
    try {
                const userId = req.userId;
                const userRole = String(req.userRole || '').toLowerCase();

                // site notifications targeted to this user's role or to 'all', include read flag from site_notification_reads
                const siteQuery = `SELECT s.id, s.title, s.message, s.target, s.category, s.image_url, s.link, s.created_at, (CASE WHEN r.id IS NOT NULL THEN true ELSE false END) AS read
                                                     FROM site_notifications s
                                                     LEFT JOIN site_notification_reads r ON r.site_notification_id = s.id AND r.user_id = $1
                                                     WHERE s.target = $2 OR s.target = 'all'
                                                     ORDER BY s.created_at DESC`;
                const { rows: siteRows } = await pool.query(siteQuery, [userId, userRole]);

                // personal notifications
                const { rows: personalRows } = await pool.query('SELECT id, title, message, read, created_at FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

                // Merge and sort by created_at desc
                const merged = [...(siteRows || []), ...(personalRows || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                res.json(merged);
    }
    catch (err) {
        console.error('Get notifications error:', err);
        res.status(500).json({ success: false });
    }
});
// User: mark a site notification as read
app.post('/api/notifications/site/:id/read', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'Missing id' });
        await pool.query('INSERT INTO site_notification_reads (user_id, site_notification_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [userId, id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Mark site notification read error:', err);
        res.status(500).json({ success: false, message: (err && err.message) || 'Erreur' });
    }
});
// User: mark notification as read
app.post('/api/notifications/:id/read', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        await pool.query('UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2', [id, userId]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Mark notification read error:', err);
        res.status(500).json({ success: false });
    }
});
// Admin: approve a verification request
app.post('/api/admin/verify-requests/:id/approve', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.userId;
        const { rows } = await pool.query('SELECT * FROM verification_requests WHERE id = $1', [id]);
        if (rows.length === 0)
            return res.status(404).json({ success: false, message: 'Demande introuvable' });
        const reqRow = rows[0];
        await pool.query('UPDATE verification_requests SET status = $1, admin_id = $2, reviewed_at = NOW() WHERE id = $3', ['approved', adminId, id]);
        await pool.query('UPDATE users SET is_verified = true WHERE id = $1', [reqRow.user_id]);
        // Notify the user
        try {
            await pool.query('INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)', [reqRow.user_id, 'Vérification approuvée', 'Votre compte a été certifié par un administrateur.']);
        }
        catch (e) {
            console.warn('Notification insert warning:', e);
        }
        res.json({ success: true });
    }
    catch (err) {
        console.error('Approve verify request error:', err);
        res.status(500).json({ success: false });
    }
});
// Admin: reject a verification request
app.post('/api/admin/verify-requests/:id/reject', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.userId;
        const { reason } = req.body;
        const { rows } = await pool.query('SELECT * FROM verification_requests WHERE id = $1', [id]);
        if (rows.length === 0)
            return res.status(404).json({ success: false, message: 'Demande introuvable' });
        const reqRow = rows[0];
        await pool.query('UPDATE verification_requests SET status = $1, admin_id = $2, reason = $3, reviewed_at = NOW() WHERE id = $4', ['rejected', adminId, reason || null, id]);
        await pool.query('UPDATE users SET is_verified = false WHERE id = $1', [reqRow.user_id]);
        // Notify the user
        try {
            await pool.query('INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)', [reqRow.user_id, 'Vérification rejetée', reason || 'Votre demande de vérification a été rejetée.']);
        }
        catch (e) {
            console.warn('Notification insert warning:', e);
        }
        res.json({ success: true });
    }
    catch (err) {
        console.error('Reject verify request error:', err);
        res.status(500).json({ success: false });
    }
});

// Admin: create a site notification targeting candidate/company/all
app.post('/api/admin/site-notifications', adminAuth, async (req, res) => {
    try {
        const { title, message, target = 'all', category = null, image_url = null, link = null, create_personal = false } = req.body;
        if (!title) return res.status(400).json({ success: false, message: 'Title required' });
        const { rows } = await pool.query(
            `INSERT INTO site_notifications (title, message, target, category, image_url, link) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [title, message || null, target || 'all', category || null, image_url || null, link || null]
        );

        const created = rows[0];

        // If admin requested personal notifications, insert into notifications for matching users
        if (create_personal) {
            try {
                let roleFilter = null;
                if (target === 'candidate') roleFilter = 'candidate';
                if (target === 'company') roleFilter = 'company';
                const usersQuery = roleFilter ? 'SELECT id FROM users WHERE user_type = $1' : 'SELECT id FROM users';
                const params = roleFilter ? [roleFilter] : [];
                const { rows: users } = await pool.query(usersQuery, params);
                const insertPromises = users.map((u) => {
                    return pool.query('INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)', [u.id, title, message || null]);
                });
                await Promise.all(insertPromises);
            } catch (e) {
                console.error('Create personal notifications warning:', e);
            }
        }

        res.json({ success: true, notification: created });
    } catch (err) {
        console.error('Create site notification error:', err);
        res.status(500).json({ success: false, message: (err && err.message) || 'Erreur serveur' });
    }
});

// Admin: delete site notification
app.delete('/api/admin/site-notifications/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM site_notifications WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete site notification error:', err);
        res.status(500).json({ success: false, message: (err && err.message) || 'Erreur serveur' });
    }
});

// Admin: list all site notifications
app.get('/api/site-notifications', adminAuth, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM site_notifications ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('List site notifications error:', err);
        res.status(500).json({ success: false, message: (err && err.message) || 'Erreur serveur' });
    }
});
app.put("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, is_blocked } = req.body;
        const { rows } = await pool.query(`UPDATE users SET full_name=$1, email=$2, is_blocked=$3 WHERE id=$4
       RETURNING id, full_name, email, user_type, created_at, is_blocked`, [full_name, email, is_blocked, id]);
        res.json({ success: true, user: rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
app.delete("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM users WHERE id=$1", [id]);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// FAQs — gestion publique et admin
// ──────────────────────────────────────────────────
app.get("/api/faqs", async (_, res) => {
    try {
        const { rows } = await pool.query("SELECT id, question, answer, created_at FROM faqs ORDER BY created_at DESC");
        res.json(rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
app.post("/api/faqs", async (req, res) => {
    try {
        const { question, answer } = req.body;
        const { rows } = await pool.query(`INSERT INTO faqs (question, answer) VALUES ($1, $2) RETURNING id, question, answer, created_at`, [question, answer]);
        res.json({ success: true, faq: rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
app.put("/api/faqs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer } = req.body;
        const { rows } = await pool.query(`UPDATE faqs SET question=$1, answer=$2 WHERE id=$3 RETURNING id, question, answer, created_at`, [question, answer, id]);
        res.json({ success: true, faq: rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
app.delete("/api/faqs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM faqs WHERE id=$1", [id]);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// PUBLICATIONS / NEWSFEED
// ──────────────────────────────────────────────────
app.get('/api/publications', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM publications WHERE is_active = true ORDER BY created_at DESC');
        res.json(rows);
    }
    catch (err) {
        console.error('Get publications error:', err);
        res.status(500).json({ success: false });
    }
});
// Admins create publications (newsfeed)
app.post('/api/publications', adminAuth, async (req, res) => {
    try {
        const { content, visibility = 'public', hashtags, image_url } = req.body;
        const authorId = req.userId;
        const { rows } = await pool.query(`INSERT INTO publications (author_id, content, visibility, hashtags, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [authorId || null, content, visibility, hashtags || null, image_url || null]);
        res.json({ success: true, publication: rows[0] });
    }
    catch (err) {
        console.error('Create publication error:', err);
        res.status(500).json({ success: false });
    }
});
// Update publication (admin only)
app.put('/api/publications/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { content, visibility, hashtags, image_url } = req.body;
        const { rows } = await pool.query(`UPDATE publications SET content=$1, visibility=$2, hashtags=$3, image_url=$4 WHERE id=$5 RETURNING *`, [content, visibility || 'public', hashtags || null, image_url || null, id]);
        res.json({ success: true, publication: rows[0] });
    }
    catch (err) {
        console.error('Update publication error:', err);
        res.status(500).json({ success: false });
    }
});
// Delete publication (admin only)
app.delete('/api/publications/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM publications WHERE id = $1', [id]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete publication error:', err);
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// SERVICE CATALOGS (Catalogue des offres par service)
// ──────────────────────────────────────────────────
app.get('/api/catalogs', async (req, res) => {
    try {
        const service = typeof req.query.service === 'string' ? req.query.service : null;
        let result;
        if (service) {
            result = await pool.query('SELECT * FROM service_catalogs WHERE service_category=$1 AND is_active = true ORDER BY created_at DESC', [service]);
        }
        else {
            result = await pool.query('SELECT * FROM service_catalogs WHERE is_active = true ORDER BY created_at DESC');
        }
        res.json(result.rows);
    }
    catch (err) {
        console.error('Get catalogs error:', err);
        res.status(500).json({ success: false });
    }
});
app.post('/api/catalogs', adminAuth, async (req, res) => {
    try {
        const { service_category, title, description, price = 0, currency = 'XAF', image_url, is_active = true } = req.body;
        const { rows } = await pool.query(`INSERT INTO service_catalogs (service_category, title, description, price, currency, image_url, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, [service_category, title, description || null, price, currency, image_url || null, is_active]);
        res.json({ success: true, item: rows[0] });
    }
    catch (err) {
        console.error('Create catalog error:', err);
        res.status(500).json({ success: false });
    }
});
app.put('/api/catalogs/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { service_category, title, description, price, currency, image_url, is_active } = req.body;
        const { rows } = await pool.query(`UPDATE service_catalogs SET service_category=$1, title=$2, description=$3, price=$4, currency=$5, image_url=$6, is_active=$7 WHERE id=$8 RETURNING *`, [service_category, title, description || null, price || 0, currency || 'XAF', image_url || null, is_active !== false, id]);
        res.json({ success: true, item: rows[0] });
    }
    catch (err) {
        console.error('Update catalog error:', err);
        res.status(500).json({ success: false });
    }
});
app.delete('/api/catalogs/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM service_catalogs WHERE id = $1', [id]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete catalog error:', err);
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// SITE SETTINGS
// ──────────────────────────────────────────────────
app.get('/api/site-settings', async (_, res) => {
    try {
        const { rows } = await pool.query('SELECT key, value FROM site_settings');
        const obj = {};
        rows.forEach((r) => { obj[r.key] = r.value; });
        res.json(obj);
    }
    catch (err) {
        console.error('Get site settings error:', err);
        res.status(500).json({ success: false });
    }
});
app.put('/api/site-settings', adminAuth, async (req, res) => {
    try {
        const updates = req.body || {};
        // Upsert each key
        for (const key of Object.keys(updates)) {
            const value = updates[key];
            await pool.query(`INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [key, JSON.stringify(value)]);
        }
        res.json({ success: true });
    }
    catch (err) {
        console.error('Update site settings error:', err);
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// 6. STATISTIQUES POUR LE DASHBOARD (DYNAMIQUE)
// ──────────────────────────────────────────────────
app.get("/api/stats", async (_, res) => {
    try {
        const [jobs, formations, admins, users] = await Promise.all([
            pool.query("SELECT COUNT(*) FROM jobs"),
            pool.query("SELECT COUNT(*) FROM formations"),
            pool.query("SELECT COUNT(*) FROM admins"),
            pool.query("SELECT COUNT(*) FROM users"),
        ]);
        res.json({
            jobs: parseInt(jobs.rows[0].count),
            formations: parseInt(formations.rows[0].count),
            admins: parseInt(admins.rows[0].count),
            users: parseInt(users.rows[0].count),
        });
    }
    catch (err) {
        res.status(500).json({ error: "Erreur stats" });
    }
});
// ──────────────────────────────────────────────────
// 7. PORTFOLIOS (RÉALISATIONS) — API COMPLÈTE
// ──────────────────────────────────────────────────
app.get("/api/portfolios", async (req, res) => {
    try {
        // Allow filtering by service category: /api/portfolios?service=conception-graphique
        const service = typeof req.query.service === 'string' ? req.query.service : null;
        let result;
        if (service) {
            result = await pool.query(`SELECT * FROM portfolios WHERE service_category = $1 ORDER BY featured DESC, created_at DESC`, [service]);
        }
        else {
            result = await pool.query(`SELECT * FROM portfolios ORDER BY featured DESC, created_at DESC`);
        }
        res.json(result.rows);
    }
    catch (err) {
        console.error('Get portfolios error:', err);
        res.status(500).json({ success: false });
    }
});
app.post("/api/portfolios", async (req, res) => {
    try {
        const { title, description, image_url, project_url, service_category, featured = false } = req.body;
        const { rows } = await pool.query(`INSERT INTO portfolios (title, description, image_url, project_url, service_category, featured)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [title, description || null, image_url || null, project_url || null, service_category, featured]);
        res.json({ success: true, portfolio: rows[0] });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
app.put("/api/portfolios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, image_url, project_url, service_category, featured } = req.body;
        const { rows } = await pool.query(`UPDATE portfolios SET title=$1, description=$2, image_url=$3, project_url=$4, service_category=$5, featured=$6 WHERE id=$7 RETURNING *`, [title, description || null, image_url || null, project_url || null, service_category, featured || false, id]);
        res.json({ success: true, portfolio: rows[0] });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
app.delete("/api/portfolios/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM portfolios WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// USER DOCUMENTS (CVs / Letters) — CRUD + quotas
// ──────────────────────────────────────────────────
// Create a new user document (generated CV or letter)
app.post('/api/user-documents', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { doc_type, title, storage_url, metadata } = req.body;
        if (!doc_type)
            return res.status(400).json({ success: false, message: 'doc_type requis' });
        // Saved documents limit per document type (e.g. max 2 CVs, 2 letters)
        const { rows: savedTypeRows } = await pool.query('SELECT COUNT(*) FROM user_documents WHERE user_id = $1 AND doc_type = $2', [userId, doc_type]);
        const savedTypeCount = parseInt(savedTypeRows[0].count || '0');
        if (savedTypeCount >= 2) {
            return res.status(400).json({ success: false, message: `Limite de documents sauvegardés atteinte pour le type ${doc_type} (2)` });
        }
        // Monthly creation limit per doc_type (10 per month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const { rows: monthRows } = await pool.query(`SELECT COUNT(*) FROM user_documents WHERE user_id=$1 AND doc_type=$2 AND created_at >= $3`, [userId, doc_type, startOfMonth]);
        const monthCount = parseInt(monthRows[0].count || '0');
        if (monthCount >= 10) {
            return res.status(400).json({ success: false, message: 'Limite mensuelle atteinte pour ce type de document (10)' });
        }
        const { rows } = await pool.query(`INSERT INTO user_documents (user_id, doc_type, title, storage_url, metadata) VALUES ($1,$2,$3,$4,$5) RETURNING *`, [userId, doc_type, title || null, storage_url || null, metadata || null]);
        res.json({ success: true, document: rows[0] });
    }
    catch (err) {
        console.error('Create user document error:', err);
        res.status(500).json({ success: false });
    }
});
// List user's documents
app.get('/api/user-documents', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { rows } = await pool.query('SELECT * FROM user_documents WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(rows);
    }
    catch (err) {
        console.error('List user documents error:', err);
        res.status(500).json({ success: false });
    }
});
// Delete a user's document
app.delete('/api/user-documents/:id', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { rows } = await pool.query('SELECT user_id FROM user_documents WHERE id = $1', [id]);
        if (rows.length === 0)
            return res.status(404).json({ success: false, message: 'Document non trouvé' });
        if (rows[0].user_id !== userId)
            return res.status(403).json({ success: false, message: 'Accès refusé' });
        await pool.query('DELETE FROM user_documents WHERE id = $1', [id]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete user document error:', err);
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// 8. CANAUX DE COMMUNICATION — API COMPLÈTE
// ──────────────────────────────────────────────────
app.get("/api/channels", async (_, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM communication_channels WHERE is_active = true ORDER BY display_order ASC");
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
app.post("/api/channels", async (req, res) => {
    try {
        const { channel_name, channel_url, channel_type, icon_name, display_order = 0, is_active = true } = req.body;
        const { rows } = await pool.query(`INSERT INTO communication_channels (channel_name, channel_url, channel_type, icon_name, display_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [channel_name, channel_url, channel_type, icon_name || null, display_order, is_active]);
        res.json({ success: true, channel: rows[0] });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
app.put("/api/channels/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { channel_name, channel_url, channel_type, icon_name, display_order, is_active } = req.body;
        const { rows } = await pool.query(`UPDATE communication_channels SET channel_name=$1, channel_url=$2, channel_type=$3, icon_name=$4, display_order=$5, is_active=$6 WHERE id=$7 RETURNING *`, [channel_name, channel_url, channel_type, icon_name || null, display_order || 0, is_active !== false, id]);
        res.json({ success: true, channel: rows[0] });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
app.delete("/api/channels/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM communication_channels WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false });
    }
});
// ──────────────────────────────────────────────────
// SERVICE CATALOGS MANAGEMENT API
// ──────────────────────────────────────────────────
app.get("/api/service-catalogs", async (req, res) => {
    try {
        const category = typeof req.query.category === 'string' ? req.query.category : null;
        let query = "SELECT * FROM service_catalogs ORDER BY created_at DESC";
        const params = [];
        if (category) {
            query = "SELECT * FROM service_catalogs WHERE category = $1 ORDER BY created_at DESC";
            params.push(category);
        }
        const { rows } = await pool.query(query, params);
        res.json(rows);
    }
    catch (error) {
        console.error("Error fetching catalogs:", error);
        res.status(500).json({ error: "Failed to fetch catalogs" });
    }
});
app.post("/api/service-catalogs", async (req, res) => {
    try {
        const { name, description, category, price, image_url } = req.body;
        const { rows } = await pool.query(`INSERT INTO service_catalogs (name, description, category, price, image_url, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`, [name, description, category, price || null, image_url || null]);
        res.status(201).json(rows[0]);
    }
    catch (error) {
        console.error("Error creating catalog:", error);
        res.status(500).json({ error: "Failed to create catalog" });
    }
});
// Record a visitor interaction (public endpoint)
app.post('/api/interactions', async (req, res) => {
    try {
        const { user_id = null, service = null, event_type = 'interaction', payload = {} } = req.body || {};
        const { rows } = await pool.query(`INSERT INTO visitor_interactions (user_id, service, event_type, payload, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING *`, [user_id, service, event_type, payload]);
        res.status(201).json({ success: true, item: rows[0] });
    }
    catch (err) {
        console.error('Create interaction error:', err);
        res.status(500).json({ success: false });
    }
});
// Admin SSE endpoint for realtime interactions stream
app.get('/api/admin/realtime', async (req, res) => {
    // Accept token either via query param or Authorization header
    const token = typeof req.query.token === 'string' ? req.query.token : (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
    if (!token)
        return res.status(401).json({ success: false, message: 'Token manquant' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const allowed = ['admin', 'super_admin', 'admin_content'];
        if (!decoded.role || !allowed.includes(decoded.role))
            return res.status(403).json({ success: false, message: 'Accès admin requis' });
    }
    catch (err) {
        return res.status(401).json({ success: false, message: 'Token invalide' });
    }
    // Set headers for SSE
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
    });
    let lastId = 0;
    const sendEvent = (row) => {
        const data = JSON.stringify(row);
        res.write(`data: ${data}\n\n`);
    };
    // Initial send: last 20 events
    (async () => {
        try {
            const { rows } = await pool.query('SELECT * FROM visitor_interactions ORDER BY id DESC LIMIT 20');
            rows.reverse().forEach((r) => { sendEvent(r); lastId = Math.max(lastId, r.id); });
        }
        catch (err) {
            console.error('SSE initial fetch error:', err);
        }
    })();
    // Poll for new events every 1500ms
    const interval = setInterval(async () => {
        try {
            const { rows } = await pool.query('SELECT * FROM visitor_interactions WHERE id > $1 ORDER BY id ASC', [lastId]);
            if (rows.length > 0) {
                rows.forEach((r) => { sendEvent(r); lastId = Math.max(lastId, r.id); });
            }
        }
        catch (err) {
            console.error('SSE poll error:', err);
        }
    }, 1500);
    // Close connection handling
    req.on('close', () => {
        clearInterval(interval);
        try {
            res.end();
        }
        catch (e) { }
    });
});
app.patch("/api/service-catalogs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, price, image_url } = req.body;
        const { rows } = await pool.query(`UPDATE service_catalogs 
       SET name = $1, description = $2, category = $3, price = $4, image_url = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`, [name, description, category, price || null, image_url || null, id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Catalog not found" });
        }
        res.json(rows[0]);
    }
    catch (error) {
        console.error("Error updating catalog:", error);
        res.status(500).json({ error: "Failed to update catalog" });
    }
});
app.delete("/api/service-catalogs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query("DELETE FROM service_catalogs WHERE id = $1 RETURNING *", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Catalog not found" });
        }
        res.json({ message: "Catalog deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting catalog:", error);
        res.status(500).json({ error: "Failed to delete catalog" });
    }
});
// ──────────────────────────────────────────────────
// FILE UPLOAD (local storage)
// ──────────────────────────────────────────────────
// ──────────────────────────────────────────────────
// PORTFOLIOS (Projets réalisés)
// ──────────────────────────────────────────────────
// GET all portfolios with optional category filter
app.get("/api/portfolios", async (req, res) => {
    try {
        const category = typeof req.query.category === 'string' ? req.query.category : null;
        let query = "SELECT * FROM portfolios ORDER BY featured DESC, created_at DESC";
        const params = [];
        if (category) {
            query = "SELECT * FROM portfolios WHERE service_category = $1 ORDER BY featured DESC, created_at DESC";
            params.push(category);
        }
        const { rows } = await pool.query(query, params);
        res.json(rows);
    }
    catch (error) {
        console.error("Error fetching portfolios:", error);
        res.status(500).json({ error: "Failed to fetch portfolios" });
    }
});
// POST - Create new portfolio
app.post("/api/portfolios", async (req, res) => {
    try {
        const { title, description, image_url, project_url, service_category, featured } = req.body;
        if (!title || !service_category) {
            return res.status(400).json({ error: "Title and service_category are required" });
        }
        const { rows } = await pool.query("INSERT INTO portfolios (title, description, image_url, project_url, service_category, featured) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [title, description || null, image_url || null, project_url || null, service_category, featured || false]);
        res.status(201).json(rows[0]);
    }
    catch (error) {
        console.error("Error creating portfolio:", error);
        res.status(500).json({ error: "Failed to create portfolio" });
    }
});
// PATCH - Update portfolio
app.patch("/api/portfolios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, image_url, project_url, service_category, featured } = req.body;
        const { rows } = await pool.query("UPDATE portfolios SET title = COALESCE($1, title), description = COALESCE($2, description), image_url = COALESCE($3, image_url), project_url = COALESCE($4, project_url), service_category = COALESCE($5, service_category), featured = COALESCE($6, featured) WHERE id = $7 RETURNING *", [title, description, image_url, project_url, service_category, featured, id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Portfolio not found" });
        }
        res.json(rows[0]);
    }
    catch (error) {
        console.error("Error updating portfolio:", error);
        res.status(500).json({ error: "Failed to update portfolio" });
    }
});
// DELETE - Remove portfolio
app.delete("/api/portfolios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query("DELETE FROM portfolios WHERE id = $1 RETURNING *", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Portfolio not found" });
        }
        res.json({ message: "Portfolio deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting portfolio:", error);
        res.status(500).json({ error: "Failed to delete portfolio" });
    }
});
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
app.post('/api/upload', userAuth, async (req, res) => {
    try {
        // Expect base64-encoded file in body: { base64Content, originalName, category }
        const { base64Content, originalName, category = 'documents' } = req.body;
        if (!base64Content || !originalName) {
            return res.status(400).json({ success: false, message: 'base64Content et originalName requis' });
        }
        // Validate category
        const validCategories = ['profiles', 'services', 'portfolios', 'documents', 'jobs', 'formations'];
        const uploadCategory = validCategories.includes(category) ? category : 'documents';
        const buffer = Buffer.from(base64Content, 'base64');
        // Reject very large uploads
        const MAX_BYTES = 5 * 1024 * 1024; // 5MB
        if (buffer.length > MAX_BYTES) {
            return res.status(413).json({ success: false, message: 'Fichier trop volumineux (max 5MB)' });
        }
        // Sanitize original name: keep only safe chars
        const safeBase = String(originalName).split('/').pop()?.split('\\').pop() || 'file';
        const safeName = safeBase.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const fileName = `${Date.now()}-${safeName}`;
        const categoryDir = path.join(UPLOAD_DIR, uploadCategory);
        // Ensure category subdirectory exists
        if (!fs.existsSync(categoryDir)) {
            fs.mkdirSync(categoryDir, { recursive: true });
        }
        const filePath = path.join(categoryDir, fileName);
        // Prevent writing outside intended directory
        if (!filePath.startsWith(categoryDir)) {
            return res.status(400).json({ success: false, message: 'Nom de fichier invalide' });
        }
        fs.writeFileSync(filePath, buffer, { mode: 0o644 });
        const storage_url = `/uploads/${uploadCategory}/${fileName}`;
        res.json({ success: true, storage_url, fileName });
    }
    catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ success: false, message: 'Erreur lors du téléchargement' });
    }
});
// Serve uploaded files statically (deny dotfiles, no directory index)
app.use('/uploads', express.static(UPLOAD_DIR, { dotfiles: 'deny', index: false }));
// Ensure the `business_cards` table exists
pool.query(`CREATE TABLE IF NOT EXISTS business_cards (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    website TEXT,
    address TEXT,
    logo_url TEXT,
    card_color VARCHAR(20) DEFAULT 'blue',
    created_at TIMESTAMP DEFAULT NOW()
  )`).catch((err) => console.error("Could not ensure business_cards table exists:", err));
// GET /api/business-cards - List cards for authenticated company user
app.get('/api/business-cards', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        const result = await pool.query('SELECT * FROM business_cards WHERE company_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(result.rows);
    }
    catch (err) {
        console.error('Get business cards error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});
// POST /api/business-cards - Create a new business card
app.post('/api/business-cards', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        const { title, full_name, phone, email, website, address, card_color } = req.body;
        if (!title || !full_name || !phone) {
            return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
        }
        const result = await pool.query(`INSERT INTO business_cards (company_id, title, full_name, phone, email, website, address, card_color) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`, [userId, title, full_name, phone, email || null, website || null, address || null, card_color || 'blue']);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error('Create business card error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});
// DELETE /api/business-cards/:id - Delete a business card
app.delete('/api/business-cards/:id', userAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const cardId = req.params.id;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        // Verify card belongs to user
        const card = await pool.query('SELECT * FROM business_cards WHERE id = $1 AND company_id = $2', [cardId, userId]);
        if (card.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Carte non trouvée' });
        }
        await pool.query('DELETE FROM business_cards WHERE id = $1', [cardId]);
        res.json({ success: true, message: 'Carte supprimée' });
    }
    catch (err) {
        console.error('Delete business card error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});
app.listen(5000, () => {
    console.log("Backend prêt → http://localhost:5000");
});
// Contact form endpoint (simple storage / notification placeholder)
app.post('/api/contact', async (req, res) => {
    try {
        const { email, subject, message } = req.body;
        if (!email || !subject || !message)
            return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
        // Insert into contacts table if exists, otherwise just log
        try {
            await pool.query(`CREATE TABLE IF NOT EXISTS contacts (
          id SERIAL PRIMARY KEY,
          email TEXT,
          subject TEXT,
          message TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )`);
            await pool.query('INSERT INTO contacts (email, subject, message) VALUES ($1,$2,$3)', [email, subject, message]);
        }
        catch (e) {
            console.warn('Contact DB warning:', e);
        }
        console.log('Contact message received:', { email, subject, message });
        res.json({ success: true, message: 'Message reçu' });
    }
    catch (err) {
        console.error('Contact error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});
//# sourceMappingURL=server.js.map