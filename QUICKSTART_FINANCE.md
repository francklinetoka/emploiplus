# 🎯 Quick Start - Financial Analytics Module

## Accès Rapide

### 1. Accéder au module
```
Admin Panel → Onglet "Finance" 💰
```

### 2. 4 Onglets disponibles
```
[Revenus] [Entonnoir] [Activité] [Popularité]
```

---

## 📊 Onglet 1: REVENUS

**Que voir** :
- Revenu total (€)
- Répartition : Abonnements | Formations | Services Premium
- Graphique évolution (7j/30j/12 mois)

**Cas d'usage** :
- Analyser les tendances financières
- Identifier source revenue principale
- Comparer périodes

**Sélecteurs** : 7 jours | 30 jours | 1 an

---

## 📈 Onglet 2: ENTONNOIR

**Que voir** :
- Pipeline complet : Candidatures → Offres acceptées
- Taux conversion à chaque étape
- Graphique funnel vertical

**Cas d'usage** :
- Identifier goulets d'étranglement
- Optimiser processus recrutement
- Mesurer efficacité

**KPI Clé** : Taux de conversion global (%)

---

## 🔥 Onglet 3: ACTIVITÉ

**Que voir** :
- Connexions utilisateurs (graphique 24h)
- Messages/publications (timeline)
- Utilisateurs actifs

**Cas d'usage** :
- Monitorer engagement
- Identifier heures de pointe
- Détecter anomalies

**Actualisation** : Toutes les 30 secondes

---

## ⭐ Onglet 4: POPULARITÉ

**Que voir** :
- Top 5 offres (par vues)
- Top 5 formations (par ventes)
- Statistiques de popularité

**Cas d'usage** :
- Identifier contenus à promouvoir
- Optimizer allocation ressources
- Data-driven decisions

**Tri** : Automatique par pertinence

---

## 🔧 Integration Backend

### Endpoints
```
GET /api/admin/financial   → Données revenus + funnel + popularité
GET /api/admin/activity    → Données activité temps réel
```

### Authentification
```
Header: Authorization: Bearer {token}
Role requis: admin | super_admin | admin_content
```

---

## 💾 Sources Données

| Données | Source |
|---------|--------|
| Revenus abonnements | COUNT(users WHERE type=company) × 5000 XAF |
| Revenus formations | SUM(formation.price) |
| Revenus services | SUM(service_catalogs.price) |
| Candidatures | COUNT(job_applications) |
| Invitations | COUNT(job_applications WHERE status='interview_invitation') |
| Entretiens | COUNT(job_applications WHERE status='interview_scheduled') |
| Offres | COUNT(job_applications WHERE status='offer') |
| Connexions 24h | COUNT(users WHERE created_at >= NOW() - 24h) |
| Messages 24h | COUNT(publications WHERE created_at >= NOW() - 24h) |
| Top offres | SELECT * ORDER BY views DESC LIMIT 5 |
| Top formations | SELECT * ORDER BY sales DESC LIMIT 5 |

---

## 📱 Responsive

✅ Desktop : Vue complète  
✅ Tablet : 2-3 colonnes  
✅ Mobile : Empilage vertical  

---

## 🎨 Colors

- 🔵 Bleu : Utilisateurs, abonnements, offres
- 🟢 Vert : Croissance, formations, messages
- 🟠 Orange : Services, attention
- 🔴 Rouge : Alertes, baisses
- 🟣 Violet : Conversions, offres

---

## ⚡ Performance

- Rechargement automatique : 30-60 sec
- Caching : React Query (5 min)
- Optimisé : Recharts, Promise.all()
- Sécurisé : JWT, Rate Limit 120 req/min

---

## 📞 Support

**Erreurs** :
1. Token expiré → Se reconnecter
2. Pas de data → Attendre 30 sec (refresh)
3. Graphique vide → Données insuffisantes

**Questions** : Voir `DOCS/FINANCIAL_ANALYTICS.md`

---

## 📋 Checklist Utilisation

- [ ] Accès onglet Finance
- [ ] Vérifie Revenus (4 KPIs)
- [ ] Analyse Funnel (5 étapes)
- [ ] Monitore Activité (24h)
- [ ] Consulte Popularité (Top 5)
- [ ] Change période (7j/30j/1an)
- [ ] Exporte données (si besoin)

---

**Version** : 1.0  
**Statut** : ✅ Production Ready  
**Support** : 24/7 (monitoring automatique)
