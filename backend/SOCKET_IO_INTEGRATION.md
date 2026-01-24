/**
 * ============================================================================
 * INTEGRATION GUIDE: Socket.io + Real-time Services
 * ============================================================================
 * 
 * Ce guide explique comment intégrer Socket.io et les services en temps réel
 * dans votre server.ts existant pour LinkedIn-scale architecture.
 * 
 * ÉTAPES D'INTÉGRATION:
 */

// ============================================================================
// 1. IMPORTS À AJOUTER EN HAUT DE server.ts (après les imports existants)
// ============================================================================

import http from 'http';
import { initializeSocketIO } from './utils/socket.js';
import { supabaseAuth } from './middleware/supabaseAuth.js';
import jobWebhookRouter from './routes/jobWebhook.js';
import { initializeFirebase } from './services/pushNotificationService.js';

// ============================================================================
// 2. REMPLACEMENT: app.listen() → http.createServer()
// ============================================================================

// AVANT (ligne ~4071 du server.ts):
// app.listen(5000, '0.0.0.0', () => {
//   console.log('Server running on http://0.0.0.0:5000');
// });

// APRÈS:
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

// Initialize Socket.io
const io = initializeSocketIO(httpServer);

// Initialize Firebase for push notifications
initializeFirebase().catch(err => {
  console.error('[Firebase] Initialization error:', err);
  // Continue even if Firebase fails
});

// Start HTTP + WebSocket server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] ✅ Running on http://0.0.0.0:${PORT}`);
  console.log(`[Socket.io] ✅ WebSocket enabled at ws://0.0.0.0:${PORT}`);
  console.log(`[Firebase] ✅ Push notifications configured`);
});

// ============================================================================
// 3. MIDDLEWARE À AJOUTER (après app.use('/api/auth', authRoutes))
// ============================================================================

// Supabase JWT authentication for protected routes
app.use('/api/messages', supabaseAuth);
app.use('/api/profile', supabaseAuth);
app.use('/api/conversations', supabaseAuth);

// Job webhook route (no auth required - Supabase triggers it)
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

// ============================================================================
// 4. ENVIRONMENT VARIABLES À AJOUTER DANS backend/.env
// ============================================================================

/**
 * Votre backend/.env doit contenir:
 * 
 * # Supabase
 * SUPABASE_URL=https://your-project.supabase.co
 * SUPABASE_ANON_KEY=eyJ...
 * SUPABASE_SERVICE_KEY=eyJ...
 * SUPABASE_JWT_SECRET=your-super-secret-key
 * 
 * # Firebase (for push notifications)
 * FIREBASE_PROJECT_ID=your-project-id
 * FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
 * FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@project.iam.gserviceaccount.com
 * FIREBASE_SERVICE_ACCOUNT_PATH=/app/firebase-service-account.json
 * 
 * # CORS
 * CORS_ORIGINS=http://localhost:5173,https://emploi-connect.vercel.app
 * 
 * # Server
 * PORT=5000
 * NODE_ENV=production
 */

// ============================================================================
// 5. TESTS DES ENDPOINTS
// ============================================================================

/**
 * Test Webhook Job Notification:
 * 
 * POST /api/jobs/notify
 * Content-Type: application/json
 * 
 * {
 *   "type": "INSERT",
 *   "record": {
 *     "id": "job-123",
 *     "title": "Senior React Developer",
 *     "company_name": "Tech Startup",
 *     "description": "...",
 *     "required_skills": ["React", "TypeScript", "Node.js"],
 *     "experience_level": "senior",
 *     "location": "Paris, France"
 *   }
 * }
 * 
 * Response: 202 Accepted (async processing)
 */

/**
 * Test Socket.io Connection:
 * 
 * const socket = io('http://localhost:5000', {
 *   auth: {
 *     token: 'your-supabase-jwt-token'
 *   }
 * });
 * 
 * socket.on('connect', () => {
 *   console.log('✅ Connected');
 *   
 *   // Join conversation
 *   socket.emit('join_conversation', { conversationId: 'conv-123' });
 *   
 *   // Start typing
 *   socket.emit('typing', { conversationId: 'conv-123', isTyping: true });
 *   
 *   // Send message
 *   socket.emit('private_message', {
 *     conversationId: 'conv-123',
 *     recipientId: 'user-456',
 *     content: 'Bonjour!',
 *     type: 'text'
 *   });
 *   
 *   // Listen for message delivery
 *   socket.on('message_delivered', (data) => {
 *     console.log('Message delivered:', data);
 *   });
 *   
 *   // Listen for typing
 *   socket.on('user_typing', (data) => {
 *     console.log(data.userId, 'is typing:', data.isTyping);
 *   });
 * });
 */

// ============================================================================
// 6. PACKAGE.JSON DEPENDENCIES (assurez-vous qu'elles sont installées)
// ============================================================================

/**
 * npm packages requis (vérifier dans package.json):
 * 
 * "socket.io": "^4.7.0",
 * "firebase-admin": "^12.0.0",
 * "jsonwebtoken": "^9.1.0",
 * "@supabase/supabase-js": "^2.38.0",
 * "express-rate-limit": "^7.1.0",
 * "helmet": "^7.1.0",
 * "cors": "^2.8.5"
 */

// ============================================================================
// 7. SUPABASE DATABASE SCHEMA
// ============================================================================

/**
 * Tables requises dans Supabase:
 * 
 * Table: messages
 * - id (uuid, primary key)
 * - conversation_id (uuid, foreign key)
 * - sender_id (uuid, foreign key → auth.users.id)
 * - recipient_id (uuid, foreign key → auth.users.id)
 * - content (text)
 * - message_type (text: 'text', 'image', 'file')
 * - is_read (boolean, default: false)
 * - created_at (timestamp, default: now())
 * - updated_at (timestamp, default: now())
 * 
 * Table: conversations
 * - id (uuid, primary key)
 * - user_1_id (uuid, foreign key → auth.users.id)
 * - user_2_id (uuid, foreign key → auth.users.id)
 * - last_message_at (timestamp)
 * - created_at (timestamp, default: now())
 * 
 * Table: webhook_logs
 * - id (uuid, primary key)
 * - event_type (text: 'job_offer', 'message', etc.)
 * - payload (jsonb)
 * - matched_count (integer)
 * - created_at (timestamp, default: now())
 * 
 * Table: device_tokens
 * - id (uuid, primary key)
 * - user_id (uuid, foreign key → auth.users.id)
 * - token (text, unique)
 * - device_type (text: 'ios', 'android', 'web')
 * - created_at (timestamp, default: now())
 */

// ============================================================================
// 8. FIREBASE SETUP
// ============================================================================

/**
 * Créer une clé de service Firebase:
 * 
 * 1. Aller à: https://console.firebase.google.com
 * 2. Sélectionner le projet
 * 3. Settings → Service Accounts
 * 4. Generate New Private Key → Télécharger JSON
 * 5. Copier le JSON dans /app/firebase-service-account.json
 * 
 * Ou encoder en base64 dans une variable d'env.
 */

// ============================================================================
// 9. FRONTEND INTEGRATION
// ============================================================================

/**
 * Dans votre composant React:
 * 
 * import { useEffect, useState } from 'react';
 * import io from 'socket.io-client';
 * import { useAuth } from '@/hooks/useAuth';
 * 
 * export function ChatComponent() {
 *   const { user, session } = useAuth();
 *   const [messages, setMessages] = useState([]);
 *   const [typingUsers, setTypingUsers] = useState([]);
 *   const [socket, setSocket] = useState(null);
 * 
 *   useEffect(() => {
 *     if (!session?.access_token) return;
 *     
 *     const newSocket = io(process.env.REACT_APP_API_URL, {
 *       auth: {
 *         token: session.access_token
 *       }
 *     });
 * 
 *     newSocket.on('connect', () => {
 *       console.log('Connected to Socket.io');
 *       newSocket.emit('join_conversation', { conversationId: 'conv-123' });
 *     });
 * 
 *     newSocket.on('private_message', (message) => {
 *       setMessages(prev => [...prev, message]);
 *     });
 * 
 *     newSocket.on('user_typing', ({ userId, isTyping }) => {
 *       if (isTyping) {
 *         setTypingUsers(prev => [...new Set([...prev, userId])]);
 *       } else {
 *         setTypingUsers(prev => prev.filter(id => id !== userId));
 *       }
 *     });
 * 
 *     setSocket(newSocket);
 * 
 *     return () => newSocket.disconnect();
 *   }, [session?.access_token]);
 * 
 *   const sendMessage = (content) => {
 *     socket?.emit('private_message', {
 *       conversationId: 'conv-123',
 *       recipientId: 'user-456',
 *       content,
 *       type: 'text'
 *     });
 *   };
 * 
 *   const handleTyping = (isTyping) => {
 *     socket?.emit('typing', {
 *       conversationId: 'conv-123',
 *       isTyping
 *     });
 *   };
 * 
 *   return (
 *     <div>
 *       {typingUsers.length > 0 && <p>Quelqu'un écrit...</p>}
 *       {messages.map(msg => (
 *         <div key={msg.id}>{msg.content}</div>
 *       ))}
 *       <input
 *         onInput={(e) => handleTyping(e.target.value.length > 0)}
 *         onBlur={() => handleTyping(false)}
 *       />
 *       <button onClick={() => sendMessage('Bonjour!')}>
 *         Envoyer
 *       </button>
 *     </div>
 *   );
 * }
 */

// ============================================================================
// 10. MONITORING & LOGGING
// ============================================================================

/**
 * Pour monitorer les connexions Socket.io en production:
 * 
 * - Logs dans /var/log/app.log
 * - Métrique: getActiveUserCount() toutes les 60s
 * - Alert si > 10 messages perdus par minute
 * - Health check: GET /api/health toutes les 30s
 */

export {};
