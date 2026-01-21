# 🏗️ Architecture de Déploiement Emploiplus

## Schéma Global

```
┌─────────────────────────────────────────────────────────────┐
│                     UTILISATEURS                             │
└────┬────────────────────────────────────────────────────────┘
     │
     │ HTTPS
     │
     ├──────────────────────────┬──────────────────────────┐
     │                          │                          │
     v                          v                          v
┌──────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Vercel         │    │   Vercel         │    │  Vercel         │
│   Frontend       │    │   API Routes     │    │  Caching        │
│                  │    │   (optional)     │    │  & CDN          │
│ • React/ShadCN  │    │                  │    │                 │
│ • Vite Build    │    │ [Not used here]  │    │ Global          │
│ • dist/         │    │                  │    │ Distribution    │
└────────┬─────────┘    └──────────────────┘    └────────┬────────┘
         │                                              │
         └──────────────────┬───────────────────────────┘
                            │ API Calls
                            v
                    ┌──────────────────┐
                    │  Render          │
                    │  Web Service     │
                    │                  │
                    │ • Node.js        │
                    │ • Express        │
                    │ • TypeScript     │
                    │ • /api/*         │
                    └────────┬─────────┘
                             │ SQL Queries
                             v
                    ┌──────────────────┐
                    │  Supabase        │
                    │  PostgreSQL      │
                    │                  │
                    │ • users          │
                    │ • jobs           │
                    │ • applications   │
                    │ • publications   │
                    │ • ... (+ 30 tables)
                    └──────────────────┘
```

---

## Flux de Déploiement

```
1️⃣  GIT PUSH
    GitHub Repository
            │
            ├─────────────────┬─────────────────┐
            │                 │                 │
            v                 v                 v
        Vercel          Render           (Manual)
        Webhook         Webhook          Supabase

2️⃣  BUILD PROCESS
    Vercel:                 Render:
    npm install             npm install (backend/)
    npm run build           npm run build
    dist/                   dist/server.js

3️⃣  DEPLOYMENT
    Vercel CDN      →→→     Render Dyno    →→→   Supabase DB
    (Global)                 (Single Server)     (Managed PostgreSQL)

4️⃣  LIVE
    Frontend: https://emploiplus.vercel.app
    Backend:  https://emploiplus-backend.onrender.com
    Database: Supabase (auto-backups)
```

---

## Environnements

### Development
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
Database: localhost:5432 (local PostgreSQL)
```

### Staging (optional)
```
Frontend: https://staging-emploiplus.vercel.app
Backend:  https://staging-backend.onrender.com
Database: Supabase (staging instance)
```

### Production
```
Frontend: https://emploiplus.vercel.app
Backend:  https://emploiplus-backend.onrender.com
Database: Supabase PostgreSQL (prod)
```

---

## Communication

### 1. Frontend → Backend
```
Endpoint Vercel
    ↓
https://emploiplus.vercel.app
    ↓
VITE_API_BASE_URL = https://emploiplus-backend.onrender.com
    ↓
API calls /api/...
    ↓
Endpoint Render
```

### 2. Backend → Database
```
Render Service
    ↓
process.env.DATABASE_URL
    ↓
postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
    ↓
Supabase PostgreSQL Server
```

### 3. Security
```
CORS (Backend)
├─ https://emploiplus.vercel.app ✅
├─ http://localhost:5173 (dev) ✅
├─ * ❌ (NEVER in production)

JWT (Authentication)
├─ JWT_SECRET: same everywhere
├─ Tokens expire: 24h
├─ Stored: localStorage (frontend)
```

---

## Fichiers Importants par Service

### Vercel Deploie
```
src/
├── components/
├── pages/
├── App.tsx
├── main.tsx
package.json
vite.config.ts
vercel.json          ← Config Vercel
.env.production      ← Env vars
```

### Render Deploie
```
backend/
├── src/
│   ├── server.ts
│   ├── config/
│   │   └── database.ts
│   ├── services/
│   ├── routes/
├── dist/            ← Build output
├── package.json
├── tsconfig.json
render.yaml          ← Config Render
backend/.env.example ← Template
```

### Supabase Manages
```
Database Schema:
├── users
├── jobs
├── job_applications
├── publications
├── messages
├── conversations
├── banned_words_backend
├── profanity_violations
├── ... (+ 20 more tables)

Backups:
├── Daily
├── Point-in-time recovery (PITR)
└── Manual exports
```

---

## CI/CD Pipeline

```
Push to GitHub
    ↓
GitHub Webhooks
    ├─→ Vercel (frontend build)
    │   ├─ npm install
    │   ├─ npm run build
    │   ├─ dist/ → CDN
    │   └─ live in 30-60s
    │
    └─→ Render (backend build)
        ├─ npm install (backend/)
        ├─ npm run build
        ├─ Restart service
        └─ live in 2-5min

Environment Changes
    ↓
Manual (on Render/Vercel dashboards)
    ├─ Update JWT_SECRET
    ├─ Update DATABASE_URL
    ├─ Update CORS_ORIGINS
    └─ Auto-redeploy
```

---

## Monitoring & Alerts

### Vercel
```
Metrics:
├─ Build time
├─ Deployment status
├─ HTTP status codes
├─ Response times
└─ Error rate

Alerts:
├─ Build failed
├─ High error rate
└─ Deployment issues
```

### Render
```
Metrics:
├─ CPU usage
├─ Memory usage
├─ Connection pool
├─ Error logs
└─ Uptime

Alerts:
├─ Service crash
├─ High error rate
├─ DB connection failed
└─ Memory exhausted
```

### Supabase
```
Metrics:
├─ Query performance
├─ Connections
├─ Storage size
├─ Backup status

Alerts:
├─ DB down
├─ Storage quota
├─ Slow queries
└─ Failed backups
```

---

## Disaster Recovery

### Data Loss Prevention
```
Supabase:
├─ Automated backups (daily)
├─ Point-in-time recovery
├─ Replication enabled
└─ 30-day retention

Secrets:
├─ Stored in env vars (never in code)
├─ Rotated every 6 months
└─ Backed up securely
```

### Service Recovery
```
Frontend down:
├─ Vercel auto-redeploy previous version
├─ CDN fallback (cached content)
└─ Manual rollback available

Backend down:
├─ Render auto-restart
├─ Health checks enabled
├─ Manual restart in dashboard
└─ Swap to staging (if available)

Database down:
├─ Supabase handles replication
├─ Read replicas available
├─ Point-in-time recovery
└─ Failover automatic
```

---

## Coûts Estimés (Free Tier / Paid)

```
Vercel:
├─ Pro: Free (with usage limits)
├─ Pro: $20/month (recommended)

Render:
├─ Free: Limited (0.5 vCPU)
├─ Starter: $7/month (1 vCPU)
├─ Standard: $12/month (2 vCPU) ← Recommended

Supabase:
├─ Free: 500MB storage, 1GB bandwidth
├─ Pro: $25/month (8GB storage)
├─ Team: Custom pricing

Total Monthly: ~$40-50 for production-ready setup
```

---

**Architecture prête pour production! 🚀**
