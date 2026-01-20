# Configuration Google OAuth - Emploi Connect

## ✅ Configuration terminée

Votre authentification Google est maintenant configurée et prête à l'emploi!

### 📋 Détails de la configuration

**Google Client ID:** 
```
988000680437-0gbh7jcdmcqqbbah2mnmkgscbl1a0dcl.apps.googleusercontent.com
```

### 🔧 Modifications apportées

#### 1. **Frontend** (`src/`)
- ✅ Installé `@react-oauth/google`
- ✅ Configuré `GoogleOAuthProvider` dans `main.tsx`
- ✅ Créé hook personnalisé `src/hooks/useGoogleAuth.ts`
- ✅ Créé composant `src/components/auth/GoogleLoginButton.tsx`
- ✅ Intégré le bouton Google dans la page `LoginUser.tsx`
- ✅ Ajouté variables d'environnement: `VITE_GOOGLE_CLIENT_ID`

#### 2. **Backend** (`backend/src/server.ts`)
- ✅ Installé `google-auth-library`
- ✅ Créé endpoint `/api/google-login` pour vérifier les tokens
- ✅ Gestion automatique de création/mise à jour des utilisateurs Google
- ✅ Génération de JWT token pour la session
- ✅ Ajouté `GOOGLE_CLIENT_ID` dans `.env`

### 🚀 Fonctionnement

1. **L'utilisateur clique sur "Continuer avec Google"**
   - React OAuth ouvre une popup Google
   - L'utilisateur se connecte avec son compte Google

2. **Le token est envoyé au backend**
   - Endpoint `/api/google-login` reçoit le token Google
   - Backend vérifie le token avec Google
   - Si c'est la première fois: création automatique du compte utilisateur
   - Génération d'un JWT token pour la session Emploi Connect

3. **L'utilisateur est connecté**
   - Token JWT stocké dans `localStorage`
   - Profil utilisateur sauvegardé
   - Redirection selon le type d'utilisateur (candidat ou entreprise)

### 🔐 Sécurité

- ✅ Vérification des tokens Google côté serveur
- ✅ JWT tokens avec expiration 7 jours
- ✅ CORS configuré pour le réseau local
- ✅ Authentification obligatoire pour les endpoints protégés

### 📝 Variables d'environnement

**Frontend** (`.env.local`):
```env
VITE_GOOGLE_CLIENT_ID=988000680437-0gbh7jcdmcqqbbah2mnmkgscbl1a0dcl.apps.googleusercontent.com
```

**Backend** (`backend/.env`):
```env
GOOGLE_CLIENT_ID=988000680437-0gbh7jcdmcqqbbah2mnmkgscbl1a0dcl.apps.googleusercontent.com
```

### ✨ Prochaines étapes

1. **Ajouter d'autres fournisseurs OAuth** (GitHub, Microsoft, etc.):
   - Installer les libraries correspondantes
   - Créer des endpoints `/api/{provider}-login`
   - Intégrer les boutons dans les pages de connexion

2. **Customiser l'authentification Google**:
   - Ajouter plus d'informations du profil Google
   - Implémenter la liaison de comptes existants
   - Ajouter une page de confirmation/complétion du profil

3. **Ajouter la connexion Facebook/LinkedIn**:
   - Pour ciblage professionnel sur LinkedIn
   - Intégration des données de profil

### 🐛 Dépannage

Si le bouton Google ne s'affiche pas:
- Vérifiez que `VITE_GOOGLE_CLIENT_ID` est bien défini dans `.env.local`
- Relancez le serveur Vite (`npm run dev`)
- Vérifiez la console du navigateur pour les erreurs

Si la connexion échoue:
- Vérifiez que le backend tourne sur le port 5000
- Vérifiez que `GOOGLE_CLIENT_ID` est bien défini dans `backend/.env`
- Relancez le backend
- Vérifiez les logs du backend pour plus de détails

### 📞 Support

Pour tester localement:
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend && npm run dev
```

Accédez à: `http://localhost:5173/connexion`
