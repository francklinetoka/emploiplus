# 📦 Configuration pour déploiement Render + Vercel + Supabase

## Variables d'environnement requises

### Backend (Render)
```
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
JWT_SECRET=[Clé secrète forte, ex: $(openssl rand -hex 32)]
GOOGLE_CLIENT_ID=[De Google Cloud Console]
GOOGLE_CLIENT_SECRET=[De Google Cloud Console]
CORS_ORIGINS=https://emploiplus.vercel.app,http://localhost:5173
NODE_ENV=production
PORT=5000
```

### Frontend (Vercel)
```
VITE_API_BASE_URL=https://emploiplus-backend.onrender.com
```

## Structure du déploiement

```
GitHub Repository
    ├── backend/
    │   ├── src/
    │   ├── dist/
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── .env.example
    │
    ├── src/
    ├── vite.config.ts
    ├── package.json
    │
    ├── render.yaml          ← Config Render
    ├── vercel.json          ← Config Vercel
    ├── .env.production      ← Frontend prod env
    └── DEPLOYMENT_GUIDE.md
```

## Points importants

### 1. Database Connection (Supabase)
- URL doit être complète avec le mot de passe
- Pool minimum: 5, Maximum: 20
- Connection timeout: 10s
- Idle timeout: 30s

### 2. Authentication (JWT)
- Clé secrète doit être la même partout
- Expiration tokens: 24h (configurable)
- Secret jamais exposé au frontend

### 3. CORS Configuration
- Ajouter Vercel domain + ports locaux
- Restreindre à vos domaines uniquement
- En production, jamais de wildcard "*"

### 4. File Upload
- Max 5MB par fichier
- Dossier uploads/ doit être writable
- Sur Render, les fichiers disparaissent au redeploy (utiliser cloud storage)

## Recommendations pour production

### Base de données
- ✅ Backup réguliers (Supabase Point-in-time Recovery)
- ✅ Monitor connexions et lenteurs
- ✅ Indéxes sur colonnes recherchées

### Backend
- ✅ Rate limiting (déjà configuré à 120 req/min)
- ✅ Helmet pour sécurité headers
- ✅ Logs structurés pour debugging
- ✅ Error handling robuste

### Frontend
- ✅ Optimiser assets (Vite compresse déjà)
- ✅ Caching stratégies
- ✅ Error boundaries
- ✅ Loading states

### Monitoring
- ✅ Alertes Render si service down
- ✅ Logs Vercel pour erreurs frontend
- ✅ Supabase alerts pour DB issues
