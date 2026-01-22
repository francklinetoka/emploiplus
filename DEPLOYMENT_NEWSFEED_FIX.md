# Résolution des Problèmes de Déploiement - Newsfeed et Photos de Profil

## Problèmes Corrigés

### 1. Erreur "Erreur lors du chargement des publications" sur Vercel

**Cause:** Le frontend sur Vercel n'avait pas accès aux appels API car:
- Les appels `/api/publications` étaient relatifs (sans le domaine du backend)
- Sur Vercel (avec un domaine séparé), cela tentait d'accéder à `vercel-app.com/api/publications` au lieu de `backend.onrender.com/api/publications`

**Solution Appliquée:**
- Création d'une fonction `buildApiUrl()` dans `src/lib/headers.ts`
- Cette fonction utilise la variable d'environnement `VITE_API_BASE_URL` pour construire l'URL complète
- Tous les appels API dans `Newsfeed.tsx` et `DashboardNewsfeed.tsx` ont été mis à jour

**Vérification:**
1. Assurez-vous que `VITE_API_BASE_URL=https://emploiplus-backend.onrender.com` est défini dans les variables d'environnement Vercel
2. Sur Vercel: Settings → Environment Variables → Vérifiez que `VITE_API_BASE_URL` existe

### 2. Photos de Profil ne s'affichent plus

**Cause:** Les photos de profil ne s'affichaient pas pour deux raisons:
1. Les publications ne chargeaient pas (problème API ci-dessus)
2. Certaines photos pouvaient être `null` ou non retournées correctement

**Solution Appliquée:**
- Le composant `Avatar` avec `AvatarFallback` gère déjà les cas où l'image est manquante
- Il affiche les initiales de l'utilisateur en tant que fallback
- Amélioration des messages d'erreur pour mieux diagnostiquer les problèmes

## Vérification sur Vercel

### Étape 1: Confirmer la variable d'environnement
```bash
# Sur Vercel
Settings → Environment Variables
- Clé: VITE_API_BASE_URL
- Valeur: https://emploiplus-backend.onrender.com
```

### Étape 2: Tester l'API
1. Ouvrez la console navigateur (F12)
2. Onglet "Network"
3. Accédez au fil d'actualité
4. Vérifiez les requêtes `/api/publications`
5. Elles doivent aller vers `https://emploiplus-backend.onrender.com/api/publications`

### Étape 3: Vérifier les logs
- Vérifiez que les requêtes retournent un statut 200
- Les publications doivent avoir le champ `profile_image_url`

## Fichiers Modifiés

1. **src/lib/headers.ts**
   - Ajout de `buildApiUrl()` pour construire les URLs complètes
   - Ajout de `getApiBaseUrl()` pour accéder à la variable d'environnement

2. **src/pages/Newsfeed.tsx**
   - Import de `buildApiUrl`
   - Mise à jour de tous les appels `fetch()` pour utiliser `buildApiUrl()`
   - Amélioration des messages d'erreur

3. **src/components/DashboardNewsfeed.tsx**
   - Import de `buildApiUrl`
   - Mise à jour des appels API

4. **.env.production** (déjà configuré)
   - `VITE_API_BASE_URL=https://emploiplus-backend.onrender.com`

## Dépannage

Si les publications ne s'affichent toujours pas:

1. **Vérifiez la console du navigateur** (F12 → Console)
   - Cherchez les messages d'erreur CORS ou de connexion
   - Les erreurs afficheront le message détaillé

2. **Vérifiez l'onglet Network**
   - Confirmez que les requêtes vont vers le bon domaine backend
   - Vérifiez les status codes (401 = authentification, 500 = erreur serveur)

3. **Testez avec curl**
   ```bash
   curl -H "Authorization: Bearer TOKEN" \
        https://emploiplus-backend.onrender.com/api/publications
   ```

4. **Vérifiez que le backend Render est en cours d'exécution**
   - Allez sur dashboard Render
   - Confirmez que le service backend est "Live"

## Résultat Attendu

Après ces corrections:
- ✅ Les publications se chargent avec succès
- ✅ Les photos de profil s'affichent (ou les initiales en fallback)
- ✅ Les erreurs API affichent des messages détaillés
- ✅ Le deployment sur Vercel fonctionne correctement
