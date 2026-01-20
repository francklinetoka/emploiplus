# Instructions de Déploiement - Mise à Jour Profil Candidat

## 🚀 Procédure de Déploiement

### Prérequis
- Node.js installé
- Base de données PostgreSQL en fonctionnement
- Accès en ligne de commande au serveur

### Étapes de Déploiement

#### 1. Mettre à Jour le Code Frontend

```bash
# Naviguer vers le répertoire racine du projet
cd /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-

# Installer/mettre à jour les dépendances
npm install

# Compiler le frontend
npm run build

# Vérifier que tout compile sans erreurs
npm run preview
```

#### 2. Mettre à Jour la Base de Données

**Option A: Réinitialiser complètement (destructif)**

```bash
cd backend

# Réinitialiser la base de données
# ATTENTION: Cela supprimera TOUS les données!
npx ts-node init-db.ts
```

**Option B: Ajouter les colonnes uniquement (préféré)**

```bash
cd backend

# Ajouter les colonnes manquantes sans supprimer les données
npx ts-node migrate-add-columns.ts
```

#### 3. Mettre à Jour le Backend

```bash
cd backend

# Installer/mettre à jour les dépendances
npm install

# Compiler le TypeScript
npm run build

# Vérifier les erreurs de compilation
# (Note: il y a des erreurs existantes non liées à cette mise à jour)
```

#### 4. Démarrer les Serveurs

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# ou pour le développement avec rechargement automatique
npm run dev
```

**Terminal 2 - Frontend:**
```bash
# Depuis la racine du projet
npm run dev
```

### Vérification Post-Déploiement

#### 1. Tests Frontend
- [ ] Ouvrir l'application: http://localhost:5173
- [ ] Se connecter avec un compte candidat
- [ ] Aller dans Paramètres
- [ ] Vérifier les trois onglets apparaissent:
  - 📋 Informations Personnelles
  - 🌐 Réseaux Sociaux
  - 💼 Profil Professionnel

#### 2. Tests Fonctionnels - Section 1 (Infos Personnelles)
- [ ] Cliquer "Modifier"
- [ ] Changer le prénom
- [ ] Changer le nom
- [ ] Cliquer "Enregistrer"
- [ ] Vérifier que les changements sont sauvegardés
- [ ] Cliquer "Modifier" à nouveau
- [ ] Vérifier que les valeurs sont correctes

#### 3. Tests Fonctionnels - Section 2 (Réseaux Sociaux)
- [ ] Cliquer "Modifier"
- [ ] Ajouter un URL LinkedIn
- [ ] Ajouter un URL Facebook
- [ ] Cliquer "Enregistrer"
- [ ] Vérifier que les changements sont sauvegardés

#### 4. Tests Fonctionnels - Section 3 (Profil Professionnel)
- [ ] Cliquer "Modifier"
- [ ] Entrer un poste (ex: "Développeur Senior")
- [ ] Taper un nom d'entreprise dans le champ "Entreprise"
- [ ] Vérifier que la recherche fonctionne
- [ ] Sélectionner une entreprise
- [ ] Ajouter un résumé professionnel
- [ ] Ajouter des compétences (séparées par virgule)
- [ ] Cliquer "Enregistrer"
- [ ] Vérifier que tout est sauvegardé

#### 5. Test API - Recherche d'Entreprises
```bash
# Depuis le terminal, tester l'endpoint de recherche
curl -X GET "http://localhost:3000/api/companies/search?q=emploi" \
  -H "Authorization: Bearer <VOTRE_TOKEN>"
```

**Résultat attendu:**
```json
[
  { "id": 1, "company_name": "Emploi+ Congo" },
  { "id": 2, "company_name": "Emploi Service" }
]
```

#### 6. Test Profil Public
- [ ] Se connecter avec un autre compte (recruteur ou candidat)
- [ ] Chercher/accéder au profil du candidat testé
- [ ] Vérifier l'affichage du poste
- [ ] Vérifier l'affichage de l'entreprise
- [ ] Cliquer sur l'entreprise → doit rediriger vers `/company/{id}`
- [ ] Vérifier l'affichage du résumé professionnel
- [ ] Vérifier l'affichage des compétences

---

## 🔍 Points de Contrôle Critiques

### Base de Données
Vérifier que les colonnes existent:
```sql
-- Accéder à PostgreSQL
psql -U postgres -d emploi_connect

-- Vérifier la structure de la table users
\d users

-- Vérifier les colonnes:
-- - linkedin
-- - facebook
-- - instagram
-- - twitter
-- - youtube
-- - company
-- - company_id
-- - bio
-- - city
-- - birthdate
-- - gender
```

### Endpoints API
- [ ] `GET /api/companies/search?q=terme` → Returns: `[{ id, company_name }]`
- [ ] `PUT /api/users/me` → Accepte: `linkedin`, `facebook`, `instagram`, `twitter`, `youtube`, `company`, `company_id`, `bio`, `city`, `birthdate`, `gender`
- [ ] `GET /api/users/me` → Retourne: Tous les nouveaux champs

### Frontend
- [ ] Tous les composants s'importent correctement
- [ ] Pas d'erreurs console
- [ ] Les styles sont appliqués correctement
- [ ] Les animations/transitions fonctionnent

---

## 📊 Fichiers Concernés

### Fichiers Créés
```
✅ src/pages/settings/CandidateSocialNetworks.tsx
✅ backend/migrate-add-columns.ts
✅ MISE_A_JOUR_PROFIL_CANDIDAT.md
✅ GUIDE_UTILISATEUR_PROFIL_CANDIDAT.md
✅ INSTRUCTIONS_DEPLOIEMENT.md (ce fichier)
```

### Fichiers Modifiés
```
✅ src/pages/settings/CandidatePersonalInfo.tsx
✅ src/pages/settings/CandidateProfessionalProfile.tsx
✅ src/pages/CandidateProfile.tsx
✅ src/pages/Settings.tsx
✅ backend/src/server.ts
✅ backend/init-db.ts
```

---

## 🆘 Dépannage

### Erreur: "Column does not exist"
**Cause:** Les colonnes n'ont pas été ajoutées à la base de données
**Solution:**
```bash
cd backend
npx ts-node migrate-add-columns.ts
```

### Erreur: "Cannot find module CandidateSocialNetworks"
**Cause:** Le fichier n'a pas été créé ou le chemin est incorrect
**Solution:** Vérifier que le fichier existe: `src/pages/settings/CandidateSocialNetworks.tsx`

### Erreur: "Search companies returns 401"
**Cause:** Token d'authentification manquant ou expiré
**Solution:** Vérifier que l'en-tête `Authorization` est envoyé avec le token valide

### Erreur: "Cannot modify email"
**Cause:** C'est le comportement normal
**Solution:** L'email ne peut pas être modifié car c'est l'identifiant unique du compte

### Frontend affiche une page blanche
**Cause:** Erreur de compilation ou serveur backend non disponible
**Solution:**
1. Vérifier la console du navigateur (F12) pour les erreurs
2. Vérifier que le backend est démarré
3. Vérifier que le frontend est compilé correctement

---

## 🔐 Checklist de Sécurité

- [ ] Les tokens JWT sont validés
- [ ] Les utilisateurs peuvent uniquement modifier leurs propres données
- [ ] L'endpoint de recherche nécessite l'authentification
- [ ] Les entrées sont validées côté serveur
- [ ] Les mots de passe ne sont jamais loggés
- [ ] CORS est configuré correctement
- [ ] Les erreurs ne révèlent pas d'informations sensibles

---

## 📈 Monitoring Post-Déploiement

### Logs à Surveiller
```bash
# Logs du backend
tail -f /var/log/emploi-connect/backend.log

# Vérifier les erreurs API
grep "error\|Error\|ERROR" /var/log/emploi-connect/backend.log

# Vérifier les requêtes API
grep "GET /api/companies/search\|PUT /api/users/me" /var/log/emploi-connect/backend.log
```

### Métriques à Vérifier
- Nombre de utilisateurs connectés
- Nombre de mises à jour de profil par jour
- Nombre de recherches d'entreprises
- Temps de réponse des endpoints

---

## 🔄 Rollback (En Cas de Problème)

Si vous devez revenir à l'ancienne version:

```bash
# Restaurer la base de données depuis une sauvegarde
pg_restore /backups/emploi_connect_backup.sql

# Restaurer le code source depuis Git
git revert HEAD~1
git push

# Recompiler et redémarrer
npm run build
npm start
```

---

## 📝 Notes Importantes

1. **Sauvegarde obligatoire:** Avant le déploiement, faire une sauvegarde complète
2. **Test en environnement de staging:** Tester d'abord en staging
3. **Maintenance planifiée:** Prévoir une fenêtre de maintenance si nécessaire
4. **Documentation:** Mettre à jour la documentation utilisateur
5. **Formation:** Former l'équipe sur les nouvelles fonctionnalités

---

**Dernière mise à jour:** 18 janvier 2026

**Statut:** ✅ Prêt pour déploiement en production
