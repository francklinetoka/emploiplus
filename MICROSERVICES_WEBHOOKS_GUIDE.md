# 🚀 MICROSERVICES WEBHOOKS - INTEGRATION GUIDE

## 📋 OVERVIEW

Vous avez maintenant **3 routes microservices** sur votre backend Render:

```
POST /api/jobs/analyze       → Analyser les offres d'emploi
POST /api/posts/moderate     → Modérer les posts
POST /api/activity/score     → Calculer l'engagement
```

Chaque route:
✅ Répond en **< 1 seconde** (200 OK)  
✅ Valide le header **x-webhook-secret**  
✅ Délègue au **Worker en arrière-plan**  
✅ Traite via **BullMQ queue**

---

## 🔧 CONFIGURATION REQUISE

### 1. Environment Variables

Ajouter à `backend/.env`:

```env
# Existing
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# NEW: Webhook Secret (same as in Supabase)
SUPABASE_WEBHOOK_SECRET=your_webhook_secret_here_12345

# Redis (for BullMQ)
REDIS_HOST=redis-xxxxx.ec2.cloud.redislabs.com
REDIS_PORT=19736
REDIS_PASSWORD=your_password_here
```

### 2. Install Dependencies

```bash
npm install --save bullmq redis
```

### 3. Update server.ts

Ajouter après les imports:

```typescript
import webhookMicroservices from './routes/webhook-microservices';
import { 
  jobAnalysisWorker, 
  postModerationWorker, 
  activityScoringWorker,
  checkQueueHealth 
} from './services/microserviceQueues';

// ... plus bas dans server.ts ...

// Mount webhook microservices routes
app.use('/api', webhookMicroservices);

// Health check endpoint
app.get('/api/health/queues', async (req, res) => {
  const health = await checkQueueHealth();
  res.json(health);
});

// Workers sont automatiquement initialisés au démarrage
console.log('[Microservices] Job analysis worker ready');
console.log('[Microservices] Post moderation worker ready');
console.log('[Microservices] Activity scoring worker ready');
```

---

## 🔐 WEBHOOK SECURITY

### Signer les appels Webhook

Tous les appels doivent inclure le header `x-webhook-secret`:

```bash
curl -X POST https://your-backend.onrender.com/api/jobs/analyze \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: your_webhook_secret_here_12345" \
  -d '{
    "jobId": "job-123",
    "title": "Senior Developer",
    "description": "...",
    "requiredSkills": ["React", "Node.js"],
    "experienceLevel": "Senior"
  }'
```

### Depuis Supabase Webhooks

Si les webhooks viennent de Supabase, configurer:

1. Aller à **Database > Webhooks** dans Supabase
2. Créer webhook:
   ```
   Event: INSERT on public.jobs
   URL: https://your-backend.onrender.com/api/jobs/analyze
   Method: POST
   Headers:
     - x-webhook-secret: your_webhook_secret_here_12345
   ```

---

## 📡 ROUTE 1: /api/jobs/analyze

### Purpose
Analyser une nouvelle offre d'emploi:
- Extraire les compétences requises
- Trouver les candidats avec matching
- Créer les entrées `job_matches` dans Supabase
- Mettre à jour le job avec le count de candidats

### Request

```bash
POST /api/jobs/analyze
Content-Type: application/json
x-webhook-secret: your_webhook_secret

{
  "jobId": "job-123",
  "title": "Senior React Developer",
  "description": "We're looking for a skilled React developer...",
  "company_id": "comp-456",
  "location": "Paris, France",
  "requiredSkills": ["React", "TypeScript", "Node.js", "PostgreSQL"],
  "experienceLevel": "Senior"
}
```

### Response (Immédiate)

```json
{
  "success": true,
  "jobId": "job-123",
  "message": "Job analysis queued",
  "processingId": "job-job-123-1705323600000"
}
```

### Background Processing

Le Worker:
1. Extrait les skills du description
2. Recherche dans `candidates` table
3. Crée les `job_matches` avec score
4. Met à jour le job: `analysis_completed = true`

### Database Schema

Assurez-vous d'avoir:

```sql
CREATE TABLE IF NOT EXISTS job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  match_score INTEGER (0-100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_job_matches_job_id ON job_matches(job_id);
CREATE INDEX idx_job_matches_candidate_id ON job_matches(candidate_id);
```

---

## 📡 ROUTE 2: /api/posts/moderate

### Purpose
Modérer un post du newsfeed:
- Détecter spam/haineux
- Analyser images (NSFW, violence)
- Vérifier URLs externes
- Marquer ou bloquer si nécessaire

### Request

```bash
POST /api/posts/moderate
Content-Type: application/json
x-webhook-secret: your_webhook_secret

{
  "postId": "post-789",
  "content": "Check out this amazing opportunity!",
  "images": ["https://example.com/image1.jpg"],
  "links": ["https://example.com/opportunity"],
  "userId": "user-123"
}
```

### Response (Immédiate)

```json
{
  "success": true,
  "postId": "post-789",
  "message": "Post moderation queued",
  "processingId": "post-post-789-1705323600000"
}
```

### Background Processing

Le Worker:
1. Vérifie spam keywords
2. Analyse les images via Google Vision (optionnel)
3. Vérifie les liens
4. Met à jour `posts.is_flagged = true` si détecté

### Database Schema

Assurez-vous d'avoir:

```sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS flag_reason TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP;

CREATE INDEX idx_posts_is_flagged ON posts(is_flagged);
```

---

## 📡 ROUTE 3: /api/activity/score

### Purpose
Calculer le score d'engagement utilisateur:
- Attribuer des points par action (like, comment, share)
- Appliquer bonus/malus (heures creuses = +50%)
- Enregistrer dans `activity_logs`
- Mettre à jour le profil utilisateur

### Request

```bash
POST /api/activity/score
Content-Type: application/json
x-webhook-secret: your_webhook_secret

{
  "userId": "user-123",
  "action": "like",
  "targetId": "post-789",
  "targetType": "post"
}
```

**Actions supportées:**
- `view` = 1 point
- `like` = 5 points
- `comment` = 10 points
- `share` = 15 points
- `apply` = 20 points

### Response (Immédiate)

```json
{
  "success": true,
  "userId": "user-123",
  "action": "like",
  "message": "Activity scored",
  "processingId": "activity-user-123-1705323600000"
}
```

### Background Processing

Le Worker:
1. Calcule les points selon l'action
2. Applique multiplicateur (heures creuses = 1.5x)
3. Enregistre dans `activity_logs`
4. Mettre à jour `users.engagement_score`
5. Mettre à jour `users.last_activity_at`

### Database Schema

Assurez-vous d'avoir:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  target_type VARCHAR(50),
  target_id VARCHAR(255),
  points_earned INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
```

---

## 🧪 TESTING

### Test Local

```bash
# Démarrer le serveur
npm run dev

# Test route 1: Job Analysis
curl -X POST http://localhost:3001/api/jobs/analyze \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: dev-secret-123" \
  -d '{
    "jobId": "test-job-1",
    "title": "Test Job",
    "requiredSkills": ["React"],
    "experienceLevel": "Senior"
  }'

# Test route 2: Post Moderation
curl -X POST http://localhost:3001/api/posts/moderate \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: dev-secret-123" \
  -d '{
    "postId": "test-post-1",
    "content": "This is a test post"
  }'

# Test route 3: Activity Scoring
curl -X POST http://localhost:3001/api/activity/score \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: dev-secret-123" \
  -d '{
    "userId": "user-1",
    "action": "like",
    "targetId": "post-1",
    "targetType": "post"
  }'

# Test Queue Health
curl http://localhost:3001/api/health/queues
```

---

## 📊 MONITORING

### Queue Status

```bash
curl https://your-backend.onrender.com/api/health/queues
```

Response:
```json
{
  "status": "ok",
  "queues": {
    "job-analysis": {
      "waiting": 5,
      "active": 2,
      "completed": 150,
      "failed": 0
    },
    "post-moderation": {
      "waiting": 12,
      "active": 3,
      "completed": 500,
      "failed": 1
    },
    "activity-scoring": {
      "waiting": 100,
      "active": 10,
      "completed": 5000,
      "failed": 5
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Render Logs

```bash
# Watch logs for processing
tail -f render.log | grep "Worker"

# Expected output:
[Worker] Analyzing job job-123: Senior Developer
[Worker] Found 45 candidates
[Worker] Created 45 match records
[Worker] Job analysis completed: job-123
```

---

## ⚙️ PERFORMANCE TUNING

### Concurrency

Chaque worker a une concurrence configurable:

```typescript
// In microserviceQueues.ts
jobAnalysisWorker = new Worker(..., {
  concurrency: 5,   // Traiter 5 jobs en parallèle
});

postModerationWorker = new Worker(..., {
  concurrency: 10,  // Plus rapide
});

activityScoringWorker = new Worker(..., {
  concurrency: 20,  // Très rapide
});
```

### Retry Strategy

```typescript
defaultJobOptions: {
  attempts: 3,           // Réessayer 3 fois
  backoff: {
    type: 'exponential',
    delay: 2000,         // 2s, 4s, 8s
  },
}
```

### Redis Persistence

Pour éviter la perte de jobs:

```typescript
// Persister la queue même si serveur redémarre
// BullMQ le fait automatiquement via Redis
```

---

## 🚀 DEPLOYMENT TO RENDER

### Step 1: Update Environment Variables

In Render Dashboard:

```
SUPABASE_WEBHOOK_SECRET=your_secret_here
REDIS_HOST=redis-xxxxx.ec2.cloud.redislabs.com
REDIS_PORT=19736
REDIS_PASSWORD=your_password
```

### Step 2: Deploy

```bash
git push origin main
# Render auto-deploys
```

### Step 3: Verify

```bash
# Health check
curl https://your-backend.onrender.com/api/health/queues

# Should return:
# { "status": "ok", "queues": { ... } }
```

---

## 📈 SCALING

### Multi-Instance Setup

Si vous avez plusieurs instances Render:

```typescript
// Redis adapter permet la communication entre instances
// BullMQ gère la distribution des jobs automatiquement
const connection = {
  host: process.env.REDIS_HOST,  // Partagé entre instances
  port: process.env.REDIS_PORT,
};
```

### Load Balancing

- Route 1 (/jobs/analyze): ~2 secondes processing
- Route 2 (/posts/moderate): ~1 seconde processing
- Route 3 (/activity/score): ~200ms processing

Chaque Render instance peut traiter:
- 5 * 60 = 300 jobs/analyse par minute
- 10 * 60 = 600 posts/modération par minute
- 20 * 60 = 1200 activities/scoring par minute

**Total: 2100 webhooks/minute par instance**

---

## 🆘 TROUBLESHOOTING

### Issue: "Unauthorized: Invalid webhook secret"

**Solution**: Vérifier que:
```bash
# Dans backend/.env
SUPABASE_WEBHOOK_SECRET=your_exact_secret

# Dans le header de la requête
x-webhook-secret: your_exact_secret

# Doivent être IDENTIQUES
```

### Issue: Jobs pas traités

**Check:**
1. Redis connection:
   ```bash
   redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping
   ```

2. Render logs pour erreurs worker
3. Health endpoint:
   ```bash
   curl /api/health/queues | jq '.queues."job-analysis".waiting'
   ```

### Issue: Lent response

**Check:**
- Est-ce que la réponse 200 OK arrive vite? (< 1s) → OK
- Est-ce que les jobs se traitent après? → Vérifier worker

Rappel: La réponse au webhook doit être immédiate!

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Environment variables configurées
- [ ] `bullmq` + `redis` installés
- [ ] server.ts mise à jour
- [ ] Routes montées: `/api/jobs/analyze`, `/api/posts/moderate`, `/api/activity/score`
- [ ] Workers initialisés
- [ ] Tests locaux passés
- [ ] Déployé sur Render
- [ ] Health check répond
- [ ] Webhooks Supabase configurés
- [ ] Monitoring en place

---

**Version**: 1.0  
**Status**: Production Ready  
**Last Updated**: 2024
