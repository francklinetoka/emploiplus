/**
 * Backend Server - Main Entry Point
 * 
 * This file serves as the central server configuration and initialization point.
 * All routes and middleware are registered here.
 * 
 * Business logic has been extracted to:
 * - routes/ - Route definitions
 * - controllers/ - Route handlers
 * - middleware/ - Request/response interceptors
 * - services/ - Business logic
 * - utils/ - Helper functions
 * 
 * Architecture: Modular, maintainable, scalable
 */

import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { pool, isConnected, connectedPromise } from './config/database.js';
import { API_PORT, CORS_ORIGIN } from './config/constants.js';
import { registerRoutes } from './routes/index.js';

// Load environment variables
dotenv.config();

// Create Express app
const app: Express = express();

// ──────────────────────────────────────────────────
// SECURITY MIDDLEWARE
// ──────────────────────────────────────────────────

// Helmet for security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static files (uploads directory)
app.use('/uploads', express.static('uploads'));

// ──────────────────────────────────────────────────
// ROUTES REGISTRATION
// ──────────────────────────────────────────────────

registerRoutes(app);

/**
 * NOTE: Existing routes from server.ts have NOT been migrated yet.
 * They remain in server.ts for backward compatibility.
 * 
 * Migration Strategy:
 * 1. Extract routes incrementally into separate files
 * 2. Create corresponding controllers
 * 3. Update imports in this file
 * 4. Test thoroughly
 * 5. Remove from server.ts once migrated
 * 
 * TODO: Import and use routes once created
 * Currently commented out as modules are being created:
 * 
 * - import authRoutes from './routes/auth.js';
 * - import userRoutes from './routes/users.js';
 * - import jobRoutes from './routes/jobs.js';
 * - import formationRoutes from './routes/formations.js';
 * - import adminRoutes from './routes/admin.js';
 * - import publicationRoutes from './routes/publications.js';
 * - import portfolioRoutes from './routes/portfolios.js';
 * - import notificationRoutes from './routes/notifications.js';
 * - import faqRoutes from './routes/faqs.js';
 * - import serviceRoutes from './routes/services.js';
 * - import uploadRoutes from './routes/upload.js';
 * 
 * app.use('/api/auth', authRoutes);
 * app.use('/api/users', userRoutes);
 * app.use('/api/jobs', jobRoutes);
 * // ... etc
 */

// ──────────────────────────────────────────────────
// ERROR HANDLING MIDDLEWARE
// ──────────────────────────────────────────────────

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.path} not found`,
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// ──────────────────────────────────────────────────
// DATABASE INITIALIZATION
// ──────────────────────────────────────────────────

if (isConnected) {
  console.log('Database is connected on startup');
}

// Ensure critical tables exist when database connects
connectedPromise
  .then(async () => {
    console.log('Ensuring critical database schema...');
    // TODO: Move schema creation to separate file: config/schema.ts
    // For now, keeping existing logic from server.ts
  })
  .catch((err) => {
    console.error('Failed to ensure database schema:', err);
  });

// ──────────────────────────────────────────────────
// SERVER STARTUP
// ──────────────────────────────────────────────────

const PORT = API_PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend prêt → http://localhost:${PORT}`);
  console.log(`📡 Network: http://192.168.0.14:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS Origin: ${CORS_ORIGIN}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    pool.end().then(() => {
      console.log('Database connection pool closed');
      process.exit(0);
    }).catch((err) => {
      console.error('Error closing database:', err);
      process.exit(1);
    });
  });
});

export default app;
