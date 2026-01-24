# Deployment & Integration Checklist

## Phase 1: Local Development Setup

- [ ] **1.1 Environment Variables**
  ```bash
  # In backend/.env, add:
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  SUPABASE_WEBHOOK_SECRET=dev-secret
  REDIS_HOST=localhost
  REDIS_PORT=6379
  REDIS_PASSWORD=
  ```

- [ ] **1.2 Redis Installation** (if testing locally)
  ```bash
  # macOS
  brew install redis
  redis-server
  
  # Or use Docker
  docker run -d -p 6379:6379 redis:latest
  ```

- [ ] **1.3 Database Setup in Supabase**
  ```bash
  # Execute migrations in order:
  # 1. backend/migrations/001_optimize_supabase.sql
  # 2. backend/migrations/002_newsfeed_optimization.sql
  # 3. backend/migrations/003_job_matches_activity_logs.sql
  # 4. backend/migrations/004_engagement_function.sql
  ```

- [ ] **1.4 Start Backend Server**
  ```bash
  cd backend
  npm run dev
  # Should see: "Server running on http://localhost:3001"
  # And: "All workers ready"
  ```

- [ ] **1.5 Test Webhooks Locally**
  ```bash
  ./test-webhooks.sh http://localhost:3001
  # Should see 5 tests pass
  ```

---

## Phase 2: Render Deployment

- [ ] **2.1 Build & Push Code**
  ```bash
  git add .
  git commit -m "feat: Add webhook microservices with BullMQ queues"
  git push origin main
  ```

- [ ] **2.2 Render Environment Variables**
  
  Go to Render > Your Service > Environment
  
  ```
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  SUPABASE_WEBHOOK_SECRET=your-secure-secret-here
  REDIS_HOST=redis-instance.render.com  (from Redis service)
  REDIS_PORT=6379
  REDIS_PASSWORD=your-redis-password
  CORS_ORIGINS=http://localhost:5173,https://emploiplus.vercel.app
  JWT_SECRET=your-jwt-secret
  NODE_ENV=production
  ```

- [ ] **2.3 Redis Service on Render**
  
  Create a Redis instance:
  - Go to Render Dashboard
  - New > Redis
  - Select "Free" plan
  - Copy connection details to backend env vars

- [ ] **2.4 Verify Deployment**
  ```bash
  curl https://your-backend.onrender.com/api/health/webhooks
  # Should return: { status: 'ok', webhooks: [...], timestamp: '...' }
  ```

---

## Phase 3: Supabase Webhook Configuration

- [ ] **3.1 Create Webhooks in Supabase**
  
  Go to Supabase Dashboard > Database > Webhooks
  
  **Webhook 1: Job Analysis**
  - Event: INSERT on jobs
  - URL: `https://your-backend.onrender.com/api/jobs/analyze`
  - Headers:
    - Key: `x-webhook-secret`
    - Value: `your-SUPABASE_WEBHOOK_SECRET`

  **Webhook 2: Post Moderation**
  - Event: INSERT on posts
  - URL: `https://your-backend.onrender.com/api/posts/moderate`
  - Headers: Same as above

  **Webhook 3: Activity Scoring**
  - Event: INSERT on activity_logs
  - URL: `https://your-backend.onrender.com/api/activity/score`
  - Headers: Same as above

- [ ] **3.2 Test Webhook Triggers**
  
  From Supabase SQL Editor, insert test data:
  ```sql
  INSERT INTO jobs (title, description) 
  VALUES ('Test Job', 'Test Description');
  -- Should trigger POST /api/jobs/analyze webhook
  ```

---

## Phase 4: Monitoring & Verification

- [ ] **4.1 Check Health Endpoints**
  ```bash
  # Webhook health
  curl https://your-backend.onrender.com/api/health/webhooks
  
  # Queue health (if integrated)
  curl https://your-backend.onrender.com/api/health/queues
  ```

- [ ] **4.2 Monitor Render Logs**
  ```
  Render Dashboard > Your Service > Logs
  
  Look for:
  - "[Job Analysis] Processing job..."
  - "[Post Moderation] Processing post..."
  - "[Activity Scoring] Recording..."
  ```

- [ ] **4.3 Check Database Records**
  
  From Supabase SQL Editor:
  ```sql
  SELECT * FROM job_matches ORDER BY created_at DESC LIMIT 5;
  SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 5;
  ```

- [ ] **4.4 Monitor Queue Status**
  
  From Render logs, verify BullMQ workers are running:
  ```
  [Queues] All workers ready
  ```

---

## Phase 5: Performance Tuning

- [ ] **5.1 Monitor Response Times**
  
  Webhook responses should be **< 100ms**:
  ```bash
  time curl -X POST https://your-backend.onrender.com/api/jobs/analyze \
    -H "x-webhook-secret: secret" \
    -d '{"jobId":1,"title":"Test","requiredSkills":["React"]}'
  ```

- [ ] **5.2 Check Redis Memory Usage**
  
  From Render Redis dashboard:
  - Monitor memory used vs. limit
  - Check if queue is growing (jobs not processing)

- [ ] **5.3 Verify Worker Concurrency**
  
  Expected throughput:
  - Job Analysis: 300 jobs/min (5 workers)
  - Post Moderation: 600 posts/min (10 workers)
  - Activity Scoring: 1,200 activities/min (20 workers)

---

## Phase 6: Production Hardening

- [ ] **6.1 Enable RLS Policies**
  
  From Supabase SQL Editor:
  ```sql
  ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;
  ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
  ```

- [ ] **6.2 Add Webhook Retry Logic**
  
  Supabase automatically retries failed webhooks
  - Check Supabase Dashboard > Database > Webhook Logs

- [ ] **6.3 Setup Error Tracking**
  
  Monitor Render logs for errors:
  ```
  ERROR [Job Analysis] Error:
  ERROR [Post Moderation] Error:
  ERROR [Activity Scoring] Error:
  ```

- [ ] **6.4 Rate Limiting**
  
  Current setup: 120 requests/min per IP
  - Monitor for DDoS attacks
  - Adjust in src/server.ts if needed

---

## Troubleshooting

### Webhooks Not Triggering
```bash
# 1. Verify webhook is configured in Supabase
# 2. Check Supabase Webhook Logs for errors
# 3. Verify x-webhook-secret matches
# 4. Check Render logs for 401 errors
```

### Slow Response Time (> 100ms)
```bash
# 1. Check Redis connection (REDIS_HOST, REDIS_PORT)
# 2. Monitor queue size in Redis
# 3. Check Render CPU usage
# 4. Increase concurrency in microserviceQueues.ts if needed
```

### Database Errors
```bash
# 1. Verify tables exist: job_matches, activity_logs
# 2. Check column names match code (job_id, candidate_id, etc.)
# 3. Run migration 004 to create increment_engagement function
# 4. Check RLS policies don't block insert operations
```

### Redis Connection Failed
```bash
# 1. Verify Redis service is running
# 2. Check REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
# 3. Test connection: redis-cli -h host -p port
# 4. Increase Redis timeout in microserviceQueues.ts
```

---

## Files Created/Modified

| File | Status | Purpose |
|------|--------|---------|
| `src/routes/webhook-microservices.ts` | ✅ Created | 3 webhook routes |
| `src/services/microserviceQueues.ts` | ✅ Modified | Added initializeQueues export |
| `migrations/004_engagement_function.sql` | ✅ Created | Engagement increment function |
| `test-webhooks.sh` | ✅ Created | Local testing script |
| `src/SERVER_INTEGRATION_GUIDE.ts` | ✅ Existing | Reference documentation |

---

## Next Steps

1. **Execute all database migrations** in Supabase SQL Editor
2. **Set environment variables** on Render
3. **Create webhooks** in Supabase Dashboard
4. **Deploy** to Render (git push main)
5. **Test** with curl or webhook trigger
6. **Monitor** logs and queue health
7. **Optimize** concurrency based on load

---

**Version**: 1.0  
**Date**: January 24, 2026  
**Status**: Ready for Deployment
