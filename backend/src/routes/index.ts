import { Express } from 'express';
import { pool } from '../config/database.js';

/**
 * Centralised route registration
 * Imports and registers all route modules
 */
export const registerRoutes = (app: Express) => {
  /**
   * TODO: Import route modules as they are created
   * Current routes are still in server.ts but will be migrated here
   * 
   * Example pattern:
   * import authRoutes from './auth.js';
   * import userRoutes from './users.js';
   * import jobRoutes from './jobs.js';
   * 
   * app.use('/api/auth', authRoutes);
   * app.use('/api/users', userRoutes);
   * app.use('/api/jobs', jobRoutes);
   */

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      status: 'Backend is running',
      timestamp: new Date().toISOString(),
    });
  });

  // Database status endpoint
  app.get('/api/health/db', async (req, res) => {
    try {
      const result = await pool.query('SELECT 1');
      res.json({
        success: true,
        database: 'Connected',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      res.status(503).json({
        success: false,
        database: 'Disconnected',
        error: String(err),
      });
    }
  });
};

/**
 * Route modules will be created following this pattern:
 * 
 * // routes/auth.ts
 * import { Router } from 'express';
 * import { registerRoute } from '../controllers/authController.js';
 * 
 * const router = Router();
 * router.post('/register', registerRoute);
 * router.post('/login', loginRoute);
 * 
 * export default router;
 * 
 * // routes/users.ts
 * import { Router } from 'express';
 * import { userAuth } from '../middleware/auth.js';
 * import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
 * 
 * const router = Router();
 * router.get('/:id', getUserProfile);
 * router.put('/:id', userAuth, updateUserProfile);
 * 
 * export default router;
 */
