# 🌐 GUIDE DE TEST - MODULE CONNEXIONS & RÉSEAUTAGE SOCIAL

## ✅ STATUS BUILD
- **Frontend**: ✓ 4002 modules transformés, 29.22s
- **Backend**: Prêt avec followService + endpoints
- **Base de Données**: Tables `follows` et `blocks` créées automatiquement

---

## 🚀 DÉMARRER LE PROJET

### Terminal 1: Backend
```bash
cd backend
npm start
```

**Attendez ce log:**
```
✓ Server running on http://localhost:5000
✓ Tables created:
  - follows ✓
  - blocks ✓
```

### Terminal 2: Frontend
```bash
npm run dev
```

**Attendez:**
```
Local:   http://localhost:5173/
```

---

## 📱 TESTER LE MODULE CONNEXIONS

### Étape 1: Créer 2+ comptes de test

```
Compte #1 - Test1:
  Email: test1@example.com
  Password: Test1234
  Type: Candidat
  Nom: Alice Dupont
  Profession: Développeur React
  Skills: React, JavaScript, TypeScript, CSS

Compte #2 - Test2:
  Email: test2@example.com
  Password: Test1234
  Type: Candidat
  Nom: Bob Martin
  Profession: Full-Stack Developer
  Skills: React, JavaScript, Node.js, PostgreSQL

Compte #3 - Test3:
  Email: test3@example.com
  Password: Test1234
  Type: Candidat
  Nom: Charlie Rousseau
  Profession: Frontend Engineer
  Skills: React, Vue.js, CSS, HTML
```

---

## 🎯 TEST 1: Bouton Connexions dans le Header

**Actions:**
1. Connectez-vous avec Compte #1 (Alice)
2. Regardez le header - vous devez voir: **Fil d'actualité → Connexions → Emplois → Services**
3. Cliquez sur **Connexions**
4. Vous êtes redirigé vers `/connexions`

**Résultat attendu:**
```
✓ Bouton visible dans la navbar
✓ Route /connexions accessible
✓ Page se charge correctement
```

---

## 🎯 TEST 2: Voir les Stats du Réseau (Colonne Gauche)

**Page:** `/connexions`

**Éléments visibles:**
```
┌─────────────────────────────┐
│     Votre Réseau            │
├─────────────────────────────┤
│ 👥 Abonnés         0        │
│ 👤 Abonnements     0        │
├─────────────────────────────┤
│ Taille du réseau:  0        │
└─────────────────────────────┘
```

**Points à vérifier:**
- ✓ Statistiques affichées (initialement 0 pour nouveau compte)
- ✓ Design avec icônes et couleurs distinctes (bleu pour abonnés, violet pour abonnements)
- ✓ Mise en page responsive (collant à gauche sur desktop)

---

## 🎯 TEST 3: Suggestions IA (Colonne Centre) ⭐ FEATURE PRINCIPALE

### 3.1 Voir les Suggestions

**Page:** `/connexions`

**Attendu:** Une grille de cartes de profils suggérés

**Chaque carte contient:**
```
┌──────────────────────────────┐
│ 📷 Avatar  | Bob Martin  82% │
│            Developer         │
├──────────────────────────────┤
│ 📝 "Passionné par web dev"   │
├──────────────────────────────┤
│ Compétences communes:        │
│ [React] [JavaScript] [+1]    │
├──────────────────────────────┤
│ 💡 2 compétence(s) commune(s)│
├──────────────────────────────┤
│ [💜 Suivre]                  │
└──────────────────────────────┘
```

**Points clés à vérifier:**
- ✓ Match Score badge (82%) avec couleur 🟢 ou 🟠
- ✓ Compétences communes listées
- ✓ Raison de suggestion: "X compétence(s) commune(s)"
- ✓ Bouton "Suivre" réactif

### 3.2 Tester le Système de Suivi

**Action:** Cliquez sur "Suivre" pour Bob

**Résultat immédiat:**
1. Le bouton change: `[Suivre]` → `[✓ Suivi]`
2. Les stats se mettent à jour: `Abonnements: 0` → `Abonnements: 1`
3. Bob disparaît des suggestions (déjà suivi)

**Vérifications:**
- ✓ Action instantanée (pas de refresh)
- ✓ Stats synchronisées avec React Query
- ✓ Bouton visuel change correctement
- ✓ Profil suivi n'apparaît plus dans suggestions

### 3.3 Tester Unfollow

**Action:** Cliquez "✓ Suivi" pour revenir en arrière

**Résultat:**
1. Bouton redevient `[Suivre]`
2. Stats: `Abonnements: 1` → `Abonnements: 0`
3. Le profil peut être en suggestions à nouveau

---

## 🎯 TEST 4: Match Score Algorithm ⭐ CORE LOGIC

### Vérifier les Scores

**Cas d'étude:**
```
Profil Alice:
- Skills: React, JavaScript, TypeScript, CSS
- Experience: Développeur React

Profils à matcher:
1. Bob (React, JavaScript, Node.js, PostgreSQL)
   - Compétences communes: React, JavaScript = 2
   - Match score expected: ~70-80% (bon match)
   
2. Charlie (React, Vue.js, CSS, HTML)
   - Compétences communes: React, CSS = 2
   - Match score expected: ~60-70% (moyen)

3. Profil DevOps uniquement (Docker, Kubernetes, Linux)
   - Compétences communes: 0
   - Match score expected: <30% (ne doit pas apparaître)
```

**Vérification:**
1. Relevez les scores de chaque profil
2. Comparez avec l'attente (plus de compétences commune = score plus haut)
3. Vérifiez qu'aucun profil avec score <30% n'apparaît

---

## 🎯 TEST 5: Activité du Réseau (Colonne Droite)

**Page:** `/connexions`

**Étapes:**
1. Vous avez suivi Bob et Charlie
2. Accédez à Compte #2 (Bob)
3. Publiez quelque chose sur le fil d'actualité
4. Retournez à Compte #1 (Alice) sur `/connexions`

**Attendu dans "Activité du Réseau":**
```
┌────────────────────────────────┐
│    Activité du Réseau          │
├────────────────────────────────┤
│ 📄 Bob Martin                  │
│    a publié: "Ma première pub" │
│    Full-Stack Developer        │
│    à l'instant (ou "2m")       │
└────────────────────────────────┘
```

**Vérifications:**
- ✓ Publications de Bob visibles
- ✓ Timestamp correct ("À l'instant", "5m", "2h", etc.)
- ✓ Icône type de contenu (📄 pour publication)
- ✓ Les followers que vous suivez ALL apparaissent

**Auto-refresh:** Attendez 30 secondes, le flux doit se rafraîchir automatiquement

---

## 🎯 TEST 6: Système de Blocage (Optional Advanced)

**Action:**
1. Sur `/connexions` (Compte Alice)
2. Trouvez Charlie dans suggestions
3. Cherchez un menu ou bouton "Bloquer" (note: peut être absent si non implémenté en UI)

**Comportement attendu si implemented:**
- ✓ Cliquer "Bloquer" supprime le suivi bidirectionnel
- ✓ L'utilisateur bloqué n'apparaît plus en suggestions
- ✓ Impossible de suivre un utilisateur bloqué

---

## 🔍 VÉRIFICATIONS TECHNIQUES

### Requêtes API à Observer (DevTools Network)

| Endpoint | Method | Quand | Réponse |
|----------|--------|-------|---------|
| `/api/follows/stats` | GET | Charge page | `{followerCount, followingCount}` |
| `/api/follows/suggestions` | GET | Charge page | `[{user, matchScore, commonSkills...}]` |
| `/api/follows/activity` | GET | Charge page | `[{type, actor, action, timestamp...}]` |
| `/api/follows/:userId` | POST | Click "Suivre" | `{success: true, follow}` |
| `/api/follows/:userId` | DELETE | Click "Suivi" | `{success: true}` |

**Vérification:**
```
DevTools (F12) → Network tab
1. Rechargez /connexions
2. Vérifiez que 3 requêtes GET sont lancées (stats, suggestions, activity)
3. Cliquez "Suivre"
4. Vérifiez qu'une requête POST est envoyée et réussit
```

---

## 📊 TESTS DE DONNÉES

### Dataset Test Recommandé

**Profil #1 - Alice (Skills rares)**
```json
{
  "full_name": "Alice Dupont",
  "profession": "Développeur React Senior",
  "skills": ["React", "TypeScript", "GraphQL", "Testing", "Architecture"]
}
```
Résultat: Voir suggestions avec scores variés (75%+, 50-60%, <30%)

**Profil #2 - Bob (Skills communs)**
```json
{
  "full_name": "Bob Martin",
  "profession": "Full-Stack Developer",
  "skills": ["React", "JavaScript", "Node.js", "PostgreSQL"]
}
```
Résultat: Score élevé vs Alice (~75-85%)

**Profil #3 - Charlie (Peu de skills)**
```json
{
  "full_name": "Charlie Rousseau",
  "profession": "Frontend Engineer",
  "skills": ["React", "CSS"]
}
```
Résultat: Score moyen-bas (~45-60%)

---

## 🐛 TROUBLESHOOTING

### Problem: Pas de suggestions affichées
**Solutions:**
1. Vérifier que vous êtes authentifié
2. Vérifier backend logs: `GET /api/follows/suggestions`
3. DevTools Console: Chercher erreurs
4. Vérifier que d'autres utilisateurs existent en BD

### Problem: Suivre ne marche pas
**Solutions:**
1. Vérifier token JWT valide
2. Vérifier requête POST `/api/follows/:userId` en Network tab
3. Vérifier backend logs pour erreurs
4. Refresh page et réessayer

### Problem: Stats ne se mettent pas à jour
**Solutions:**
1. Vérifier React Query en DevTools
2. L'invalidation des queries doit relancer la requête
3. Refresh manuel (Ctrl+R) pour vérifier si data persiste en BD

### Problem: Activité du réseau vide
**Solutions:**
1. Vérifier que vous avez suivi quelqu'un
2. Vérifier que les personnes suivies ont publié quelque chose
3. Les publications doivent avoir `is_active = true`
4. Attendre le refresh automatique (30s)

---

## ✅ CHECKLIST DE VALIDATION

- [ ] Bouton "Connexions" visible dans header après login
- [ ] Route `/connexions` accessible
- [ ] Colonne gauche: NetworkStats affiche statistiques (0 initialement)
- [ ] Colonne centre: Suggestions affichées avec Match Scores
- [ ] Match Score badge: Bonne couleur (🟢≥75%, 🟠45-74%, ⚪<45%)
- [ ] Bouton "Suivre": Cliquable et change d'état immédiatement
- [ ] Après suivi: Stats se mettent à jour automatiquement
- [ ] Colonne droite: Activité affichée (peut être vide initialement)
- [ ] Refresh auto activité chaque 30s
- [ ] Pas d'erreur TypeScript/console JavaScript
- [ ] Design responsive (mobile: 1 col, desktop: 3 cols)
- [ ] Loading states affichés correctement

---

## 🎯 PROCHAINES ÉTAPES

Après validation:
1. **Admin Panel**: Ajouter interface pour gérer blocks
2. **Notifications**: Badge rouge de nouveaux followers
3. **Analytics**: Tracker nombre de follows/unfollows
4. **Export**: Lister tous ses followers/followings
5. **Recommandations**: Améliorer algo avec ML

---

## 📞 SUPPORT

- **Erreurs Backend**: Vérifier `backend/logs/` ou terminal backend
- **Erreurs Frontend**: DevTools Console (F12)
- **API Issues**: Vérifier Network tab (F12 → Network)
- **DB Issues**: Vérifier tables `follows` et `blocks` en PostgreSQL

---

**Prêt à tester? 🚀 Lancez le backend, puis le frontend, puis allez à /connexions!**
