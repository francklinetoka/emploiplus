import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';

// Extend Express Request type to include custom properties
declare global {
  namespace Express {
    interface Request {
      userId?: string | number;
      userRole?: string;
    }
  }
}

/**
 * User authentication middleware
 * Verifies JWT token from Authorization header
 */
export const userAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth)
    return res.status(401).json({ success: false, message: 'Token manquant' });

  const token = auth.split(' ')[1] || "";
  try {
    console.log('userAuth token present:', !!token, 'masked:', token ? `${token.slice(0, 8)}...` : '');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('userAuth decoded id:', decoded?.id, 'role:', decoded?.role);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  }
  catch (err) {
    console.error('userAuth verify error:', (err as any)?.stack || (err as any)?.message || err);
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

/**
 * Admin authentication middleware
 * Only allows users with admin, super_admin, or admin_content roles
 */
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth)
    return res.status(401).json({ success: false, message: 'Token manquant' });

  const token = auth.split(' ')[1] || "";
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
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

/**
 * Generate JWT token for user
 */
export const generateToken = (userId: number | string, userRole: string): string => {
  return jwt.sign(
    { id: userId, role: userRole },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};
