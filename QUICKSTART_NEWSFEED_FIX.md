# 🚀 Guide de Déploiement Rapide - Corrections Newsfeed

## ✅ Ce qui a été fait

### Problème 1: "Erreur lors du chargement des publications" sur Vercel
**Cause:** Les appels API utilisaient des URLs relatives (`/api/publications`) qui ne fonctionnaient pas sur Vercel (domaine séparé du backend).

**Solution:**
- Créé une fonction `buildApiUrl()` qui utilise `VITE_API_BASE_URL`
- Mise à jour de 24+ appels API dans le frontend
- Le projet construit correctement (✓ Build réussi)

### Problème 2: Photos de profil ne s'affichent plus
**Cause:** Les publications ne chargeaient pas (problème API) + images références mauvaies

**Solution:**
- Correction des appels API (voir ci-dessus)
- Composant Avatar gère déjà les fallbacks (initiales)
- Messages d'erreur améliorés

## 🔧 Configuration Vercel

### 1. Vérifier les Variables d'Environnement

Sur Vercel, assurez-vous que ces variables sont définies:

```
VITE_API_BASE_URL = https://emploiplus-backend.onrender.com
```

**Comment vérifier:**
1. Aller à votre projet Vercel
2. Settings → Environment Variables
3. Chercher `VITE_API_BASE_URL`
4. Si absent, l'ajouter avec la valeur ci-dessus

### 2. Options de Déploiement

#### Option A: Déploiement Automatique (Recommandé)
```bash
git add .
git commit -m "Fix: Fil d'actualité et photos de profil sur Vercel"
git push
```
✅ Vercel déploiera automatiquement

#### Option B: Redéployer depuis Vercel
1. Aller à Vercel Dashboard
2. Sélectionner le projet
3. Cliquer "Redeploy"

#### Option C: Vérifier Localement D'abord
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-

# Installer les dépendances
npm install

# Vérifier que le build fonctionne
npm run build

# Lancer en mode développement (avec proxy API)
npm run dev
```

## 📋 Checklist Pre-Déploiement

- [ ] **Vercel:** Variable `VITE_API_BASE_URL` configurée
- [ ] **Render:** Backend est "Live" (https://dashboard.render.com)
- [ ] **Local Test:** `npm run build` réussit
- [ ] **Git:** Changements commitées et pushées

## ✅ Vérification Post-Déploiement

### 1. Vérifier que le site charge
- Ouvrir https://votre-domaine-vercel.com
- Attendre que le site charge complètement

### 2. Tester le Fil d'Actualité
- Se connecter avec un compte valide
- Aller à `/fil-actualite`
- Les publications doivent charger

### 3. Vérifier les Photos de Profil
- Les publications doivent afficher un avatar
- Soit l'image du profil, soit les initiales

### 4. Diagnostiquer les Erreurs (Si Problèmes)
```javascript
// Dans la console du navigateur (F12)
// Vérifier l'URL de l'API
console.log(import.meta.env.VITE_API_BASE_URL)

// Doit afficher:
// https://emploiplus-backend.onrender.com
```

### 5. Vérifier le Network Tab (F12)
- Ouvrir DevTools (F12)
- Onglet Network
- Filtrer par `/api`
- Vérifier que les requêtes vont à:
  - `https://emploiplus-backend.onrender.com/api/publications`
  - Et non `https://votre-domaine.vercel.app/api/publications`

## 🔧 Fichiers Clés

Les fichiers suivants ont été modifiés:

```
✓ src/lib/headers.ts              (+ buildApiUrl & getApiBaseUrl)
✓ src/pages/Newsfeed.tsx           (24+ appels API corrigés)
✓ src/components/DashboardNewsfeed.tsx (2 appels)
✓ src/components/DiscreetModeCard.tsx  (2 appels)
✓ src/components/Header.tsx        (2 appels)
✓ src/components/Publications.tsx   (1 appel)
✓ src/components/NotificationDropdown.tsx (1 appel)
✓ .env.production                  (Déjà configuré)
```

## 🆘 Dépannage

### Symptôme: "Erreur lors du chargement des publications"

**Solution:**
1. Vérifier que `VITE_API_BASE_URL` est défini sur Vercel
2. Vérifier que le backend Render est "Live"
3. Vérifier la console (F12 → Console) pour plus de détails
4. Vérifier le Network tab pour voir l'URL réelle de la requête

### Symptôme: Photos de profil vides

**Solution:**
1. Vérifier que les publications chargent (voir ci-dessus)
2. Les initiales devraient s'afficher en fallback
3. Si rien n'apparaît, il y a un problème d'authentification (token invalid)

### Symptôme: "Unauthorized (401)"

**Solution:**
1. Se reconnecter
2. Vérifier que le token est sauvegardé dans localStorage
3. Vérifier que l'API backend reconnaît le token

## 📚 Documentation

Pour plus de détails, voir:
- `DEPLOYMENT_NEWSFEED_FIX.md` - Guide technique complet
- `CORRECTIONS_NEWSFEED_SUMMARY.md` - Résumé des changements

## ✨ Résultat Attendu

Après déploiement:
- ✅ Les publications chargent immédiatement
- ✅ Les photos de profil s'affichent (ou initialles)
- ✅ Pas de message "Erreur lors du chargement"
- ✅ Le fil d'actualité fonctionne normalement

---

**Questions?** Vérifiez la console (F12) et le Network tab pour diagnostiquer.
