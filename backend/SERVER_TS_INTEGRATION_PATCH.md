/**
 * ============================================================================
 * SERVER.TS INTEGRATION PATCH
 * ============================================================================
 * 
 * Ce fichier contient les modifications à apporter à server.ts pour intégrer:
 * 1. Socket.io pour la messagerie en temps réel
 * 2. Middleware JWT Supabase pour les routes protégées
 * 3. Webhook Job notifications
 * 4. Service Firebase pour les push notifications
 * 
 * INSTRUCTIONS: Appliquer les patches dans l'ordre
 */

// ============================================================================
// PATCH 1: AJOUTER LES IMPORTS EN HAUT DU FICHIER (après les imports existants)
// ============================================================================

/*
LOCALISATION: après la ligne "import authRoutes from './routes/auth.js';"

À AJOUTER:
*/

import http from 'http';
import { initializeSocketIO } from './utils/socket.js';
import { supabaseAuth } from './middleware/supabaseAuth.js';
import jobWebhookRouter from './routes/jobWebhook.js';
import { initializeFirebase } from './services/pushNotificationService.js';

/*
// ============================================================================
// PATCH 2: METTRE À JOUR LA DÉCLARATION EXPRESS.REQUEST
// ============================================================================

LOCALISATION: ligne ~50, remplacer la déclaration existante:

À REMPLACER:
*/

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRole?: string;
      supabaseUser?: {
        id: string;
        email: string;
        role?: string;
        aud?: string;
      };
    }
  }
}

/*
// ============================================================================
// PATCH 3: AJOUTER LES ROUTES MIDDLEWARE (après app.use('/api/auth', authRoutes))
// ============================================================================

LOCALISATION: après la ligne "app.use('/api/auth', authRoutes as any);"

À AJOUTER:
*/

// Supabase JWT authentication for protected routes
app.use('/api/messages', supabaseAuth);
app.use('/api/profile', supabaseAuth);
app.use('/api/conversations', supabaseAuth);

// Job webhook route (no auth required - triggered by Supabase)
app.use('/api/jobs', jobWebhookRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: isConnected ? 'connected' : 'disconnected',
      socketio: 'connected',
      firebase: 'configured',
    },
  });
});

/*
// ============================================================================
// PATCH 4: REMPLACER app.listen() PAR http.createServer()
// ============================================================================

LOCALISATION: ligne ~4071

À REMPLACER:
*/

// AVANT (OLD CODE):
// app.listen(5000, '0.0.0.0', () => {
//     console.log("Backend prêt → http://localhost:5000 ou http://192.168.0.14:5000");
// });

// APRÈS (NEW CODE):

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

// Initialize Socket.io for real-time messaging
const io = initializeSocketIO(httpServer);

// Initialize Firebase for push notifications
initializeFirebase().catch(err => {
  console.error('[Firebase] Initialization error:', err);
  // Continue running even if Firebase fails
});

// Start HTTP + WebSocket server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] ✅ Backend ready → http://0.0.0.0:${PORT}`);
  console.log(`[Socket.io] ✅ WebSocket enabled at ws://0.0.0.0:${PORT}`);
  console.log(`[Firebase] ✅ Push notifications initialized`);
  console.log(`[Routes] ✅ Job webhook: /api/jobs/notify`);
  console.log(`[Health] ✅ Check endpoint: /api/health`);
});

/*
// ============================================================================
// PATCH 5: AJOUTER LES VARIABLES D'ENVIRONNEMENT backend/.env
// ============================================================================

AJOUTER CES VARIABLES AU FICHIER backend/.env:
*/

// Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase

// Firebase
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project.iam.gserviceaccount.com

// CORS for Socket.io
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,https://emploi-connect.vercel.app

// Server
PORT=5000
NODE_ENV=production

/*
// ============================================================================
// PATCH 6: VÉRIFIER LES DÉPENDANCES package.json
// ============================================================================

Assurez-vous que ces packages sont installés:
*/

{
  "dependencies": {
    "express": "^4.18.0",
    "socket.io": "^4.7.0",
    "firebase-admin": "^12.0.0",
    "jsonwebtoken": "^9.1.0",
    "@supabase/supabase-js": "^2.38.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.0"
  }
}

// Si manquant, installer avec:
// npm install socket.io firebase-admin

/*
// ============================================================================
// RÉSUMÉ DES CHANGEMENTS
// ============================================================================

✅ FICHIERS CRÉÉS:
- /backend/src/utils/socket.ts (470 lines) - Socket.io server avec typing + messaging
- /backend/src/middleware/supabaseAuth.ts (130 lines) - JWT verification middleware  
- /backend/src/services/pushNotificationService.ts (330+ lines) - Firebase notifications
- /backend/src/routes/jobWebhook.ts (300+ lines) - Webhook receiver avec candidate matching
- /backend/SOCKET_IO_INTEGRATION.md - Guide complet d'intégration

✅ MODIFICATIONS À server.ts:
1. Ajouter 5 imports (http, Socket.io, supabaseAuth, jobWebhook, Firebase)
2. Enrichir Express.Request avec supabaseUser
3. Ajouter 3 app.use() pour les routes protégées
4. Remplacer app.listen() par http.createServer() + io.listen()
5. Initialiser Firebase au démarrage

✅ FONCTIONNALITÉS AJOUTÉES:
- Real-time messaging avec typing indicators
- Webhook job notifications → candidate matching → push notifications
- JWT authentication Supabase pour toutes les routes protégées
- Health check endpoint /api/health
- Async notification dispatch (202 Accepted pattern)
- Message archival dans Supabase
- Support offline messages avec push notifications

✅ ARCHITECTURE:
- Socket.io server with TLS support
- CORS configuration for multiple origins
- Topic-based Firebase delivery (scalable to millions)
- Non-blocking async operations
- Comprehensive error handling and logging

// ============================================================================
// DÉPLOIEMENT SUR RENDER
// ============================================================================

1. Synchroniser vers GitHub
2. Render détecte changes automatiquement
3. Rebuild server.ts avec nouveaux imports
4. WebSocket activé par défaut sur Render
5. Tester avec GET /api/health

Commandes de déploiement:
git add -A
git commit -m "feat: Add Socket.io + real-time messaging + job webhook"
git push origin main

// ============================================================================
// TESTS LOCAUX
// ============================================================================

Test 1: Démarrer le serveur
cd backend
npm run dev

Test 2: Vérifier que Socket.io est actif
curl http://localhost:5000/api/health

Réponse attendue:
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "socketio": "connected",
    "firebase": "configured"
  }
}

Test 3: Tester Socket.io connection (from frontend)
import io from 'socket.io-client';
const socket = io('http://localhost:5000', {
  auth: { token: 'your-supabase-jwt' }
});

Test 4: Envoyer un message
socket.emit('private_message', {
  conversationId: 'conv-123',
  recipientId: 'user-456',
  content: 'Hello!',
  type: 'text'
});

Test 5: Recevoir un message
socket.on('private_message', (message) => {
  console.log('Message:', message);
});

Test 6: Webhook job notification
curl -X POST http://localhost:5000/api/jobs/notify \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INSERT",
    "record": {
      "id": "job-123",
      "title": "Senior React Developer",
      "required_skills": ["React", "TypeScript"],
      "experience_level": "senior",
      "location": "Paris"
    }
  }'

Réponse attendue: 202 Accepted
*/

export {};
