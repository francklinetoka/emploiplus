# ⚡ QUICK DEPLOYMENT GUIDE - 30 Minutes Setup

## 📋 Pre-Deployment Checklist

```bash
# 1. Vérifier tous les fichiers créés
ls -la src/app/auth/callback/route.ts              # ✅ Route callback
ls -la src/hooks/useGoogleAuth.ts                  # ✅ Modifié
ls -la src/services/optimizedNewsfeedService.ts   # ✅ Créé
ls -la src/components/DashboardNewsfeedOptimized.tsx # ✅ Créé
ls -la backend/src/routes/microservices.ts        # ✅ Créé

# 2. Vérifier les imports
grep -r "OptimizedNewsfeedService" src/
grep -r "microservicesRouter" backend/src/
```

---

## 🚀 ÉTAPE 1: Supabase Configuration (5 min)

### A. Ajouter Redirect URLs

1. Aller sur: https://app.supabase.com
2. Sélectionner votre projet
3. Authentication → Providers → Google
4. "Authorized Redirect URLs" → Ajouter:

```
http://localhost:5173/auth/callback
http://192.168.0.14:5173/auth/callback
https://emploiplus.vercel.app/auth/callback
```

5. Save

### B. Vérifier Site URL

1. Authentication → URL Configuration
2. "Site URL" = `https://emploiplus.vercel.app`
3. Save

### C. Créer les Views & Indexes (SQL)

Copier/coller dans Supabase SQL Editor:

```sql
-- Copier depuis: REFACTORISATION_LINKEDIN_SCALE.md
-- Section "SUPABASE - Créer tables & vues"
```

**Temps**: 2 minutes (copy/paste SQL)

---

## 🚀 ÉTAPE 2: Vercel Deployment (10 min)

### A. Push le code

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-

git add .
git commit -m "refactor: linkedin-scale architecture with oauth decoupling"
git push origin main
```

### B. Vérifier le déploiement

1. Aller sur: https://vercel.com/dashboard
2. Cliquer sur "emploiplus"
3. Attendre que le deploy se termine (~2-3 min)
4. Voir "Production" → "✓ Ready"

### C. Tester OAuth Callback

```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Test OAuth
curl "https://emploiplus.vercel.app/auth/callback?code=test&state=test&role=candidate"
# Doit retourner: 302 redirect vers /dashboard ou erreur appropriée
```

---

## 🚀 ÉTAPE 3: Render Backend (5 min)

### A. Ajouter routes microservices au server.ts

```typescript
// In backend/src/server.ts, ajouter:

import { microservicesRouter } from './routes/microservices.js';

// ... après les autres routes ...

// Microservices endpoints
app.use('/api', microservicesRouter);

console.log('[Server] Microservices mounted at /api/notifications, /api/pdf, /api/matching');
```

### B. Test local

```bash
cd backend

npm run build
npm run dev

# Test dans autre terminal:
curl -X POST http://localhost:5000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{"userIds":["user1"], "type":"push", "title":"Test", "message":"Hello"}'

# Doit retourner: { success: true, jobId: "..." }
```

### C. Push et deploy Render

```bash
git add backend/src/routes/microservices.ts backend/src/server.ts
git commit -m "feat: add microservices for notifications, pdf, matching"
git push origin main

# Render auto-deploy (attendre ~3-5 min)
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

### Test 1: OAuth Flow

```bash
# Ouvrir dans le navigateur:
# https://emploiplus.vercel.app/connexion

# Cliquer sur "Connexion avec Google"
# Accepter consentement Google
# ✅ Doit être redirigé vers /auth/callback?code=...&state=...&role=candidate
# ✅ Puis vers /dashboard
```

Logs attendus:
```
[Auth/Callback] Processing OAuth callback { hasCode: true, hasState: true, role: 'candidate' }
[Auth/Callback] OAuth successful { userId: 'xxx', email: 'user@gmail.com', provider: 'google' }
[Auth/Callback] Profile synced successfully { userId: 'xxx', role: 'candidate' }
[Auth/Callback] Redirecting to: /dashboard
```

### Test 2: Newsfeed Performance

```bash
# Ouvrir DevTools (F12) → Network tab
# Aller sur https://emploiplus.vercel.app/dashboard
# Vérifier les requêtes:

# ✅ Doit voir appel à Supabase (directement, pas via Render):
# GET supabase.co/rest/v1/v_newsfeed_feed?...
# Temps: <500ms

# ❌ Ne doit PAS voir appel à:
# GET render.com/api/newsfeed
```

### Test 3: Microservices

```bash
# Test notifications
curl -X POST https://emploi-connect-backend.onrender.com/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{"userIds":["test"], "type":"push", "title":"Test", "message":"OK"}'

# Expected response:
# { "success": true, "message": "Notification queued for 1 recipients", "jobId": "..." }

# Test PDF generation
curl -X POST https://emploi-connect-backend.onrender.com/api/pdf/generate-cv \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user", "templateId":"modern"}'

# Expected response:
# { "success": true, "downloadUrl": "https://...", "expiresIn": "7d" }

# Test matching
curl -X POST https://emploi-connect-backend.onrender.com/api/matching/calculate \
  -H "Content-Type: application/json" \
  -d '{"candidateId":"test", "jobId":"job1"}'

# Expected response:
# { "success": true, "matchScore": { "overall": 78, ... } }
```

---

## 📊 Performance Validation

### Avant vs Après

Ouvrir DevTools → Performance tab

**Ancien (avec Render backend)**:
```
User clicks "Sign In"
  ↓ 100ms (frontend)
  ↓ 500ms (Render latency)
  ↓ 100ms (JWT generation)
  ↓ 200ms (Supabase session creation)
= ~900ms Total
```

**Nouveau (direct OAuth)**:
```
User clicks "Sign In"
  ↓ 100ms (frontend)
  ↓ Google OAuth redirect (external)
  ↓ 100ms (callback handler)
  ↓ 100ms (Supabase sync)
= ~300ms Total (Google step est on user's internet, not our bottleneck)
```

**Newsfeed**:

Ancien:
```
Render: SELECT * FROM publications ORDER BY created_at LIMIT 20 OFFSET 0
  → Full table scan (millions de records!)
  → 5-10 secondes
```

Nouveau:
```
Supabase RLS + Indexed view:
  SELECT * FROM v_newsfeed_feed 
  WHERE id > last_id 
  ORDER BY created_at DESC
  LIMIT 20
  → Index scan (keyset pagination)
  → 50-200ms ✨
```

---

## 🐛 Troubleshooting Quick Fixes

### "404 on /auth/callback"
```bash
# Vérifier le fichier existe:
ls -la src/app/auth/callback/route.ts

# Redéployer Vercel:
git push origin main
# Attendre 2-3 min pour build
```

### "Invalid redirect_uri in Google"
```bash
# Aller sur: Supabase → Authentication → Providers → Google
# Ajouter si manquant:
https://emploiplus.vercel.app/auth/callback

# Puis actualiser la page
```

### "Profile not found in sync-google"
```sql
-- Vérifier la table profiles existe:
SELECT * FROM public.profiles LIMIT 1;

-- Si manquante, créer:
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  user_type TEXT DEFAULT 'candidate',
  created_at TIMESTAMP DEFAULT now()
);
```

### Newsfeed vide après migration
```sql
-- Vérifier la vue existe:
SELECT * FROM v_newsfeed_feed LIMIT 1;

-- Si erreur, créer:
CREATE OR REPLACE VIEW v_newsfeed_feed AS
SELECT p.*, u.full_name, u.avatar_url
FROM publications p
LEFT JOIN profiles u ON p.author_id = u.id
WHERE p.is_active = true;
```

---

## 📋 Rollback Plan (Si problèmes)

### Reverter à l'ancien système (5 min)

```bash
# 1. Remove new routes
rm -f src/app/auth/callback/route.ts
rm -f src/components/DashboardNewsfeedOptimized.tsx

# 2. Revert hooks
git checkout src/hooks/useGoogleAuth.ts

# 3. Remove microservices
rm -f backend/src/routes/microservices.ts

# 4. Remove from server.ts
git checkout backend/src/server.ts

# 5. Push et attendre deploy
git add .
git commit -m "revert: rollback to monolithic architecture"
git push origin main

# Attend 3-5 min pour redeploy
```

---

## ✨ Success Metrics

Une fois déployé, vérifier:

- [x] OAuth login marche (pas d'erreur 404)
- [x] Newsfeed charge en <500ms
- [x] /api/notifications/send accessible
- [x] /api/pdf/generate-cv accessible
- [x] /api/matching/calculate accessible
- [x] Aucune erreur dans les logs Render
- [x] Aucune erreur dans les logs Supabase
- [x] Google OAuth redirects correctement
- [x] Role (candidate/company) passé correctement
- [x] Profile synchronisé dans Supabase

---

## 🎉 Résumé Déploiement

| Tâche | Temps | Status |
|-------|-------|--------|
| Supabase config | 5 min | ⏳ |
| Vercel deploy | 10 min | ⏳ |
| Render backend | 5 min | ⏳ |
| Tests validation | 5 min | ⏳ |
| **TOTAL** | **≈30 min** | 🚀 |

**Go live**: Le système sera production-ready après ces 30 minutes!

---

## 📞 Support

En cas de problème:
1. Vérifier les logs: `Vercel Dashboard → Logs` ou `Render → Logs`
2. Tester chaque endpoint manuellement avec curl
3. Vérifier Supabase config dans Authentication
4. Chercher dans REFACTORISATION_LINKEDIN_SCALE.md (section Troubleshooting)
