# 🚀 Guide Complet de Déploiement: Vercel + Render + Supabase

## **PHASE 1: Configuration Supabase** ✅

### 1. Créer un compte Supabase
- Allez sur [supabase.com](https://supabase.com)
- Inscrivez-vous avec GitHub/Google
- Créez une nouvelle organisation ou utilisez existante

### 2. Créer un nouveau projet
```
Project Name: emploiplus
Region: eu-west-1 (ou votre région)
Password: [Générez un mot de passe fort]
```

### 3. Récupérer les credentials
Une fois le projet créé, allez dans:
- **Settings → Database → Connection String**
- Copiez l'URL PostgreSQL complète (avec le mot de passe)

Format: `postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres`

### 4. Migrer votre schéma de base de données
```bash
# Depuis la racine du projet
psql "postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres" \
  -f populate_search_vectors.sql

# Vous devez aussi migrer la structure complète
# Exécutez les migrations SQL nécessaires via SQL Editor dans Supabase
```

---

## **PHASE 2: Préparer & Déployer le Backend sur Render** 🔧

### 1. Vérifier la configuration backend
```bash
cd backend
npm install
npm run build
```

### 2. Créer un compte Render
- Allez sur [render.com](https://render.com)
- Inscrivez-vous avec GitHub
- Connectez votre compte GitHub

### 3. Créer un Web Service sur Render
```
1. Dashboard → New +
2. Sélectionnez "Web Service"
3. Connectez votre repository GitHub (emploiplus)
4. Configuration:
   - Name: emploiplus-backend
   - Environment: Node
   - Region: eu-west (proche de Supabase)
   - Build Command: cd backend && npm install && npm run build
   - Start Command: npm start
   - Branch: main
```

### 4. Ajouter les variables d'environnement sur Render
Allez dans: **Settings → Environment**

Ajoutez ces variables:
```
DATABASE_URL = postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
JWT_SECRET = [Générez une clé forte: https://www.uuidgenerator.net/]
GOOGLE_CLIENT_ID = [Votre Google OAuth ID]
GOOGLE_CLIENT_SECRET = [Votre Google OAuth Secret]
CORS_ORIGINS = https://your-domain.vercel.app,http://localhost:5173
NODE_ENV = production
```

### 5. Déployer
```
Cliquez sur "Deploy" → Render commencera à construire
```

Une fois déployé, vous recevrez une URL comme:
```
https://emploiplus-backend.onrender.com
```

---

## **PHASE 3: Préparer & Déployer le Frontend sur Vercel** 🎨

### 1. Mettre à jour les fichiers de configuration

**Vérifier vite.config.ts:**
```bash
grep -n "VITE_API_BASE_URL" src/
```

### 2. Créer un compte Vercel
- Allez sur [vercel.com](https://vercel.com)
- Inscrivez-vous avec GitHub
- Connectez votre account GitHub

### 3. Importer le projet sur Vercel
```
1. Dashboard → Import Project
2. Importez votre repository GitHub
3. Configuration:
   - Framework: Vite
   - Build Command: npm run build
   - Output Directory: dist
   - Root Directory: ./
```

### 4. Ajouter les variables d'environnement Vercel
Allez dans: **Settings → Environment Variables**

Ajoutez:
```
VITE_API_BASE_URL = https://emploiplus-backend.onrender.com
```

### 5. Déployer
```
Cliquez sur "Deploy"
```

Vercel vous donnera une URL comme:
```
https://emploiplus.vercel.app
```

### 6. Mettre à jour CORS_ORIGINS du backend
```
1. Allez sur Render Dashboard
2. Sélectionnez emploiplus-backend
3. Settings → Environment
4. Mettez à jour CORS_ORIGINS:
   CORS_ORIGINS = https://emploiplus.vercel.app,http://localhost:5173
5. Cliquez "Save" (auto-redeploy)
```

---

## **PHASE 4: Tests d'Intégration** 🧪

### 1. Tester l'API Backend
```bash
# Depuis votre machine locale
curl -X GET https://emploiplus-backend.onrender.com/api/stats
```

### 2. Vérifier les logs
- **Render**: Settings → Logs
- **Vercel**: Analytics → Logs
- **Supabase**: Database → Logs

### 3. Tester les endpoints critiques
```bash
# Health check
curl https://emploiplus-backend.onrender.com/api/stats

# Search
curl "https://emploiplus-backend.onrender.com/api/search/jobs?q=developer"

# Authentication (sans token → doit retourner 401)
curl -X GET https://emploiplus-backend.onrender.com/api/saved-jobs
```

### 4. Vérifier la communication Frontend-Backend
- Ouvrez https://emploiplus.vercel.app
- Ouvrez DevTools (F12)
- Allez dans onglet Network
- Effectuez une action (recherche, login)
- Vérifiez que les appels API vont à `https://emploiplus-backend.onrender.com`

---

## **PHASE 5: Configuration DNS (Optionnel - si vous avez votre domaine)** 🌐

### Ajouter un domaine personnalisé

**Sur Vercel:**
```
1. Settings → Domains
2. Ajoutez votre domaine
3. Suivez les instructions DNS
```

**Sur Render:**
```
1. Settings → Custom Domain
2. Ajoutez votre domaine
3. Configurez les DNS
```

---

## **Checklist Finale** ✅

- [ ] Supabase créé et schéma migré
- [ ] Backend déployé sur Render
- [ ] Render CORS_ORIGINS contient Vercel URL
- [ ] Frontend déployé sur Vercel
- [ ] Vercel variables env configurées
- [ ] Endpoints API testés (/api/stats, /api/search/jobs)
- [ ] Formulaires de login fonctionnent
- [ ] Uploads de fichiers fonctionnent
- [ ] Notifications affichées
- [ ] Recherche globale fonctionne

---

## **Troubleshooting Courant** 🔍

### ❌ "CORS error" sur Frontend
```
Cause: CORS_ORIGINS sur Render ne contient pas votre URL Vercel
Solution: Mettre à jour CORS_ORIGINS sur Render
```

### ❌ "Cannot connect to database"
```
Cause: DATABASE_URL incorrect ou serveur Supabase down
Solution: Vérifier DATABASE_URL dans Render env vars
```

### ❌ "API calls return 401"
```
Cause: JWT_SECRET différent ou JWT expiré
Solution: Vérifier JWT_SECRET sur Render (doit être identique au frontend)
```

### ❌ "Vercel build fails"
```
Solution:
1. npm install --legacy-peer-deps
2. Vérifier node_modules pas committées
3. Vérifier build command: npm run build
```

### ❌ "Render deployment stuck"
```
Solution: Redeploy manuellement
1. Dashboard → Déployments
2. Cliquez "Trigger deploy"
```

---

## **Commandes Utiles** 🛠️

```bash
# Builder localement (test avant deploy)
cd backend && npm run build
npm start  # Test local

cd .. && npm run build  # Frontend
npm run preview  # Prévisualiser le build

# Générer une clé JWT forte
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## **Support & Documentation** 📚

- [Supabase Docs](https://supabase.com/docs)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html)

---

**Avez-vous besoin d'aide pour une étape en particulier?**
