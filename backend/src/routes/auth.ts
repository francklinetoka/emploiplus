/**
 * Authentication Routes
 * 
 * Handles:
 * - Admin registration and login
 * - User registration and login
 * - Token refresh
 * - Password reset
 * 
 * This file demonstrates the modular pattern for route organization.
 * Extract from server.ts lines 442-500+ and adapt as needed.
 */

import { Router, Request, Response } from 'express';
import { pool } from '../config/database.js';
import { hashPassword, comparePassword, isValidEmail } from '../utils/helpers.js';
import { generateToken } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';

/**
 * Admin Registration
 * POST /api/auth/admin/register
 */
router.post('/admin/register', async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, role = 'admin' } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email invalide',
      });
    }

    // Check if admin already exists
    const { rows: existing } = await pool.query(
      'SELECT id FROM admins WHERE email = $1',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé',
      });
    }

    // Hash password
    const hashed = bcrypt.hashSync(password, 10);

    // Create admin
    const { rows } = await pool.query(
      `INSERT INTO admins (email, password, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, created_at`,
      [email, hashed, full_name || null, role]
    );

    const admin = rows[0];
    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        created_at: admin.created_at,
      },
    });
  } catch (err) {
    console.error('Admin registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: process.env.NODE_ENV === 'development' ? String(err) : undefined,
    });
  }
});

/**
 * Admin Login
 * POST /api/auth/admin/login
 */
router.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis',
      });
    }

    // Get admin
    const { rows } = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      [email]
    );

    const admin = rows[0];

    // Verify password
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects',
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return safe admin (without password)
    const { password: _, ...safeAdmin } = admin;

    res.json({
      success: true,
      token,
      admin: safeAdmin,
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: process.env.NODE_ENV === 'development' ? String(err) : undefined,
    });
  }
});

/**
 * User Registration
 * POST /api/auth/user/register
 * 
 * TODO: Implement from server.ts
 */
router.post('/user/register', async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, user_type = 'candidate' } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Format email invalide' });
    }

    // Check if user already exists
    const { rows: existing } = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
    }

    // Hash password
    const hashed = await hashPassword(password);

    // Insert user
    const insertQuery = `
      INSERT INTO users (full_name, email, password, user_type, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, full_name, email, user_type, created_at, updated_at
    `;

    const { rows } = await pool.query(insertQuery, [full_name, email, hashed, user_type]);
    const user = rows[0];

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.user_type || 'candidate' }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, token, user });
  } catch (err) {
    console.error('User registration error:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'inscription', error: String(err) });
  }
});

/**
 * User Login
 * POST /api/auth/user/login
 * 
 * TODO: Implement from server.ts
 */
router.post('/user/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe sont requis' });
    }

    // Find user
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    const token = jwt.sign({ id: user.id, role: user.user_type || 'candidate' }, JWT_SECRET, { expiresIn: '7d' });

    // Remove password before returning
    const { password: _pwd, ...safeUser } = user;

    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    console.error('User login error:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la connexion', error: String(err) });
  }
});

export default router;
