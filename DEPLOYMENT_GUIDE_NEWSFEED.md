# Guide Rapide de Déploiement - Newsfeed Logic
**Mise à Jour:** 19 janvier 2026

---

## 🚀 DÉPLOIEMENT EN 5 ÉTAPES

### ÉTAPE 1: Appliquer la Migration SQL

```bash
# Accès à PostgreSQL
psql -U postgres -d emploi_connect_db

# Exécuter la migration
\i backend/src/migrations/001_add_newsfeed_optimization.sql

# Ou en une ligne
psql -U postgres -d emploi_connect_db < backend/src/migrations/001_add_newsfeed_optimization.sql

# Vérifier les tables créées
\dt
-- Doit afficher: banned_words_backend, profanity_violations, discreet_mode_interactions, publication_visibility_log

# Vérifier les colonnes
\d publications
-- Doit avoir: contains_unmoderated_profanity, profanity_check_status, moderation_status

\d users
-- Doit avoir: is_certified, account_status, discreet_mode_enabled
```

---

### ÉTAPE 2: Mettre à Jour le Backend

```bash
cd backend

# Compiler TypeScript
npm run build

# Ou directement en dev
npm run dev
# Le serveur va:
# 1. Charger NewsfeedService depuis services/newsfeedService.ts
# 2. Créer tables manquantes automatiquement
# 3. Écouter sur http://localhost:5000
```

---

### ÉTAPE 3: Tester les Endpoints

```bash
# Test 1: GET /api/publications avec tri hybride
curl -X GET "http://localhost:5000/api/publications?sort=relevant&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test 2: GET avec debug stats
curl -X GET "http://localhost:5000/api/publications?sort=relevant&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Debug-Newsfeed: true"
# (Nécessite DEBUG_NEWSFEED_FILTERS=true dans .env)

# Test 3: POST publication avec profanité check
curl -X POST "http://localhost:5000/api/publications" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Ceci contient une insulte",
    "visibility": "public",
    "category": "conseil"
  }'

# Test 4: Admin - Lister mots interdits
curl -X GET "http://localhost:5000/api/admin/banned-words" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Test 5: Admin - Ajouter mot interdit
curl -X POST "http://localhost:5000/api/admin/banned-words" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "word": "nouveau_mot",
    "severity": "high"
  }'

# Test 6: Admin - Violations de profanité
curl -X GET "http://localhost:5000/api/admin/profanity-violations" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Test 7: Like avec discreet mode check
curl -X POST "http://localhost:5000/api/publications/123/like" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### ÉTAPE 4: Configuration Frontend

Le frontend utilise déjà les endpoints via `Newsfeed.tsx`. Vérifier:

```typescript
// src/pages/Newsfeed.tsx
const { filterContent, warningCount, isTemporarilySuspended } = useProfanityFilter();

// GET publications
const response = await fetch('/api/publications?sort=relevant&limit=10');
const { publications, filtersSummary } = await response.json();

// POST publication
const pubResponse = await fetch('/api/publications', {
    method: 'POST',
    body: JSON.stringify({ content, visibility, ... })
});
const { profanityWarning } = await pubResponse.json();
if (profanityWarning?.detected) {
    // Afficher ProfanityWarningModal
}
```

**Aucune modification frontend nécessaire** - API backward compatible.

---

### ÉTAPE 5: Configuration Environnement

```bash
# backend/.env
DEBUG_NEWSFEED_FILTERS=true     # Inclure filtersSummary dans réponses (DEV only)
DATABASE_URL=postgresql://...  # Déjà configuré

# Optionnel: Customiser la durée de suspension profanité
# (Actuellement: 1h, dans useProfanityFilter.ts)
```

---

## ✅ VÉRIFICATION POST-DÉPLOIEMENT

### Checklist Rapide

```bash
# 1. DB Migration OK?
psql -U postgres -d emploi_connect_db -c "\dt" | grep -E "banned_words|profanity_violations"
# ✓ Doit afficher les deux tables

# 2. Indexes créés?
psql -U postgres -d emploi_connect_db -c "\d+ publications" | grep "idx_publications"
# ✓ Doit lister les indexes

# 3. Colonnes présentes?
psql -U postgres -d emploi_connect_db -c "SELECT column_name FROM information_schema.columns WHERE table_name='publications' AND column_name LIKE '%profanity%';"
# ✓ Doit retourner contains_unmoderated_profanity, profanity_check_status

# 4. Service se charge?
curl -s http://localhost:5000/api/publications \
  -H "Authorization: Bearer test" 2>&1 | grep -E "publications|error"
# ✓ Doit retourner publications (même si vide ou erreur 401/403)

# 5. Admin endpoints accessibles?
curl -s http://localhost:5000/api/admin/banned-words \
  -H "Authorization: Bearer ADMIN_TOKEN" | head
# ✓ Doit retourner bannedWords array
```

---

## 📊 MONITORING ESSENTIELS

### Queries de Vérification

```sql
-- Violations de profanité par jour
SELECT DATE(created_at) as date, COUNT(*) as count
FROM profanity_violations
GROUP BY date
ORDER BY date DESC;

-- Raisons de filtrage
SELECT filter_reason, COUNT(*) as count
FROM publication_visibility_log
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY filter_reason
ORDER BY count DESC;

-- Mots interdits les plus détectés
SELECT flagged_words, COUNT(*) as count
FROM profanity_violations
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY flagged_words
ORDER BY count DESC;

-- Publications en attente de modération
SELECT p.id, p.content, p.created_at, u.full_name
FROM publications p
LEFT JOIN users u ON p.author_id = u.id
WHERE p.contains_unmoderated_profanity = true
AND p.moderation_status = 'pending'
ORDER BY p.created_at DESC;

-- Utilisateurs en mode discreet
SELECT id, full_name, company_id, discreet_mode_enabled
FROM users
WHERE discreet_mode_enabled = true
AND is_deleted = false;
```

---

## 🐛 TROUBLESHOOTING

### Problème: "NewsfeedService not found"
```bash
# Solution: Vérifier import dans server.ts
import { NewsfeedService } from "./services/newsfeedService.js";
# Doit être présent à ligne ~13
```

### Problème: Migration échoue avec "table exists"
```bash
# Solution: Normal si table existe déjà
# CREATE TABLE IF NOT EXISTS = idempotent
# Réexécuter la migration = safe
```

### Problème: Indexes lents / performance dégradée
```bash
# Solution: Reindex
REINDEX TABLE publications;
REINDEX TABLE users;
ANALYZE publications;
ANALYZE users;
```

### Problème: Publications toujours affichées malgré profanité
```sql
-- Debug: Vérifier colonne
SELECT id, content, contains_unmoderated_profanity, 
       profanity_check_status, moderation_status
FROM publications
WHERE id = 123;

-- Si contains_unmoderated_profanity = false, c'est correct
-- Si = true mais visible, vérifier que service applique le filtre
-- WHERE contains_unmoderated_profanity = false
```

### Problème: Discreet mode ne fonctionne pas
```sql
-- Debug: Vérifier colonnes utilisateur
SELECT id, full_name, discreet_mode_enabled, company_id, account_status
FROM users
WHERE id = 456;

-- discreet_mode_enabled doit être true
-- company_id doit être != NULL pour les deux utilisateurs
-- Pour être anonymisé, viewer doit être de MÊME company_id
```

---

## 🎯 PROCHAINES ÉTAPES (OPTIONNEL)

### Feature: Admin Dashboard pour Profanity
```typescript
// Créer page admin/profanity pour modérer violations
// GET /api/admin/profanity-violations
// POST /api/admin/profanity-violations/:id/approve
```

### Feature: User Appeal pour Violations
```typescript
// Permettre aux utilisateurs de contester une rejection
// POST /api/publications/:id/appeal-moderation
```

### Feature: ML-based Profanity Detection
```typescript
// Intégrer ML model pour contextual profanity detection
// vs simple keyword matching
```

### Feature: Granular Discreet Mode
```typescript
// Permettre discreet mode par company spécifique
// vs discreet mode global
```

---

## 📞 SUPPORT & QUESTIONS

**Fichiers Modifiés:**
- ✅ `backend/src/services/newsfeedService.ts` (NOUVEAU)
- ✅ `backend/src/migrations/001_add_newsfeed_optimization.sql` (NOUVEAU)
- ✅ `backend/src/server.ts` (MODIFIÉ: import + endpoints)

**Tests Unitaires:**
- Voir section 8 de IMPLEMENTATION_NEWSFEED_LOGIC.md

**Documentation Complète:**
- Voir IMPLEMENTATION_NEWSFEED_LOGIC.md (110KB de docs détaillées)

---

**Date de Déploiement:** 19 janvier 2026  
**Version:** 1.0  
**Status:** ✅ Prêt pour Production
