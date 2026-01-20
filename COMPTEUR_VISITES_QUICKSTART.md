# ⚡ QUICK START: Compteur de Visites du Profil

## 🎯 En 5 Minutes

### 1️⃣ Migrer la BD (2 min)
```bash
cd backend
npx ts-node migrate-add-profile-views.ts
```
✅ Done

### 2️⃣ Rebuild (2 min)
```bash
npm run build
cd ..
npm run build
```
✅ Done

### 3️⃣ Restart Serveurs (1 min)
```bash
./start-servers.sh
```
✅ Done

---

## 🎬 Résultat

### Candidat voit dans le Newsfeed:
```
[Avatar] Jean Dupont
         Candidat
         💼 Développeur Full Stack  ← NOUVEAU

📊 Visites du profil             ← NOUVEAU
Cette semaine: 5
[████░░░░░░░░░░░] 
Total: 23 visites
💡 Améliore ton profil...
```

### Entreprise visite un candidat:
```
1. Clique sur le profil du candidat
2. Visite enregistrée automatiquement ✅
3. Candidat voit son compteur +1
```

---

## 📊 Qu'est-ce qui a Changé?

### BD
- ✅ Colonne `profile_views` (JSONB) - historique
- ✅ Colonne `profile_views_week` (INT) - compteur

### API
- ✅ POST `/api/users/:id/visit` - enregistrer visite
- ✅ GET `/api/users/me/profile-stats` - lire stats

### Frontend  
- ✅ Affiche le poste sous le nom
- ✅ Affiche le compteur de visites
- ✅ Appelle l'API au chargement du profil

---

## 🧪 Test Rapide

### Test 1: Vérifier BD
```bash
psql -U postgres -d emploi_connect_db -c "SELECT profile_views, profile_views_week FROM users LIMIT 1;"
```
✅ Deux colonnes affichées

### Test 2: Vérifier API
```bash
# Terminal (remplacer TOKEN par vrai JWT)
curl -X GET http://localhost:5000/api/users/me/profile-stats \
  -H "Authorization: Bearer TOKEN"
```
✅ JSON retourné

### Test 3: Vérifier Frontend
1. Connecter candidat
2. Voir newsfeed
3. ✅ Bloc "📊 Visites du profil" visible

---

## 🚨 En Cas de Problème

| Problème | Solution |
|----------|----------|
| Colonnes pas créées | `npx ts-node migrate-add-profile-views.ts` |
| Erreur 404 API | Restart backend: `npm start` |
| Stats pas affichées | Vérifier JWT dans localStorage |
| Poste pas affichée | Remplir `job_title` dans paramètres |

---

## 📋 Fichiers Modifiés

```
backend/
  ├── init-db.ts (+2 colonnes)
  ├── src/server.ts (+2 endpoints)
  └── migrate-add-profile-views.ts (NOUVEAU)

src/pages/
  ├── CandidateProfile.tsx (+POST /api/users/:id/visit)
  └── Newsfeed.tsx (+affichage poste + stats)

DOCUMENTATION/
  ├── IMPLEMENTATION_COMPTEUR_VISITES.md (Détail technique)
  ├── GUIDE_DEPLOIEMENT_COMPTEUR_VISITES.md (Procédure complète)
  └── COMPTEUR_VISITES_QUICKSTART.md (Ce fichier)
```

---

## 🎉 Fini!

C'est prêt pour la production! 🚀

Questions? Consulte:
- `IMPLEMENTATION_COMPTEUR_VISITES.md` pour les détails techniques
- `GUIDE_DEPLOIEMENT_COMPTEUR_VISITES.md` pour la procédure complète
