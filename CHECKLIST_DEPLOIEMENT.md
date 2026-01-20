# Checklist de Déploiement - Module Candidature Spontanée

**Date** : 18 janvier 2026  
**Version** : 1.0

---

## ✅ Avant le Déploiement

### Vérifications Frontend

#### Code
- [x] Tous les fichiers créés sont présents
  - [x] `src/components/recruitment/ApplicationOptionSelector.tsx`
  - [x] `src/components/recruitment/ApplicationWithProfile.tsx`
  - [x] `src/components/recruitment/ApplicationManual.tsx`
  - [x] `src/components/recruitment/index.ts`
  - [x] `src/hooks/useProfileData.ts`
- [x] Fichiers modifiés sont correctement sauvegardés
  - [x] `src/pages/Jobs.tsx`
  - [x] `src/pages/Company.tsx`
  - [x] `src/pages/SpontaneousApplication.tsx`

#### Compilation
- [ ] Exécuter `npm run build` sans erreurs
- [ ] Vérifier qu'il n'y a pas de warnings TypeScript
- [ ] Vérifier qu'il n'y a pas de warnings linting

#### Tests
- [ ] Tester la page Jobs (logo/nom cliquables)
- [ ] Tester la page Company (badges de certification)
- [ ] Tester le flux Option A (profil)
- [ ] Tester le flux Option B (manuel)
- [ ] Tester les validations des formulaires
- [ ] Tester l'upload de fichiers
- [ ] Tester sur mobile

#### Performance
- [ ] Pas de console errors/warnings
- [ ] Pas de memory leaks
- [ ] Temps de chargement acceptable

---

### Vérifications Backend

#### API Endpoint
- [ ] Endpoint `/api/applications/spontaneous` existe
- [ ] Accepte les requêtes POST en FormData
- [ ] Gère les fichiers correctement
- [ ] Retourne les bonnes réponses

#### Base de Données
- [ ] Table `spontaneous_applications` créée avec la bonne structure
- [ ] Indexes créés pour performance
- [ ] Contraintes de clés étrangères en place

#### Validations
- [ ] Validation des champs obligatoires
- [ ] Validation des formats de fichier
- [ ] Validation des tailles de fichier
- [ ] Validation du format email
- [ ] Vérification que l'entreprise existe

#### Stockage Fichiers
- [ ] Dossier de stockage configuré
- [ ] Permissions d'écriture correctes
- [ ] Chemin de stockage sécurisé (hors web root)
- [ ] Antivirus intégré (optionnel)

#### Logs & Monitoring
- [ ] Logs des candidatures reçues
- [ ] Logs des erreurs
- [ ] Monitoring du taux de réussite
- [ ] Alertes configurées (optionnel)

---

### Vérifications Sécurité

#### Authentification
- [ ] Bearer token validé
- [ ] Candidatures de non-membres possibles
- [ ] Rate limiting en place (optionnel)

#### Autorisation
- [ ] Entreprise ne voit que ses candidatures
- [ ] Admin peut voir toutes les candidatures
- [ ] Pas d'accès direct aux fichiers

#### Données
- [ ] Pas de données sensibles en logs
- [ ] Pas de données sensibles en erreurs
- [ ] CORS correctement configuré
- [ ] HTTPS utilisé en production

#### Fichiers
- [ ] Noms de fichiers nettoyés
- [ ] Double extension bloquée (.pdf.exe)
- [ ] Contenu du fichier validé (magic bytes)
- [ ] Limite de taille en place

---

### Vérifications Documentation

#### Documentation Utilisateur
- [ ] Guide rapide fourni
- [ ] FAQs complètes
- [ ] Vidéos tutoriels (optionnel)

#### Documentation Développeur
- [ ] API correctement documentée
- [ ] Exemples d'intégration fournis
- [ ] Architecture expliquée
- [ ] Dépendances listées

#### Documentation Admin
- [ ] Interface de gestion des candidatures
- [ ] Processus de modération expliqué
- [ ] Rapports disponibles

---

## 🚀 Processus de Déploiement

### Étape 1 : Préparation
```bash
# 1. Créer une branche de déploiement
git checkout -b deploy/candidature-spontanee-v1

# 2. Vérifier l'état du repo
git status

# 3. Compiler et tester
npm run build
npm run test
npm run lint
```

### Étape 2 : Validation
```bash
# 4. Vérifier les types TypeScript
npx tsc --noEmit

# 5. Vérifier les bundle sizes
npm run build -- --analyze

# 6. Tester en local
npm run dev
```

### Étape 3 : Staging
```bash
# 7. Déployer en staging
npm run deploy:staging

# 8. Tester en staging
# - Naviguer vers https://staging.emploi-connect.com
# - Tester tous les flux
# - Vérifier les logs

# 9. Tester l'API en staging
curl -X POST http://staging-api.emploi-connect.com/api/applications/spontaneous \
  -H "Authorization: Bearer {token}" \
  -F "company_id=test" \
  -F "applicant_name=Test" \
  -F "applicant_email=test@test.com" \
  -F "message=Test" \
  -F "type=manual" \
  -F "cv_file=@test.pdf" \
  -F "letter_file=@letter.pdf"
```

### Étape 4 : Production
```bash
# 10. Créer un tag
git tag -a v1.0-candidature-spontanee -m "Module Candidature Spontanée v1.0"

# 11. Pusher les modifications
git push origin deploy/candidature-spontanee-v1
git push origin v1.0-candidature-spontanee

# 12. Créer une Pull Request et la faire approuver
# (Attendre les approbations)

# 13. Merger en main
git checkout main
git pull origin main
git merge deploy/candidature-spontanee-v1

# 14. Déployer en production
npm run deploy:production

# 15. Vérifier la production
# - Naviguer vers https://emploi-connect.com
# - Tester les flux
# - Vérifier les logs
```

---

## 📊 Post-Déploiement

### Monitoring (24 heures)
- [ ] Vérifier les logs d'erreurs
- [ ] Vérifier les taux de réussite des candidatures
- [ ] Vérifier les performances
- [ ] Vérifier les alertes

### Feedback Utilisateurs (3 jours)
- [ ] Collecte les retours des utilisateurs
- [ ] Résoudre les bugs critiques
- [ ] Documenter les issues
- [ ] Planifier les corrections

### Métriques (1 semaine)
- [ ] Nombre de candidatures reçues
- [ ] Taux d'utilisation Option A vs Option B
- [ ] Taux d'erreurs
- [ ] Taux d'acceptation
- [ ] Temps moyen de traitement

---

## 🔄 Rollback Plan

### Si un problème critique est découvert

```bash
# 1. Identifier le problème
# (Vérifier les logs, erreurs, métriques)

# 2. Décider du rollback
# (Coordonner avec l'équipe)

# 3. Rollback immediate
git revert HEAD --no-edit
npm run deploy:production

# 4. Notifier les utilisateurs
# (Email, dashboard message)

# 5. Analyser la cause
# (Post-mortem)

# 6. Fixer le problème
# (Code review, testing)

# 7. Redéployer
# (Une fois corrigé)
```

---

## 📋 Documents de Référence

### À Fournir aux Équipes

#### Équipe Frontend
- [x] Composants React (3 fichiers)
- [x] Hook custom (1 fichier)
- [x] Pages modifiées (3 fichiers)
- [x] Documentation technique
- [x] Exemples d'utilisation

#### Équipe Backend
- [x] Spécifications API
- [x] Structure de base de données
- [x] Validations requises
- [x] Exemple d'implémentation Node.js

#### Équipe QA
- [x] Guide de test
- [x] Cas de test
- [x] Checklist de validation
- [x] Points de dépannage

#### Équipe Support
- [x] Guide utilisateur
- [x] FAQ
- [x] Points de contact
- [x] Processus de report d'erreurs

---

## 🐛 Dépannage Post-Déploiement

### Problème : Les candidatures ne s'envoient pas

**Solutions** :
1. Vérifier que l'endpoint API fonctionne
2. Vérifier les logs du serveur
3. Vérifier les permissions CORS
4. Vérifier le stockage des fichiers

### Problème : Les fichiers ne s'enregistrent pas

**Solutions** :
1. Vérifier les permissions du dossier
2. Vérifier l'espace disque disponible
3. Vérifier la taille des fichiers
4. Vérifier la configuration multer

### Problème : Les données du profil ne se chargent pas

**Solutions** :
1. Vérifier que l'utilisateur est connecté
2. Vérifier les données du profil en base
3. Vérifier les logs du navigateur
4. Vérifier les permissions API

### Problème : Les emails de notification ne s'envoient pas

**Solutions** :
1. Vérifier la configuration du serveur SMTP
2. Vérifier les logs des emails
3. Vérifier les templates d'email
4. Vérifier les permissions du serveur mail

---

## 📞 Contacts d'Escalade

| Équipe | Contact | Téléphone | Email |
|--------|---------|-----------|-------|
| Frontend | [Nom] | [Tel] | [Email] |
| Backend | [Nom] | [Tel] | [Email] |
| DevOps | [Nom] | [Tel] | [Email] |
| Product | [Nom] | [Tel] | [Email] |
| Support | [Nom] | [Tel] | [Email] |

---

## ✨ Points Clés à Retenir

1. **Tester en local d'abord** - Ne pas pusher du code non testé
2. **Staging c'est important** - Ne pas sauter l'étape de staging
3. **Monitoring 24/7** - Quelqu'un doit surveiller les premières 24 heures
4. **Rollback rapide** - Être prêt à revenir en arrière si nécessaire
5. **Communication claire** - Notifier les stakeholders à chaque étape

---

## ✅ Sign-Off

**Frontend Approuvé par** : _________________ Date : ________

**Backend Approuvé par** : _________________ Date : ________

**QA Approuvé par** : _________________ Date : ________

**Product Approuvé par** : _________________ Date : ________

**DevOps Approuvé par** : _________________ Date : ________

---

**Dernière mise à jour** : 18 janvier 2026  
**Prêt pour déploiement** : ✅ OUI / ❌ NON
