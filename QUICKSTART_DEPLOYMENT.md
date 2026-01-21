# ⚡ Quick Start: Déploiement en 15 minutes

## Étape 1: Supabase (2 min) 🗄️

```bash
1. Allez sur supabase.com → Sign Up
2. Créez un nouveau projet
3. Copiez la DATABASE_URL depuis Settings → Database → Connection String
```

**Résultat:** `postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres`

---

## Étape 2: Render Backend (5 min) 🔧

```bash
1. Allez sur render.com → Sign Up avec GitHub
2. Dashboard → New Web Service
3. Connectez votre repo GitHub (emploiplus)
4. Configuration:
   - Root Dir: backend
   - Build: npm install && npm run build
   - Start: npm start
5. Ajouter Environment Variables:
   DATABASE_URL=<votre_supabase_url>
   JWT_SECRET=<générer_avec_./generate-secrets.sh>
   CORS_ORIGINS=https://emploiplus.vercel.app
   NODE_ENV=production
6. Click "Deploy"
```

**Résultat:** `https://emploiplus-backend.onrender.com`

---

## Étape 3: Vercel Frontend (3 min) 🎨

```bash
1. Allez sur vercel.com → Sign Up avec GitHub
2. Import → Sélectionnez emploiplus
3. Click "Deploy"
4. Settings → Environment Variables:
   VITE_API_BASE_URL=https://emploiplus-backend.onrender.com
5. Redeploy
```

**Résultat:** `https://emploiplus.vercel.app`

---

## Étape 4: Tester (5 min) 🧪

```bash
# Terminal 1: Vérifier backend
curl https://emploiplus-backend.onrender.com/api/stats

# Terminal 2: Ouvrir le frontend
open https://emploiplus.vercel.app

# Tester une recherche
# Dans DevTools → Network → Recherchez "developer"
# Vérifiez que l'appel va à onrender.com
```

---

## ⚠️ Pièges courants

| Problème | Solution |
|----------|----------|
| CORS error | Vérifier CORS_ORIGINS sur Render |
| 401 unauthorized | Vérifier JWT_SECRET identique |
| Cannot find module | `npm install` dans le root du backend |
| Build timeout sur Vercel | Utiliser `--legacy-peer-deps` |
| Database connection failed | Vérifier DATABASE_URL complète |

---

## Fichiers importants créés

```
✅ .env.production          → Config frontend prod
✅ backend/.env.example     → Template backend
✅ render.yaml              → Config Render
✅ vercel.json              → Config Vercel
✅ DEPLOYMENT_GUIDE.md      → Guide détaillé
✅ DEPLOYMENT_CONFIG.md     → Config avancée
✅ generate-secrets.sh      → Générateur clés
✅ test-endpoints.sh        → Script de test
✅ prepare-deploy.sh        → Préparation
```

---

## 📞 Support

- **Backend down?** Render Dashboard → Logs
- **Frontend error?** Vercel Analytics → Logs
- **Database issue?** Supabase → Database → Logs

---

**Prêt?** Commencez par Étape 1! 🚀
