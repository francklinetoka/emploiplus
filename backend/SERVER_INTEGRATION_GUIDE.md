/**
 * ============================================================================
 * Server Integration - Socket.io & Webhooks Setup
 * ============================================================================
 *
 * Ce fichier contient les instructions d'intégration pour:
 * 1. Initialiser Socket.io dans server.ts
 * 2. Monter les routes webhooks
 * 3. Initialiser les workers BullMQ
 * 4. Setup CORS pour Socket.io
 *
 * À ajouter dans backend/src/server.ts (ligne ~50, après les imports)
 */

// ============================================================================
// IMPORTS À AJOUTER (top du fichier server.ts)
// ============================================================================

import http from 'http';
import { setupSocketIO } from './integrations/socketio.js';
import { createNotificationWorker } from './services/notificationQueue.js';
import webhookRoutes from './routes/webhooks.js';

// ============================================================================
// MODIFICATIONS À FAIRE dans server.ts
// ============================================================================

/*

STEP 1: Remplacer le démarrage du serveur (fin du fichier)
=========================================================

ANCIEN CODE (ACTUEL):
// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

NOUVEAU CODE (À REMPLACER):
=========================================================
*/

// HTTP Server avec Socket.io
const PORT = process.env.PORT || 3001;
const httpServer = http.createServer(app);

// Initialiser Socket.io
const io = setupSocketIO(httpServer);

// Monter les routes webhooks avec prefix
app.use('/api', webhookRoutes);

// Démarrer le serveur HTTP
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Socket.io listening on ws://localhost:${PORT}`);
});

// Initialiser les workers de notification
async function initializeWorkers() {
    try {
        await createNotificationWorker();
        console.log('[Worker] Notification worker initialized');
    } catch (error) {
        console.error('[Worker] Failed to initialize notification worker:', error);
    }
}

initializeWorkers().catch(console.error);

// ============================================================================
// STEP 2: Ajouter ces routes APRÈS app.use('/api/auth', authRoutes)
// =========================================================

/*

// Webhook routes (signature HMAC SHA256 vérifiée)
app.use('/api', webhookRoutes);

// Health check pour webhooks
app.get('/api/webhooks/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        server: 'Render Node.js Backend',
    });
});

*/

// ============================================================================
// STEP 3: Middleware pour les Webhooks (AVANT les routes)
// =========================================================

/*

// Webhook body parser - Raw pour vérifier la signature
app.use('/api/webhooks/', express.raw({ type: 'application/json' }));

// Reconvertir en JSON après signature check
app.use('/api/webhooks/', express.json());

*/

// ============================================================================
// STEP 4: Variables d'environnement À AJOUTER dans .env
// =========================================================

/*

# Socket.io Configuration
SOCKET_IO_CORS_ORIGINS=http://localhost:5173,http://localhost:5174,https://emploiplus.vercel.app

# Webhooks & Signatures
SUPABASE_WEBHOOK_SECRET=your_webhook_secret_from_supabase
SUPABASE_JWT_SECRET=your_jwt_secret_from_supabase

# Redis (pour BullMQ queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional

# Notifications
ONESIGNAL_API_KEY=your_onesignal_api_key
ONESIGNAL_APP_ID=your_onesignal_app_id

# Firestore (alternative à OneSignal)
FIREBASE_PROJECT_ID=your_firebase_project
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

*/

// ============================================================================
// STEP 5: Package.json dépendances À INSTALLER
// =========================================================

/*

npm install --save \
  socket.io \
  socket.io-client \
  @socket.io/redis-adapter \
  bullmq \
  redis \
  @supabase/supabase-js \
  jsonwebtoken \
  crypto

npm install --save-dev @types/node

*/

// ============================================================================
// STEP 6: Vérifications de déploiement
// =========================================================

/*

RENDER DEPLOYMENT CHECKLIST:
===========================

1. ✅ Set environment variables:
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - SUPABASE_JWT_SECRET
   - SUPABASE_WEBHOOK_SECRET
   - REDIS_HOST (si utilisé)
   - ONESIGNAL_API_KEY
   - JWT_SECRET (legacy, pour retrocompat)
   - NODE_ENV=production

2. ✅ Configure webhooks dans Supabase:
   - Aller à: Database > Webhooks
   - Create webhook:
     * Event: INSERT on public.jobs
     * URL: https://your-backend.onrender.com/api/webhooks/jobs/notify
     * Signature: Add secret (SUPABASE_WEBHOOK_SECRET)
   
   - Create webhook:
     * Event: UPDATE on public.candidates
     * URL: https://your-backend.onrender.com/api/webhooks/matching/update
     * Signature: Add secret

3. ✅ Redis setup:
   - Use Redis Cloud: https://redis.com/cloud (free tier)
   - Copy connection string to REDIS_HOST:REDIS_PORT
   - Update src/services/notificationQueue.ts with your credentials

4. ✅ Test webhooks:
   - POST https://your-backend.onrender.com/api/webhooks/test
   - Headers:
     * Authorization: Bearer {SUPABASE_JWT_SECRET}
     * X-Webhook-Signature: (calculated by webhook trigger)

5. ✅ Monitor logs:
   - Render > Logs
   - Vérifier les messages: "[Webhook Jobs]", "[Socket.io]"

6. ✅ Vérifier Socket.io connexion:
   - Frontend: new io('https://your-backend.onrender.com')
   - Vérifier les messages: "[Socket.messages] User connected"

*/

// ============================================================================
// STEP 7: Exemple d'utilisation depuis le code serveur
// =========================================================

/*

// Importer les fonctions Socket.io
import { 
  sendNotificationToUser, 
  broadcastToRole, 
  sendNotificationToUsers 
} from './integrations/socketio';

// Envoyer une notification à un utilisateur spécifique
sendNotificationToUser(io, 'user-id-123', {
  title: 'Nouvelle offre d\'emploi',
  body: 'Une offre correspond à votre profil',
  jobId: 'job-123',
  timestamp: new Date().toISOString(),
});

// Broadcaster à tous les candidats
broadcastToRole(io, 'candidate', {
  title: 'Mise à jour du matching',
  body: 'Vérifiez vos nouvelles opportunités',
});

// Envoyer à plusieurs utilisateurs
sendNotificationToUsers(io, ['user-1', 'user-2', 'user-3'], {
  title: 'Message de l\'équipe Emploi+',
  body: 'Merci de votre inscription',
});

*/

// ============================================================================
// STEP 8: Tests Postman/curl
// =========================================================

/*

TEST 1: Health check webhook
============================
curl -X GET https://your-backend.onrender.com/api/webhooks/health


TEST 2: Test signature verification
===================================
curl -X POST https://your-backend.onrender.com/api/webhooks/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{}'


TEST 3: Simuler un job posting webhook
======================================
curl -X POST https://your-backend.onrender.com/api/webhooks/jobs/notify \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: hmac-sha256=..." \
  -d '{
    "id": "job-1",
    "title": "Senior Developer",
    "description": "...",
    "company_id": "comp-123",
    "location": "Paris",
    "required_skills": ["React", "Node.js"],
    "experience_level": "Senior",
    "job_type": "CDI"
  }'


TEST 4: Simuler un profile update
=================================
curl -X POST https://your-backend.onrender.com/api/webhooks/matching/update \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: hmac-sha256=..." \
  -d '{
    "record": {
      "id": "cand-1",
      "skills": ["React", "Node.js", "PostgreSQL"],
      "experience_level": "Intermédiaire"
    },
    "old_record": {
      "skills": ["React"],
      "experience_level": "Junior"
    }
  }'

*/

export {};
