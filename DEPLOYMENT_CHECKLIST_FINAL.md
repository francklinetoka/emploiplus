# ✅ DEPLOYMENT CHECKLIST - Backend Phase 2

## 🎯 PRE-DEPLOYMENT (LOCAL TESTING)

- [ ] **Dependencies Installed**
  ```bash
  npm install socket.io bullmq redis @socket.io/redis-adapter
  npm list | grep -E "socket.io|bullmq|redis"
  ```

- [ ] **Environment Variables Set**
  ```bash
  cat backend/.env | grep SUPABASE
  cat backend/.env | grep REDIS
  cat backend/.env | grep ONESIGNAL
  ```

- [ ] **server.ts Updated**
  - [ ] Imports added (http, setupSocketIO, notificationQueue, webhookRoutes)
  - [ ] httpServer created from http.createServer(app)
  - [ ] setupSocketIO(httpServer) called
  - [ ] webhookRoutes mounted on app.use('/api', webhookRoutes)
  - [ ] notificationWorker initialized in initializeWorkers()

- [ ] **Local Server Test**
  ```bash
  npm run dev
  ```
  **Expected output:**
  ```
  ✅ Server running on http://localhost:3001
  🔌 Socket.io listening on ws://localhost:3001
  ✅ Notification worker initialized
  ```

- [ ] **Webhook Health Check**
  ```bash
  curl http://localhost:3001/api/webhooks/health
  # Expected: { "status": "ok", ... }
  ```

- [ ] **Socket.io Connection Test** (Browser Console)
  ```javascript
  const socket = io('http://localhost:3001/messages', {
    auth: { token: 'test-token' }
  });
  socket.on('connect', () => console.log('✅ Connected'));
  socket.on('error', (err) => console.error('❌', err));
  ```

---

## 🗄️ DATABASE SETUP

- [ ] **SQL Migrations Executed**
  - [ ] Login to Supabase Dashboard
  - [ ] Go to **SQL Editor > New Query**
  - [ ] Copy entire content from: `backend/migrations/001_optimize_supabase.sql`
  - [ ] Click **RUN**
  - [ ] Verify no errors

- [ ] **Verify Views Created**
  ```sql
  SELECT viewname FROM pg_views WHERE schemaname='public'
  ORDER BY viewname;
  ```
  **Expected results:**
  - [ ] `v_newsfeed_feed`
  - [ ] `v_candidate_job_matches`
  - [ ] `v_search_optimized` (or similar)

- [ ] **Verify Indexes Created**
  ```sql
  SELECT indexname FROM pg_indexes WHERE schemaname='public'
  ORDER BY indexname;
  ```
  **Expected results:** (at least)
  - [ ] `idx_posts_created_at_desc`
  - [ ] `idx_posts_is_pinned`
  - [ ] `idx_jobs_required_skills`
  - [ ] `idx_candidates_skills`
  - [ ] `idx_messages_conversation_created`

- [ ] **Verify RLS Policies**
  ```sql
  SELECT policyname FROM pg_policies WHERE schemaname='public'
  ORDER BY policyname;
  ```

---

## 🔗 SUPABASE WEBHOOKS CONFIGURATION

### Webhook #1: Job Notifications

- [ ] **Create Webhook**
  - [ ] Supabase Dashboard > **Database > Webhooks**
  - [ ] Click **Create webhook**

- [ ] **Configure Webhook Details**
  - [ ] Name: `Job Posting Notifications`
  - [ ] Events: Select **INSERT**
  - [ ] Table: `public.jobs`
  - [ ] HTTP Method: `POST`

- [ ] **Set URL**
  - [ ] For local: `http://localhost:3001/api/webhooks/jobs/notify`
  - [ ] For production: `https://your-backend.onrender.com/api/webhooks/jobs/notify`

- [ ] **Add Headers** (if needed)
  - [ ] Name: `Authorization`
  - [ ] Value: `Bearer ${SUPABASE_JWT_SECRET}`

- [ ] **Save Webhook**
  - [ ] Click **Save webhook**
  - [ ] Copy webhook ID for reference

### Webhook #2: Profile Matching

- [ ] **Create Webhook**
  - [ ] Click **Create webhook** again

- [ ] **Configure Webhook Details**
  - [ ] Name: `Candidate Profile Matching`
  - [ ] Events: Select **UPDATE**
  - [ ] Table: `public.candidates`
  - [ ] HTTP Method: `POST`

- [ ] **Set URL**
  - [ ] For local: `http://localhost:3001/api/webhooks/matching/update`
  - [ ] For production: `https://your-backend.onrender.com/api/webhooks/matching/update`

- [ ] **Save Webhook**
  - [ ] Click **Save webhook**

- [ ] **Test Webhooks**
  ```bash
  # Test webhook signature verification
  curl -X POST http://localhost:3001/api/webhooks/test \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer your_jwt_token"
  ```

---

## 🚀 RENDER DEPLOYMENT

### Setup Environment Variables

- [ ] **Login to Render**
  - [ ] Go to **Services > Your Backend Service**
  - [ ] Click **Settings**

- [ ] **Add Environment Variables**
  - [ ] Go to **Environment** tab
  - [ ] Add each variable from `.env`:

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_JWT_SECRET=eyJhbGc...
SUPABASE_WEBHOOK_SECRET=your_webhook_secret

# Redis
REDIS_HOST=redis-xxxxx.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=your_password

# OneSignal
ONESIGNAL_API_KEY=your_api_key
ONESIGNAL_APP_ID=your_app_id

# Server
NODE_ENV=production
PORT=3001

# (Keep existing variables)
DATABASE_URL=postgresql://...
JWT_SECRET=your_existing_jwt
```

- [ ] **Save Changes**
  - [ ] Click **Save changes**
  - [ ] Wait for automatic redeploy (~2 minutes)

### Monitor Deployment

- [ ] **Check Render Logs**
  - [ ] Go to **Logs** tab
  - [ ] Wait for deployment to complete
  - [ ] Look for success message:
    ```
    ✅ Server running on ...
    🔌 Socket.io listening on ws://...
    ✅ Notification worker initialized
    ```

- [ ] **Monitor for Errors**
  - [ ] No `ECONNREFUSED` errors
  - [ ] No missing environment variable warnings
  - [ ] No module import errors

---

## 🧪 PRODUCTION TESTING

### Health Endpoint

- [ ] **Test Health Check**
  ```bash
  curl https://your-backend.onrender.com/api/webhooks/health
  ```
  **Expected response:**
  ```json
  {
    "status": "ok",
    "timestamp": "2024-01-15T10:30:00Z",
    "server": "Render Node.js Backend"
  }
  ```

### Webhook Signature Verification

- [ ] **Test Webhook Auth**
  ```bash
  curl -X POST https://your-backend.onrender.com/api/webhooks/test \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer {SUPABASE_JWT_TOKEN}"
  ```
  **Expected response:**
  ```json
  {
    "success": true,
    "message": "Webhook signature verified successfully",
    "timestamp": "2024-01-15T10:30:00Z"
  }
  ```

### Socket.io Connection (Production)

- [ ] **From Frontend**
  ```javascript
  // In browser console on your deployed frontend
  const socket = io('https://your-backend.onrender.com/messages', {
    auth: { token: localStorage.getItem('authToken') }
  });
  
  socket.on('connect', () => {
    console.log('✅ Production Socket.io connected');
  });
  
  socket.on('error', (err) => {
    console.error('❌ Connection error:', err);
  });
  ```

### Test Job Notification Webhook

- [ ] **Simulate Job Posting**
  ```bash
  curl -X POST https://your-backend.onrender.com/api/webhooks/jobs/notify \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer {SUPABASE_JWT_TOKEN}" \
    -d '{
      "id": "test-job-1",
      "title": "Senior React Developer",
      "company_id": "comp-123",
      "location": "Paris",
      "required_skills": ["React", "Node.js"],
      "experience_level": "Senior",
      "job_type": "CDI"
    }'
  ```
  **Expected response:**
  ```json
  {
    "success": true,
    "jobId": "test-job-1",
    "candidatesMatched": 42,
    "message": "Job notification queued for 42 candidates"
  }
  ```

### Check Queue Health

- [ ] **Monitor Notification Queue**
  ```bash
  # Create temporary endpoint in server.ts:
  app.get('/api/admin/queue-health', async (req, res) => {
    const counts = await notificationQueue.getJobCounts();
    res.json(counts);
  });
  ```
  Then test:
  ```bash
  curl https://your-backend.onrender.com/api/admin/queue-health
  # Expected: { "waiting": 0, "active": 0, "completed": X, "failed": 0 }
  ```

---

## 📊 MONITORING & LOGGING

- [ ] **Setup Error Logging**
  - [ ] Configure error tracking (e.g., Sentry, LogRocket)
  - [ ] Add to environment variables
  - [ ] Initialize in server.ts

- [ ] **Setup Performance Monitoring**
  - [ ] Monitor response times
  - [ ] Track WebSocket connection metrics
  - [ ] Monitor queue processing times

- [ ] **Setup Alerts**
  - [ ] Alert on deployment failures
  - [ ] Alert on high error rates
  - [ ] Alert on database connection issues
  - [ ] Alert on Redis connection issues

- [ ] **Check Render Monitoring**
  - [ ] Go to **Render Dashboard > Services > Metrics**
  - [ ] Monitor CPU usage
  - [ ] Monitor memory usage
  - [ ] Monitor network traffic

---

## 🔒 SECURITY VERIFICATION

- [ ] **JWT Validation**
  - [ ] Test with invalid token → should return 401
  - [ ] Test with expired token → should return 401
  - [ ] Test with valid token → should work

- [ ] **Webhook Signature Verification**
  - [ ] Test with wrong signature → should return 401
  - [ ] Test with correct signature → should work

- [ ] **CORS Configuration**
  - [ ] Test from allowed origins → should work
  - [ ] Test from disallowed origins → should fail
  - [ ] WebSocket connections from allowed domains → should work

- [ ] **Socket.io Authentication**
  - [ ] Test connection without token → should fail
  - [ ] Test connection with invalid token → should fail
  - [ ] Test connection with valid token → should work

- [ ] **Rate Limiting**
  - [ ] Test rate limiter (120 requests/60s)
  - [ ] Verify 429 response when exceeded

---

## 🧠 DATA VALIDATION

- [ ] **Message Validation**
  - [ ] Empty messages rejected
  - [ ] Messages > 5000 chars rejected
  - [ ] Attachments properly stored

- [ ] **Job Validation**
  - [ ] Required fields present
  - [ ] Skills array properly formatted
  - [ ] Salary ranges valid

- [ ] **Candidate Matching**
  - [ ] Match scores calculated correctly
  - [ ] Only matching candidates notified
  - [ ] Skills filtering works

---

## 📱 FRONTEND INTEGRATION

- [ ] **Socket.io Client Installed**
  ```bash
  npm install socket.io-client
  ```

- [ ] **Socket Services Created**
  - [ ] `src/services/socket.ts` exists
  - [ ] All 3 namespaces configured
  - [ ] Auth token passed in socket init

- [ ] **Hooks Implemented**
  - [ ] `useMessages()` hook created
  - [ ] `useNotifications()` hook created
  - [ ] `usePresence()` hook created

- [ ] **Components Updated**
  - [ ] ChatWindow component uses useMessages
  - [ ] NotificationToast uses useNotifications
  - [ ] Online status indicator uses usePresence

- [ ] **Error Handling**
  - [ ] Connection errors shown to user
  - [ ] Automatic reconnection configured
  - [ ] Fallback to HTTP polling if WebSocket fails

---

## 🎬 PRODUCTION READINESS

- [ ] **Performance Tested**
  - [ ] Load test with 100+ concurrent users
  - [ ] Verify no memory leaks
  - [ ] Verify response times < 200ms

- [ ] **Database Performance**
  - [ ] Verify views return data < 100ms
  - [ ] Verify indexes are being used
  - [ ] Verify no N+1 queries

- [ ] **Queue Processing**
  - [ ] Queue processes jobs within 5 minutes
  - [ ] Failed jobs are retried
  - [ ] No messages lost on restart

- [ ] **Scalability Ready**
  - [ ] Redis adapter properly configured
  - [ ] Multiple Render instances can connect
  - [ ] Database connection pooling working

---

## 📚 DOCUMENTATION

- [ ] **API Documentation**
  - [ ] All endpoints documented
  - [ ] All error responses documented
  - [ ] All WebSocket events documented

- [ ] **Deployment Documentation**
  - [ ] Environment variables documented
  - [ ] Webhook setup documented
  - [ ] Troubleshooting guide created

- [ ] **Team Documentation**
  - [ ] Onboarding guide created
  - [ ] Architecture diagrams created
  - [ ] Code examples provided

---

## ✅ FINAL SIGN-OFF

### Pre-Deployment Sign-off
- [ ] **Developer Review**
  - [ ] Code review completed
  - [ ] All tests passing
  - [ ] No console errors

- [ ] **QA Review**
  - [ ] All features tested
  - [ ] No regressions found
  - [ ] Performance acceptable

### Deployment Sign-off
- [ ] **DevOps Review**
  - [ ] Infrastructure ready
  - [ ] Environment variables set
  - [ ] Monitoring configured

- [ ] **Product Review**
  - [ ] Feature requirements met
  - [ ] User experience verified
  - [ ] Ready for production

---

## 🚀 DEPLOYMENT EXECUTION

**Step 1:** Stop current backend (if upgrading)
```bash
# In Render: Suspend service temporarily
```

**Step 2:** Deploy new code
```bash
# Render: Automatic redeploy on git push
# or manual deployment from Render dashboard
```

**Step 3:** Verify deployment
```bash
# Check logs for successful startup
# Run health check endpoint
# Verify Socket.io connection
```

**Step 4:** Monitor for 1 hour
```bash
# Watch error rates
# Watch performance metrics
# Be ready to rollback if needed
```

**Step 5:** Notify stakeholders
```bash
# Send deployment notification
# Provide production URL
# List new features available
```

---

## 🆘 ROLLBACK PLAN

If issues occur:

1. **Immediate Actions**
   - [ ] Stop accepting new traffic
   - [ ] Alert team
   - [ ] Check logs for root cause

2. **Rollback Procedure**
   - [ ] Revert to previous git commit
   - [ ] Reset environment variables
   - [ ] Verify service health

3. **Post-Incident**
   - [ ] Document what went wrong
   - [ ] Plan fix for next attempt
   - [ ] Schedule retry

---

**Checklist Version**: 1.0  
**Last Updated**: 2024  
**Status**: Ready for Use

Good luck with your deployment! 🚀
