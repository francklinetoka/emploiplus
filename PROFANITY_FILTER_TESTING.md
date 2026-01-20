# Tests et Validation - Filtre de Contenu Emploi+

## ✅ Checklist de Déploiement

### Frontend - Composants Core
- [x] `src/constants/bannedWords.ts` - Liste de 300+ mots interdits
- [x] `src/hooks/useProfanityFilter.ts` - Hook avec détection et récidives
- [x] `src/components/ui/ProfanityWarningModal.tsx` - Modale responsive
- [x] `src/components/CommentsSection.tsx` - Composant réutilisable

### Intégrations Frontend
- [x] `src/pages/Newsfeed.tsx` - Création de posts
- [x] `src/pages/MyPublications.tsx` - Édition de publications

### Backend
- [x] `backend/src/middleware/contentFilter.ts` - Middleware de filtrage
- [x] `backend/src/middleware/CONTENT_FILTER_INTEGRATION.ts` - Guide d'intégration

### Documentation
- [x] `PROFANITY_FILTER_GUIDE.md` - Guide complet d'utilisation
- [x] Fichier de tests et validation

---

## 🧪 Plan de Test

### 1. Tests Unitaires - Détection de Mots

```typescript
// Test: Détection simple
Input:  "J'adore ce merde!"
Expected: Bloquer, détecté: ["merde"]

// Test: Insensible à la casse
Input:  "PUTAIN c'est cool!"
Expected: Bloquer, détecté: ["putain"]

// Test: Avec accents
Input:  "Salut c'est un bâtard de code"
Expected: Bloquer, détecté: ["bâtard", "batard"]

// Test: Avec espaces
Input:  "C'est une m e r d e de code"
Expected: Bloquer, détecté: ["merde"]

// Test: Avec caractères spéciaux
Input:  "W**f*ck ce s#it!"
Expected: Bloquer, détecté: ["fuck", "shit"]

// Test: Contenu légitime
Input:  "Excellent travail, bravo!"
Expected: Autoriser
```

### 2. Tests d'Intégration - Workflow Complet

#### Test A: Création de Post Bloquée
```
1. Naviguer vers Newsfeed
2. Cliquer dans le textarea
3. Taper: "Cet emploi est une putain de merde"
4. Cliquer "Publier"
✓ Modale s'affiche
✓ Termes détectés visibles: "putain", "merde"
✓ Avertissement 1/3
✓ Boutons Modifier / Annuler fonctionnels
✓ Post non créé en base
```

#### Test B: Modification de Contenu (Modifier)
```
1. Depuis la modale, cliquer "Modifier"
✓ Modale se ferme
✓ Curseur retourne au textarea
✓ Texte reste inchangé
✓ Utilisateur peut éditer et corriger
```

#### Test C: Annulation de Contenu (Annuler)
```
1. Depuis la modale, cliquer "Annuler"
✓ Modale se ferme
✓ Textarea se vide
✓ Formulaire revient à l'état vide
✓ Images supprimées si présentes
```

#### Test D: Récidives et Suspension
```
1. Premier avertissement
   ✓ Modale affiche: Avertissements 1/3
   
2. Deuxième avertissement
   ✓ Modale affiche: Avertissements 2/3
   
3. Troisième avertissement
   ✓ Modale affiche: Compte temporairement suspendu
   ✓ Compte suspendu pour 1 heure
   ✓ Pas d'avertissements après 3
   
4. Après 1 heure
   ✓ Suspension levée automatiquement
   ✓ Compteur réinitialisé
```

### 3. Tests UI/UX - Modale

#### Accessibilité
```
✓ ARIA labels présents (role="alertdialog")
✓ Focus trap (ne sort pas de la modale)
✓ Touche Échap ferme la modale
✓ Indicateur visuel d'avertissement (rouge)
✓ Contraste suffisant (WCAG AA)
```

#### Responsive
```
✓ Mobile (320px) : Modale lisible
✓ Tablet (768px) : Modale bien proportionnée
✓ Desktop (1024px+) : Centrage parfait
✓ Pas de débordement de texte
```

#### Visual
```
✓ Icône ⚠️ rouge visible
✓ Termes détectés en rouge/orange
✓ Boutons bien espacés
✓ Message clair et éducatif
✓ Animation fade in/out
```

### 4. Tests Backend - Middleware

#### Test E: Intégration Middleware
```
1. POST /api/publications (sans middleware)
   - Contenu banni passe
   - ❌ MAUVAIS

2. POST /api/publications (avec middleware)
   - Contenu banni bloqué
   - ✓ Réponse 400 avec erreur BANNED_CONTENT
   - ✓ triggeredWords dans réponse

3. POST /api/publications (contenu légitime + middleware)
   - Autoriser et créer le post
   - ✓ Réponse 201/200
```

#### Test F: Double Sécurité
```
1. Contourner le filtre client avec API
   - Envoi direct PUT /api/publications/1
   - Contenu interdit en body
   ✓ Middleware bloque
   ✓ Réponse 400 BANNED_CONTENT
   ✓ Post non modifié en base
```

### 5. Tests de Contenu - Cas Limites

```typescript
// Cas 1: Acronymes
"Lol, c'est cool!" → Autoriser (pas d'avertissement)

// Cas 2: Mots composés légitimes
"J'habite à Connart (commune)" → Bloquer (dét: "connard")
// Note: Limitation connue - faux positif possible

// Cas 3: Contenu académique
"Le mot 'nègre' est utilisé historiquement..." → Bloquer
// Note: Limitation - pas de contexte

// Cas 4: Langues mélangées
"C'est fucking incroyable!" → Bloquer (dét: "fucking")

// Cas 5: Translittération
"Putain" (UTF-8) → Bloquer

// Cas 6: Variantes orthographiques
"putan" (incomplet) → Autoriser si pas de match substring
```

### 6. Tests de Performance

```
// Détection de 100 posts
- Temps: < 1000ms total
- Mémoire: < 10MB

// Normalisation de 10000 caractères
- Temps: < 50ms

// Stockage localStorage
- Warnings: ~1KB per week
- Pas d'impact sur performance
```

---

## 🚀 Étapes de Déploiement

### Avant le Déploiement

```bash
# 1. Compiler TypeScript
cd src && npx tsc --noEmit
cd backend && npx tsc --noEmit

# 2. Tester les imports
npm run build

# 3. Vérifier pas d'erreurs TypeScript
npm run type-check

# 4. Tester localement
npm run dev

# 5. Tourner les tests
npm run test
```

### Déploiement

```bash
# 1. Push sur git
git add -A
git commit -m "feat: Add content filter and automatic moderation"
git push origin feature/profanity-filter

# 2. Créer PR et faire revue

# 3. Merge sur main

# 4. Déployer sur production
npm run build
npm run deploy

# 5. Monitorer les logs
tail -f logs/server.log | grep "CONTENT_FILTER"
```

### Post-Déploiement

```
□ Vérifier les logs en production
□ Tester avec comptes de test
□ Monitorer les faux positifs
□ Ajuster la liste selon les retours
□ Valider les suspensions
□ Documenter les cas spéciaux
```

---

## 📊 Métriques à Surveiller

### KPIs
```
Daily:
- Nombre de tentatives de contenu banni
- Nombre de violations uniques par utilisateur
- Mots les plus détectés
- Faux positifs signalés

Weekly:
- Taux de users "violateurs"
- Impact sur engagement (posts/comments)
- Performance du filtre
- Feedback utilisateur

Monthly:
- Tendances des violations
- Efficacité du système de suspension
- Ajustements de liste nécessaires
- Coût de modération humaine évité
```

### Queries de Monitoring

```sql
-- Violations par jour
SELECT 
  DATE(created_at) as date,
  COUNT(*) as violations,
  COUNT(DISTINCT user_id) as unique_users
FROM profanity_violations
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Utilisateurs à surveiller
SELECT 
  user_id,
  COUNT(*) as violation_count,
  MAX(created_at) as last_violation
FROM profanity_violations
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id
ORDER BY violation_count DESC
LIMIT 20;

-- Mots les plus problématiques
SELECT 
  JSONB_ARRAY_ELEMENTS(triggered_words) as word,
  COUNT(*) as frequency
FROM profanity_violations
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY word
ORDER BY frequency DESC
LIMIT 20;
```

---

## 🐛 Dépannage

### Problème: La modale ne s'affiche pas

**Causes possibles:**
- Import manquant du hook ou modale
- State non initialisé
- Erreur TypeScript

**Solution:**
```bash
# Vérifier les imports
grep -r "ProfanityWarningModal" src/pages/

# Vérifier la compilation
npm run build

# Vérifier la console navigateur (F12)
```

### Problème: Faux positifs excessifs

**Solution:**
1. Identifier les mots problématiques
2. Ajouter des exceptions (contexte)
3. Remplacer par NLP si nécessaire

```typescript
// Exemple: Excepper certains contextes
const isLegitimate = (word: string, context: string) => {
  if (word === "négro" && context.includes("historiquement")) {
    return true;
  }
  return false;
};
```

### Problème: Récidives ne se réinitialisent pas

**Solution:**
```typescript
// Vérifier localStorage
localStorage.getItem('profanity_warnings')

// Réinitialiser manuellement
localStorage.removeItem('profanity_warnings')
localStorage.removeItem('profanity_suspension')

// Vérifier les timestamps
const stored = JSON.parse(localStorage.getItem('profanity_warnings') || '[]');
stored.forEach(w => console.log(new Date(w.timestamp)));
```

---

## 📋 Sign-off de Test

### Frontend
- [ ] Tests unitaires passing (100%)
- [ ] Tests d'intégration passing
- [ ] UI responsive validée (mobile/tablet/desktop)
- [ ] Accessibilité vérifiée (WCAG AA)
- [ ] Perf acceptable < 200ms par détection

### Backend
- [ ] Middleware testé en isolation
- [ ] Routes testées avec données réelles
- [ ] Erreurs gérées correctement
- [ ] Logs complets et lisibles
- [ ] Double sécurité vérifiée

### QA
- [ ] Scénarios utilisateur complets testés
- [ ] Cas limites couverts
- [ ] Faux positifs < 5%
- [ ] Aucun régression détectée
- [ ] Documentation à jour

### Production
- [ ] Déploiement fluide
- [ ] Monitoring actif 7j/7
- [ ] Rollback plan en place
- [ ] Support prêt pour escalades
- [ ] SLA respecté

---

## 🎯 Objectifs Atteints

✅ **Détection en temps réel** : Client-side avec validation serveur  
✅ **Gestion des récidives** : LocalStorage + localStorage + suspension 1h  
✅ **UX Accessible** : ARIA, focus trap, responsive  
✅ **Double sécurité** : Client + serveur  
✅ **Composant réutilisable** : CommentsSection  
✅ **Documentation complète** : Guides + exemples + tests  
✅ **Extensible** : Facile d'ajouter des mots ou des règles  
✅ **Professional** : Conforme aux standards industrie (LinkedIn, Meta)  

---

**Dernière mise à jour** : 17 janvier 2026  
**Status** : ✅ COMPLET - Prêt pour test/déploiement
