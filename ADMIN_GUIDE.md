# 🎯 Guide d'utilisation - Compte administrateur amélioré

## 📍 Accès au panneau d'administration

### Routes disponibles:
- **Tableau de bord principal** : `/admin` ou `/admin?tab=dashboard`
- **Page dashboard dédiée** : `/admin/dashboard`

## 🎨 Interface principale - 7 onglets

### 1. **Tableau de bord** 📊
Route: `/admin?tab=dashboard`

**Contenu:**
- Vue globale avec 9 cartes de statistiques principales
- État des candidatures (en attente, validées, rejetées)
- Candidatures récentes avec détails complets
- Graphiques de distribution des candidatures
- Visualisation de tendances

**Onglets internes:**
- **Vue globale** : Résumé complet avec KPIs
- **Utilisateurs** : Top 10 candidats et entreprises
- **Candidatures** : Analyse détaillée et liste
- **Contenu** : Statistiques publications, portfolios, formations
- **Analytics** : Tendances et conversions

---

### 2. **Utilisateurs** 👥
Route: `/admin?tab=users`

**Fonctionnalités:**
- ✅ Voir tous les candidats et entreprises
- ✅ Bloquer/Débloquer des comptes
- ✅ Supprimer des utilisateurs
- ✅ Rechercher par nom ou email
- ✅ Voir le statut (Actif/Bloqué)
- ✅ Voir la date d'inscription

**Onglets:**
- Candidats (avec comptage)
- Entreprises (avec comptage)

**Actions rapides:**
```
Chercher → Sélectionner → Bloquer/Débloquer/Supprimer
```

---

### 3. **Offres d'emploi** 💼
Route: `/admin?tab=offers`

**Fonctionnalités:**
- ✅ Créer de nouvelles offres d'emploi
- ✅ Définir : titre, entreprise, localisation, secteur, type, salaire
- ✅ Ajouter description détaillée
- ✅ Voir les offres créées

---

### 4. **Formations** 📚
Route: `/admin?tab=formations`

**Fonctionnalités:**
- ✅ Créer nouvelles formations
- ✅ Définir : titre, catégorie, niveau, durée, prix
- ✅ Ajouter description
- ✅ Publier et gérer

---

### 5. **Notifications** 🔔
Route: `/admin?tab=notifications`

**Fonctionnalités:**
- ✅ Créer notifications site-wide
- ✅ Cibler : Tous, Candidats, Entreprises
- ✅ Ajouter titre, message, catégorie, image, lien
- ✅ Voir historique des notifications
- ✅ Supprimer notifications

---

### 6. **Candidatures** 📋
Route: `/admin?tab=applications`

**Fonctionnalités:**
- ✅ Vue d'ensemble (total, acceptées, en attente, rejetées)
- ✅ Statistiques des candidatures
- ✅ Lien vers page détaillée
- ✅ Gestion complète des candidatures

---

### 7. **Analytics** 📈
Route: `/admin?tab=analytics`

**Contenu:**
- **4 Métriques clés** : Croissance utilisateurs, Taux de candidature, Taux de conversion, Temps moyen session
- **Graphiques** :
  - Tendances utilisateurs et candidatures (area chart)
  - Taux de conversion hebdomadaire (bar chart)
  - Performance des offres avec indicateurs de progression
- **Top 5 offres** par nombre de candidatures
- **Sélection de période** : Semaine / Mois / Année

---

## 📊 Statistiques détaillées affichées

### Compteurs principaux
```
- Utilisateurs totaux
- Candidats
- Entreprises  
- Administrateurs
- Offres d'emploi
- Candidatures reçues
- Formations
- Portfolios
- Publications
- Déploiements de formations
```

### Top listes
```
- Top 10 candidats (par candidatures soumises)
- Top 10 entreprises (par offres publiées)
- Top 10 contributeurs (par publications)
```

### Analyses
```
- Candidatures par statut (diagramme circulaire)
- Candidatures par entreprise (graphique barres)
- Offres par entreprise (classement)
- Taux de conversion (progression)
```

---

## 🎯 Cas d'usage courants

### Cas 1: Surveiller une candidature
1. Aller à **Tableau de bord** → **Candidatures**
2. Voir les candidatures récentes avec statut
3. Cliquer sur "Voir toutes les candidatures" pour plus de détails

### Cas 2: Bloquer un utilisateur problématique
1. Aller à **Utilisateurs**
2. Chercher l'utilisateur par nom/email
3. Cliquer sur **Bloquer**
4. Confirmation automatique

### Cas 3: Analyser les performances
1. Aller à **Analytics**
2. Voir les 4 KPIs principaux
3. Consulter les graphiques de tendance
4. Identifier les top offres et entreprises

### Cas 4: Créer une notification urgente
1. Aller à **Notifications**
2. Remplir titre et message
3. Choisir la cible (Tous, Candidats, Entreprises)
4. Publier
5. Voir la liste des notifications existantes

---

## 🔒 Permissions et sécurité

- Seuls les administrateurs (admin, super_admin, admin_content) peuvent accéder
- Token d'authentification requis (adminToken ou token)
- Confirmations pour les suppressions
- Gestion des erreurs appropriée

---

## 🌐 API endpoints utilisés

```
GET  /api/admin/stats              - Statistiques complètes
GET  /api/users                    - Liste des utilisateurs
PUT  /api/users/{id}               - Mettre à jour utilisateur
DELETE /api/users/{id}             - Supprimer utilisateur
GET  /api/jobs                     - Liste des offres
POST /api/jobs                     - Créer offre
GET  /api/formations               - Liste des formations
POST /api/formations               - Créer formation
GET  /api/site-notifications       - Notifications
POST /api/admin/site-notifications - Créer notification
DELETE /api/admin/site-notifications/{id} - Supprimer notification
GET  /api/publications             - Publications
DELETE /api/publications/{id}      - Supprimer publication
GET  /api/portfolios               - Portfolios
PUT  /api/portfolios/{id}          - Mettre à jour portfolio
DELETE /api/portfolios/{id}        - Supprimer portfolio
```

---

## 💡 Tips & Tricks

### Chercher efficacement
- Utilisez la barre de recherche pour filtrer rapidement
- Les recherches fonctionnent sur nom ET email

### Données en temps réel
- Cliquez sur "Actualiser" pour mettre à jour manuellement
- Les graphiques se mettent à jour automatiquement

### Exporter les données
- Les tables sont compatible avec copier/coller
- Les graphiques peuvent être capturés en screenshot

---

## ⚠️ Attention

- ⚠️ La suppression d'utilisateur est **définitive**
- ⚠️ Les utilisateurs bloqués ne peuvent plus accéder au site
- ⚠️ Toutes les actions sont tracées dans les logs (backend)

---

## 🆘 Dépannage

### Données non à jour
→ Cliquez sur "Actualiser" dans les sections concernées

### Les statistiques n'apparaissent pas
→ Vérifiez que le backend API fonctionne (`/api/admin/stats`)

### Erreur de suppression
→ Vérifiez vos permissions d'administrateur

---

## 📚 Ressources additionnelles

Voir `DOCS/ADMIN_IMPROVEMENTS.md` pour la documentation technique complète.
