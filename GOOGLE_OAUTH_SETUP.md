# 🔐 Configuration Google OAuth pour Supabase

## ✅ Status: Google OAuth Fix Implémenté

L'authentification Google a été corrigée et améliorée. Voici ce qui a été fait:

---

## 🔧 Changements Effectués

### 1. **Hook Google Auth Amélioré** (`useGoogleAuth.ts`)
- ✅ Gestion dynamique des URLs de redirection (dev/prod)
- ✅ Gestion d'erreur complète
- ✅ Console logging pour debugging
- ✅ Support offline access

### 2. **Composant GoogleLoginButton Amélioré**
- ✅ Gestion d'erreur avec toast notifications
- ✅ Callbacks `onSuccess` et `onError`
- ✅ Support du `userType` (candidate/company)
- ✅ Loading state approprié

### 3. **Hook useSupabaseAuth Enrichi**
- ✅ Nouvelle méthode `signInWithGoogle()`
- ✅ Gestion automatique du profil utilisateur
- ✅ Support complet des métadonnées Google

### 4. **Page Callback Améliorée** (`AuthCallback.tsx`)
- ✅ Gestion correcte du hash OAuth
- ✅ Redirection appropriée après authentification
- ✅ UI loading spinner
- ✅ Gestion d'erreur

### 5. **Endpoint Backend** (`POST /api/auth/sync-google`)
- ✅ Synchronisation de l'utilisateur Google
- ✅ Création automatique du profil utilisateur
- ✅ Token JWT généré
- ✅ Support create/update

---

## 🚀 Configuration Requise

### Étape 1: Google Cloud Project

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet
3. Activer "Google+ API"

### Étape 2: Créer un OAuth Client

1. Aller à **Credentials** → **Create Credentials** → **OAuth Client ID**
2. Choisir **Web Application**
3. Ajouter les Authorized redirect URIs:
   - **Local (Dev):**
     - `http://localhost:5173/auth/callback`
     - `http://192.168.0.14:5173/auth/callback`
   
   - **Production:**
     - `https://emploiplus.vercel.app/auth/callback`

4. Copier le **Client ID** et **Client Secret**

### Étape 3: Configurer Supabase OAuth

1. Aller sur [Supabase Dashboard](https://app.supabase.com/)
2. Sélectionner votre projet
3. **Settings** → **Authentication**
4. Scroll down to "Google"
5. Activer "Enable Sign in with Google"
6. Coller le **Client ID** et **Client Secret**
7. Sauvegarder

### Étape 4: Variables d'Environnement (Frontend)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Ces variables sont déjà configurées dans:
- `.env.local` (développement)
- `.env.production` (production Vercel)

---

## 🧪 Test de Google OAuth

### Méthode 1: Via le Bouton (Recommandé)

1. Aller à `/inscription` ou `/connexion`
2. Cliquer sur **"Continuer avec Google"**
3. Se connecter avec un compte Google
4. Être redirigé vers `/auth/callback`
5. Automatiquement redirigé vers la page d'accueil

### Méthode 2: Vérifier les Logs

**Frontend Console:**
```
Auth state changed: SIGNED_IN
✅ User authenticated via Google: user@gmail.com
```

**Backend Logs:**
```
Google sync error: ... (if any)
POST /api/auth/sync-google 200 OK
```

---

## 🔍 Troubleshooting

### Problème: "Erreur lors de la connexion Google"

**Solutions:**
1. Vérifier que Google OAuth est activé dans Supabase
2. Vérifier le Client ID et Secret dans Supabase
3. Vérifier que `/auth/callback` est dans les redirect URIs Google
4. Vérifier les variables d'environnement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

### Problème: Redirection infinies après Google login

**Solutions:**
1. Vérifier que la route `/auth/callback` existe
2. Vérifier que `useSupabaseAuth` est correctement initialisé
3. Vérifier la console du navigateur pour les erreurs
4. Faire un hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### Problème: Utilisateur créé sans profil complet

**Solutions:**
1. Le profil utilisateur est créé automatiquement lors du login Google
2. L'utilisateur peut compléter son profil après login
3. Les métadonnées Google (nom, photo) sont synchronisées

---

## 📋 Fichiers Modifiés

1. **`src/hooks/useGoogleAuth.ts`** - Hook Google Auth amélioré
2. **`src/components/auth/GoogleLoginButton.tsx`** - Composant amélioré
3. **`src/hooks/useSupabaseAuth.ts`** - Ajout méthode `signInWithGoogle`
4. **`src/pages/AuthCallback.tsx`** - Page callback corrigée
5. **`backend/src/routes/auth.ts`** - Ajout endpoint `/api/auth/sync-google`

---

## 🎯 Flux d'Authentification Google

```
1. User clique "Continuer avec Google"
   ↓
2. Frontend appelle supabase.auth.signInWithOAuth()
   ↓
3. Google redirect → user se connecte
   ↓
4. Google redirect → /auth/callback?code=...&state=...
   ↓
5. Supabase automatiquement échange le code pour une session
   ↓
6. useSupabaseAuth détecte le changement d'auth
   ↓
7. Frontend redirige vers /
   ↓
8. Utilisateur connecté! ✅
```

---

## ✨ Fonctionnalités Disponibles

✅ Login avec Google  
✅ Signup avec Google  
✅ Profil utilisateur créé automatiquement  
✅ Métadonnées Google synchronisées  
✅ Token JWT généré  
✅ Session persistante  
✅ Gestion d'erreur complète  
✅ Support dev et production  

---

## 📞 Support

### Commandes Utiles

```bash
# Vérifier les logs du frontend
# Ouvrir la console du navigateur (F12)

# Vérifier les logs du backend
tail -f backend-dev.log | grep -i "google\|oauth"

# Tester l'endpoint sync-google
curl -X POST http://localhost:5000/api/auth/sync-google \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user-id",
    "email": "user@gmail.com",
    "full_name": "User Name",
    "profile_image_url": "https://..."
  }'
```

---

## 🚀 Prochaines Étapes

1. ✅ Confirmer que Google OAuth est activé dans Supabase
2. ✅ Tester le login Google en local
3. ✅ Tester en production (Vercel)
4. ✅ Vérifier que les utilisateurs Google sont créés correctement

---

**Status: ✅ Prêt à tester!**

Generated: 23 janvier 2026
