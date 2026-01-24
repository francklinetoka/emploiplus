/**
 * ============================================================================
 * Middleware d'Authentification Supabase JWT
 * ============================================================================
 * 
 * Vérifie le JWT Supabase pour les routes sécurisées
 * 
 * Usage:
 * app.post('/api/messages/send', supabaseAuth, handleSendMessage);
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request with Supabase user info
declare global {
  namespace Express {
    interface Request {
      supabaseUser?: {
        id: string;
        email?: string;
        role?: string;
        aud?: string;
      };
    }
  }
}

/**
 * Verify Supabase JWT Token
 * 
 * Expected header: Authorization: Bearer <JWT>
 * JWT should be issued by Supabase and signed with SUPABASE_JWT_SECRET
 */
export const supabaseAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('[Supabase Auth] Missing or invalid Authorization header');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    // Verify JWT using Supabase JWT secret
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (!jwtSecret) {
      console.error('[Supabase Auth] SUPABASE_JWT_SECRET not configured');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    // Decode and verify the token
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ['HS256'],
      audience: 'authenticated', // Supabase default audience
    }) as any;

    // Extract user info from token
    req.supabaseUser = {
      id: decoded.sub, // Supabase user ID (UUID)
      email: decoded.email,
      role: decoded.role || 'authenticated',
      aud: decoded.aud,
    };

    console.log('[Supabase Auth] ✅ Token verified', {
      userId: req.supabaseUser.id,
      email: req.supabaseUser.email,
    });

    next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('[Supabase Auth] Token expired');
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Please refresh your token'
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('[Supabase Auth] Invalid token:', (error as any).message);
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Token verification failed'
      });
    } else {
      console.error('[Supabase Auth] Unexpected error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  }
};

/**
 * Optional: Verify JWT from either Supabase OR local JWT
 * Useful for transitional period during migration
 */
export const flexibleAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    try {
      // Try Supabase JWT first (with audience verification)
      const decoded = jwt.verify(token, jwtSecret, {
        algorithms: ['HS256'],
        audience: 'authenticated',
      }) as any;

      req.supabaseUser = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role || 'authenticated',
      };
    } catch (supabaseError) {
      // Fallback to local JWT (without audience check)
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      req.supabaseUser = {
        id: decoded.id || decoded.sub,
        email: decoded.email,
        role: decoded.role || 'authenticated',
      };
    }

    next();

  } catch (error) {
    console.error('[Flexible Auth] Error:', error);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }
};

export default supabaseAuth;
