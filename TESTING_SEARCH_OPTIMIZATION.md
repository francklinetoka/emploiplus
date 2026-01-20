# 🧪 Guide de Test - Optimisation Recherche

## Démarrage du Serveur

```bash
# Terminal 1: Backend Node.js
cd /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-
npm run dev  # ou node backend/src/server.js

# Terminal 2: Frontend React (optionnel)
npm run dev  # Vite dev server

# Terminal 3: Accédez au site
# Ouvrir http://localhost:5173 (frontend)
```

## 🔍 Scénarios de Test

### Test 1: Header Global Search

#### 1.1 - Validation minChars
```
Action: Cliquer sur l'icône Search dans le Header
Input:  "d"
Attendu: Warning "Saisissez au moins 3 caractères" ✓

Input:  "de"
Attendu: Warning toujours visible ✓

Input:  "dev"
Attendu: Warning disparaît, suggestions apparaissent (jobs + formations) ✓
```

#### 1.2 - Debouncing (500ms)
```
Action: Taper rapidement: "d-e-v-e-l-o-p-p-e-u-r"
Attendu: Les suggestions n'apparaissent qu'une fois (pas 11 API calls) ✓
Vérifier: Ouvrir DevTools > Network > voir que 1 seul GET /api/search/jobs
```

#### 1.3 - Frontend Caching
```
Action: Taper "developer", attendre résultats
        Puis effacer et retaper "developer" rapidement
Attendu: 2nde requête utilise le cache (instantané, pas de Network call) ✓
Vérifier: Devtools Network montre seulement 1 requête /api/search/jobs
```

#### 1.4 - Navigation Résultats
```
Action: Taper "developer", cliquer sur un job résultat
Attendu: Navigation vers /offres/:id ✓
Vérifier: URL change, page job s'affiche
```

### Test 2: Jobs Page Search

#### 2.1 - Debouncing & minChars
```
Localisation: /offres page, champ "Poste"
Input:  "a"
Attendu: Warning box "Saisissez au moins 3 caractères" ✓

Input:  "développeur" (11 caractères)
Attendu: 
  - Warning disparaît
  - Après 500ms: liste jobs filtrée apparaît ✓
  - Vérifier DevTools: 1 seul appel GET /api/jobs?q=développeur
```

#### 2.2 - Rapid Typing Debounce
```
Taper rapidement: "dev" → pause 100ms → "devops"
Attendu: 
  - UI montre "devops" immédiatement
  - Seule 1 requête API pour "devops"
  - Pas de requête pour "dev" (trop court)
✓
```

### Test 3: Formations Page Search

#### 3.1 - Même Test que Jobs
```
Localisation: /formations page, champ "Formation"
Input:  "react"
Attendu:
  - Warning disparaît après 3 caractères
  - Après 500ms: formations filtrées
  - GET /api/search/formations?q=react
```

#### 3.2 - Multiple Categories
```
Input:  "web"
Attendu:
  - Résultats formations "Web Design", "Web Development", etc
  - Ranking correct (titre weighted plus lourd que description)
```

## 📊 Tests de Performance

### Test 4: Impact Debouncing

```bash
# Ouvrir DevTools > Network
# Aller sur /offres
# Taper dans "Poste": "d-e-v-e-l-o-p-p-e-u-r" (10 caractères, ~1 seconde)

Avant optimisation: ~10 API calls
Après optimization:  ~1 API call
Amélioation: 10x moins de requêtes ✓
```

### Test 5: Cache Frontend

```bash
# Devtools > Network, filter: Fetch/XHR
# Champ Jobs search: Taper "python"
# Attendre résultats
# Effacer champ
# Retaper "python" immédiatement

Premier "python":   1 API call visible
Deuxième "python":  0 API call (cache) ✓
```

### Test 6: Result Size Limitation

```bash
# DevTools > Network > API call /api/search/jobs?q=dev
# Réponse JSON
# Vérifier: results.length <= 8

Limite jobs:       8 résultats ✓
Limite formations: 8 résultats ✓
Limite users:      8 résultats ✓
```

## 🗄️ Tests Base de Données

### Test 7: tsvector Population

```bash
# Terminal: psql
psql -U postgres -d emploi_plus_db_cg

# Vérifier search_vector peuplés
SELECT COUNT(*) FROM jobs WHERE search_vector IS NOT NULL;
# Attendu: 11 ✓

SELECT COUNT(*) FROM formations WHERE search_vector IS NOT NULL;
# Attendu: 3 ✓

SELECT COUNT(*) FROM users WHERE search_vector IS NOT NULL;
# Attendu: 16 ✓

# Vérifier un exemple FTS
SELECT id, title, ts_rank(search_vector, to_tsquery('french', 'developer')) as rank
FROM jobs
WHERE search_vector @@ to_tsquery('french', 'developer')
ORDER BY rank DESC;
# Attendu: Jobs contenant "developer" avec scores ✓
```

### Test 8: Triggers Auto-Update

```bash
# Terminal: psql
psql -U postgres -d emploi_plus_db_cg

# Ajouter un nouveau job
INSERT INTO jobs (title, description, company, location, sector, type)
VALUES ('Senior Rust Developer', 'Build fast systems', 'RustCorp', 'Paris', 'Tech', 'CDI');

# Vérifier que search_vector a été auto-peuplé
SELECT id, title, search_vector IS NOT NULL as has_vector
FROM jobs
WHERE title LIKE '%Rust%';

# Attendu: search_vector NOT NULL ✓

# Tester la recherche du nouveau job
SELECT id, title
FROM jobs
WHERE search_vector @@ to_tsquery('french', 'rust');

# Attendu: Le nouveau job apparaît ✓
```

## ✅ Checklist Validation Complete

- [ ] Header search affiche warning pour < 3 chars
- [ ] Header search affiche suggestions pour >= 3 chars
- [ ] Clic sur suggestion navigue vers la page
- [ ] Taper rapidement = 1 seul appel API (debouncing)
- [ ] Taper requête 2x = 2nde fois instantée (caching)
- [ ] Jobs page a champ search debounced
- [ ] Formations page a champ search debounced
- [ ] API retourne max 8 résultats par catégorie
- [ ] PostgreSQL search_vector peuplé pour 3 tables
- [ ] Triggers auto-update search_vector sur INSERT/UPDATE
- [ ] Build npm successful (0 errors)
- [ ] Aucun console error en navigant

## 🔧 Commandes Utiles

### Vérifier l'état du cache
```javascript
// Dans la console browser
localStorage.getItem('searchCache')
// ou dans le hook useOptimizedSearch
result.getCacheStats()
// Retourne: { hits: N, misses: N, size: N }
```

### Simuler FTS PostgreSQL
```sql
-- PostgreSQL console
SELECT id, title, ts_rank(search_vector, query) as score
FROM jobs, to_tsquery('french', 'python:* | django:*') query
WHERE search_vector @@ query
ORDER BY score DESC
LIMIT 5;
```

### Monitor Network Performance
```javascript
// DevTools Performance tab
// 1. Ouvrir /offres
// 2. Record performance
// 3. Taper "developer" dans le champ recherche
// 4. Stop recording
// Vérifier:
// - Main thread blocking minimal
// - Une seule requête API après 500ms debounce
// - Rendering < 100ms
```

## 🐛 Troubleshooting

### Problem: Warning ne disparaît pas après 3 chars
**Solution**: Vérifier que showMinCharsWarning = localInput.length < 3

### Problem: Pas de suggestions
**Solution**: 
1. Vérifier API /api/search/jobs est actif
2. Vérifier search_vector peuplés en PostgreSQL
3. Vérifier que query >= 3 caractères

### Problem: Trop de requêtes API
**Solution**:
1. Vérifier debounceMs = 500
2. Vérifier minChars = 3
3. Vérifier pas de onChange implicite triggering

### Problem: Cache pas d'effet
**Solution**:
1. Ouvrir localStorage dans DevTools
2. Vérifier clé searchCache existe
3. Vérifier que queryKey est identique entre 2 requêtes

---

**Temps estimé pour les tests**: 30-45 minutes
**Besoin de redémarrage**: Non (HMR devrait suffir pour CSS/JS simple)
