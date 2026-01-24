# ⚡ QUICK START - Backend Refactoring Deployment (30 minutes)

## 📋 Prerequisites

- ✅ Render account (backend hosting)
- ✅ Supabase account (database + webhooks)
- ✅ Redis Cloud account (free tier available)
- ✅ OneSignal account (push notifications)
- ✅ Node.js 18+ installed locally

---

## 🚀 STEP 1: Install Dependencies (2 min)

```bash
cd backend

# Install all new packages at once
npm install --save \
  socket.io \
  socket.io-client \
  @socket.io/redis-adapter \
  bullmq \
  redis \
  @supabase/supabase-js

npm install --save-dev @types/node
```

**Verify installation:**
```bash
npm list socket.io bullmq redis
```

---

## 🔧 STEP 2: Update Environment Variables (3 min)

### Local Development (.env file)

Create `backend/.env`:

```bash
# Copy from existing .env and ADD these:

# ===== NEW: Supabase JWT =====
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (from Supabase API Settings)
SUPABASE_JWT_SECRET=eyJhbGc... (from Supabase JWT Secret)
SUPABASE_WEBHOOK_SECRET=your_webhook_secret_here

# ===== NEW: Redis =====
REDIS_HOST=redis-xxxxx.c123.us-east-1-2.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=your_redis_password

# ===== NEW: OneSignal =====
ONESIGNAL_API_KEY=your_api_key
ONESIGNAL_APP_ID=your_app_id

# ===== EXISTING (Keep) =====
DATABASE_URL=postgresql://...
JWT_SECRET=your_existing_jwt
NODE_ENV=development
PORT=3001
```

**Get these values:**
- Supabase: Settings > API > Project URL, Service Role Key, JWT Secret
- Redis: https://redis.com/cloud → Create Free Database
- OneSignal: Settings > API Keys > REST API Key & App ID

---

## 📝 STEP 3: Update server.ts (5 min)

### Replace server startup code:

**Find this code** (usually at end of server.ts):
```typescript
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

**Replace with:**
```typescript
import http from 'http';
import { setupSocketIO } from './integrations/socketio.js';
import { createNotificationWorker } from './services/notificationQueue.js';
import webhookRoutes from './routes/webhooks.js';

const PORT = process.env.PORT || 3001;
const httpServer = http.createServer(app);

// Initialize Socket.io
const io = setupSocketIO(httpServer);

// Mount webhook routes
app.use('/api', webhookRoutes);

// Start server
httpServer.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.io listening on ws://localhost:${PORT}`);
});

// Initialize workers
async function initializeWorkers() {
    try {
        await createNotificationWorker();
        console.log('✅ Notification worker initialized');
    } catch (error) {
        console.error('❌ Worker init error:', error);
    }
}

initializeWorkers().catch(console.error);
```

---

## 🗄️ STEP 4: Run SQL Migrations (3 min)

### In Supabase SQL Editor:

1. Go to **Supabase Dashboard > SQL Editor**
2. Create new query
3. Copy **entire content** from:
   ```
   backend/migrations/001_optimize_supabase.sql
   ```
4. Click **RUN**

**What it does:**
- ✅ Creates optimized views (newsfeed, job matching)
- ✅ Adds performance indexes
- ✅ Sets up materialized views for analytics
- ✅ Enables RLS policies

**Verify success:**
```sql
-- Run in SQL Editor to verify
SELECT * FROM information_schema.views WHERE table_schema='public';
```

---

## 🔗 STEP 5: Configure Supabase Webhooks (5 min)

### Webhook #1: Job Notifications

In Supabase Dashboard:

1. Go to **Database > Webhooks**
2. Click **Create webhook**
3. Fill form:
   ```
   Name: Job Posting Notifications
   Event: INSERT on public.jobs
   URL: https://your-backend.onrender.com/api/webhooks/jobs/notify
   HTTP Method: POST
   Headers:
     - Authorization: Bearer {SUPABASE_JWT_SECRET}
   ```
4. Click **Save webhook**

### Webhook #2: Profile Matching

1. Click **Create webhook** again
2. Fill form:
   ```
   Name: Candidate Profile Matching
   Event: UPDATE on public.candidates
   URL: https://your-backend.onrender.com/api/webhooks/matching/update
   HTTP Method: POST
   Headers:
     - Authorization: Bearer {SUPABASE_JWT_SECRET}
   ```
3. Click **Save webhook**

---

## ✅ STEP 6: Test Locally (3 min)

### Start the backend:

```bash
npm run dev
```

**You should see:**
```
✅ Server running on http://localhost:3001
🔌 Socket.io listening on ws://localhost:3001
✅ Notification worker initialized
```

### Test webhook health:

```bash
curl -X GET http://localhost:3001/api/webhooks/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "server": "Render Node.js Backend"
}
```

### Test Socket.io connection:

```javascript
// In browser console:
const socket = io('http://localhost:3001/messages', {
  auth: { token: 'your_jwt_token' }
});

socket.on('connect', () => {
  console.log('✅ Connected to Socket.io');
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});
```

---

## 🚢 STEP 7: Deploy to Render (5 min)

### In Render Dashboard:

1. Go to **Services > Your Backend Service**
2. Click **Settings**
3. Go to **Environment**
4. Add new environment variables:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=eyJ...
SUPABASE_WEBHOOK_SECRET=xxxxx
REDIS_HOST=redis-xxxxx.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=xxxxx
ONESIGNAL_API_KEY=xxxxx
ONESIGNAL_APP_ID=xxxxx
NODE_ENV=production
```

5. Click **Save changes**
6. Wait for automatic redeploy (~2 min)

### Verify deployment:

```bash
# Get your Render URL
curl https://your-backend.onrender.com/api/webhooks/health

# Should return: { "status": "ok", ... }
```

---

## 🔌 STEP 8: Update Frontend (2 min)

### In `src/services/socket.ts`:

```typescript
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const messagesSocket = io(`${SOCKET_URL}/messages`, {
  auth: {
    token: localStorage.getItem('authToken'),
  },
});

export const notificationsSocket = io(`${SOCKET_URL}/notifications`, {
  auth: {
    token: localStorage.getItem('authToken'),
  },
});

// Listen for messages
messagesSocket.on('new_message', (message) => {
  console.log('New message:', message);
  // Update UI
});

// Listen for typing
messagesSocket.on('user_typing', (data) => {
  console.log(`${data.email} is typing...`);
});

// Listen for notifications
notificationsSocket.on('notification', (notification) => {
  console.log('Notification:', notification);
  // Show toast
});
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Dependencies installed (`npm list socket.io`)
- [ ] Environment variables in `.env`
- [ ] server.ts updated with Socket.io code
- [ ] SQL migrations executed
- [ ] Supabase webhooks configured (2)
- [ ] Local test successful
- [ ] Environment variables set in Render
- [ ] Deployment completed
- [ ] Health check passed
- [ ] Frontend Socket.io client updated

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'socket.io'"
```bash
# Solution: Install again
npm install socket.io
```

### Issue: Webhook not triggering
```bash
# Check:
1. URL is correct (must be https on Render)
2. Secret matches SUPABASE_WEBHOOK_SECRET
3. Check Render logs for errors
```

### Issue: Socket.io connection fails
```bash
# Check:
1. CORS origins include your frontend
2. JWT token is valid
3. Check browser console for connection errors
```

### Issue: Redis connection timeout
```bash
# Test:
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping
# Should return: PONG
```

---

## 📊 MONITORING

### Watch logs:

```bash
# Render logs
# Go to: Service > Logs

# Look for:
# ✅ "Webhook Jobs"         - Job notifications received
# ✅ "Socket.messages"       - Real-time messaging
# ✅ "Notification worker"   - Queue processing
```

### Check queue health:

In any backend endpoint:

```typescript
import { notificationQueue } from './services/notificationQueue';

app.get('/api/admin/queue-health', async (req, res) => {
  const counts = await notificationQueue.getJobCounts();
  res.json({
    waiting: counts.waiting,
    active: counts.active,
    completed: counts.completed,
    failed: counts.failed,
  });
});
```

---

## 🎉 SUCCESS!

You now have:

✅ **Real-time Messaging** - Socket.io ready  
✅ **Async Notifications** - BullMQ queue configured  
✅ **Webhook Processing** - Supabase triggers working  
✅ **Database Optimized** - Views & indexes created  
✅ **JWT Validation** - All routes secured  
✅ **Scalable Architecture** - Multi-server ready

---

**Estimated Time**: 30 minutes  
**Difficulty**: Intermediate  
**Status**: ✅ Production Ready

Any issues? Check the main documentation: [BACKEND_REFACTORING_COMPLETE_GUIDE.md](./BACKEND_REFACTORING_COMPLETE_GUIDE.md)
