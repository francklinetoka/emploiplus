# Mode Recherche Discrète - Documentation Complète

## Vue d'ensemble

Le **Mode Recherche Discrète** est une fonctionnalité permettant aux candidats de rester invisibles auprès de leur employeur actuel tout en restant visibles pour tous les autres recruteurs de la plateforme.

## 🎯 Objectif

Permettre aux candidats en recherche d'emploi de consulter les opportunités sans alerter leur employeur actuel, en masquant sélectivement leurs activités (likes, commentaires, mises à jour de profil) uniquement à l'entreprise pour laquelle ils travaillent.

---

## 📍 Emplacement dans l'Interface

### Front-end
- **Page:** Fil d'actualité (`/` ou `/newsfeed`)
- **Position:** Panneau latéral gauche (sidebar)
- **Après:** Section "Statistiques de visites du profil"
- **Composant:** `DiscreetModeCard.tsx`

### Visibilité
- **Pour les candidats:** Toujours visible
- **Pour les entreprises:** Caché
- **Pour les administrateurs:** Caché

---

## 🔧 Architecture Technique

### 1. Frontend

#### Composant: `DiscreetModeCard.tsx`

```tsx
interface DiscreetModeCardProps {
  userType: string;           // Type d'utilisateur (candidate, company, admin)
  company?: string;           // Nom de l'entreprise du candidat
  companyId?: string;         // ID de l'entreprise
  onStatusChange?: (enabled, companyId, companyName) => void;
}
```

**Fonctionnalités:**
- ✅ Affichage du statut du mode (activé/désactivé)
- ✅ Bouton de basculement pour activer/désactiver
- ✅ Validation: Entreprise doit être sélectionnée
- ✅ Message d'alerte si aucune entreprise
- ✅ Confirmation visuelle avec badge de statut
- ✅ Sauvegarde via API PUT `/api/users/me`

**États visuels:**
1. **Désactivé (sans entreprise):** Grisé, bouton désactivé
2. **Désactivé (avec entreprise):** Blanc, bouton cliquable
3. **Activé:** Vert, bouton avec statut "Désactiver"

---

### 2. Backend

#### Migrations de Base de Données

Nouvelles colonnes ajoutées à la table `users`:

```sql
-- Colonne pour stocker le nom de l'entreprise (texte libre ou ID)
ALTER TABLE users ADD COLUMN IF NOT EXISTS company TEXT;

-- ID de l'entreprise sélectionnée
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id INTEGER;

-- État du mode recherche discrète
ALTER TABLE users ADD COLUMN IF NOT EXISTS discreet_mode_enabled BOOLEAN DEFAULT false;

-- ID de l'entreprise pour laquelle masquer les activités
ALTER TABLE users ADD COLUMN IF NOT EXISTS hidden_from_company_id INTEGER;

-- Nom de l'entreprise pour laquelle masquer les activités
ALTER TABLE users ADD COLUMN IF NOT EXISTS hidden_from_company_name TEXT;
```

#### Endpoints API

##### 1. GET `/api/users/me` (Existant, étendu)
**Authentification:** Requise (`userAuth`)

**Réponse (nouvelle structure):**
```json
{
  "id": 123,
  "full_name": "Jean Dupont",
  "company": "TechCorp",
  "company_id": 456,
  "discreet_mode_enabled": true,
  "hidden_from_company_id": 456,
  "hidden_from_company_name": "TechCorp",
  ...autres données...
}
```

##### 2. PUT `/api/users/me` (Existant, étendu)
**Authentification:** Requise (`userAuth`)

**Corps de la requête:**
```json
{
  "company": "TechCorp",
  "company_id": 456,
  "discreet_mode_enabled": true,
  "hidden_from_company_id": 456,
  "hidden_from_company_name": "TechCorp"
}
```

**Réponse:** Utilisateur mis à jour avec les nouvelles colonnes

##### 3. GET `/api/publications` (Modifié)
**Authentification:** Requise (`userAuth`) - **CHANGEMENT: Était public, maintenant authentifié**

**Logique de filtrage:**
```
Pour chaque publication:
  1. Récupérer l'ID d'entreprise du viewer (utilisateur connecté)
  2. Vérifier si l'auteur a discreet_mode_enabled = true
  3. Si oui, vérifier si hidden_from_company_id == viewer's company_id
  4. Si match: NE PAS retourner cette publication au viewer
  5. Sinon: Retourner normalement
```

**Champs retournés:**
```json
{
  "id": 1,
  "author_id": 123,
  "content": "...",
  "user_type": "candidate",
  "discreet_mode_enabled": true,
  "hidden_from_company_id": 456,
  ...autres champs...
}
```

---

## 🔐 Logique de Filtrage

### Règles de Masquage

**MASQUÉ SI:**
- Auteur a `discreet_mode_enabled = true` ET
- Auteur a `hidden_from_company_id != null` ET
- Viewer (lecteur) a `company_id = hidden_from_company_id`

**VISIBLE SINON:**
- Aucune condition de masquage ne s'applique
- Visible à tous les autres utilisateurs (autres entreprises, autres candidats, admins)

### Données Masquées

Les éléments suivants sont masqués au viewer concerné:
1. ❌ Publications de l'auteur
2. ❌ Commentaires de l'auteur sur d'autres publications
3. ❌ Likes de l'auteur
4. ❌ Mises à jour de profil (affichées dans le profil lui-même)

**Non masqué:**
- ✅ Profil du candidat reste visible
- ✅ Documents du candidat restent visibles
- ✅ Infos de base (nom, photo) restent visibles

---

## 📊 Données Stockées

### Dans le profil du candidat (`DiscreetModeCard`):
- État d'activation (`discreet_mode_enabled`)
- Entreprise sélectionnée (`company`, `company_id`)
- Message de confirmation avec le nom de l'entreprise

### Dans la base de données:
```json
{
  "user_id": 123,
  "company": "TechCorp Inc.",
  "company_id": 456,
  "discreet_mode_enabled": true,
  "hidden_from_company_id": 456,
  "hidden_from_company_name": "TechCorp Inc."
}
```

---

## 🎨 Interface Utilisateur

### Composant DiscreetModeCard

**États:**

1. **Pas d'entreprise sélectionnée**
   ```
   🔒 Confidentialité de recherche
   Restez invisible auprès de votre employeur actuel
   
   ⚠️ Complétez votre profil professionnel en sélectionnant 
      votre entreprise pour utiliser cette fonctionnalité
   
   [Activer la protection] (désactivé)
   ```

2. **Entreprise sélectionnée, mode désactivé**
   ```
   🔒 Confidentialité de recherche
   Restez invisible auprès de votre employeur actuel
   
   Entreprise sélectionnée:
   TechCorp Inc.
   
   [Activer la protection]
   
   Vous resterez visible pour tous les autres recruteurs
   ```

3. **Mode activé**
   ```
   🔒 Confidentialité de recherche
   Restez invisible auprès de votre employeur actuel
   
   Entreprise sélectionnée:
   TechCorp Inc.
   
   ✓ Vos activités (likes, commentaires, mises à jour) sont 
     masquées pour les recruteurs de TechCorp Inc.
   
   [Désactiver] (vert)
   
   Vos autres activités restent visibles pour tous les 
   autres recruteurs
   ```

---

## 🔄 Flux d'Utilisation

### Activation du Mode

```
1. Candidat visite son fil d'actualité
   ↓
2. Voit le composant DiscreetModeCard dans le sidebar
   ↓
3. Clique sur [Activer la protection]
   ↓
4. API PUT /api/users/me avec:
   - discreet_mode_enabled: true
   - hidden_from_company_id: 456
   - hidden_from_company_name: "TechCorp Inc."
   ↓
5. Toast: "Vos activités sont désormais masquées pour les 
           recruteurs de TechCorp Inc."
   ↓
6. Card passe au statut "Activé" (vert)
```

### Consultation du Fil d'Actualité

```
Candidat A (TechCorp) visite le fil d'actualité
   ↓
Récupération: GET /api/publications
   ↓
Backend vérifie pour chaque publication:
   - Author B a discreet_mode_enabled = true?
   - hidden_from_company_id = 456 (TechCorp)?
   ↓
Si OUI: Publication B est filtrée (non retournée)
Si NON: Publication B est retournée normalement
   ↓
Candidat A ne voit pas les activités de B
Candidat A voit les publications des autres candidats
```

---

## ✅ Checkliste d'Implémentation

Backend:
- [x] Ajouter les colonnes à la table `users`
- [x] Mettre à jour `GET /api/users/me`
- [x] Mettre à jour `PUT /api/users/me`
- [x] Modifier `GET /api/publications` avec filtrage
- [x] Ajouter l'authentification à `GET /api/publications`

Frontend:
- [x] Créer le composant `DiscreetModeCard.tsx`
- [x] Intégrer dans le `Newsfeed.tsx`
- [x] Charger les données du candidat (company, company_id)
- [x] Affichage conditionnel (uniquement pour candidats)
- [x] Gestion des états visuels
- [x] Appels API pour activation/désactivation

---

## 🧪 Tests

### Test 1: Activation du Mode
```bash
# Candidat activ le mode
curl -X PUT http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <token_candidat>" \
  -H "Content-Type: application/json" \
  -d '{
    "discreet_mode_enabled": true,
    "hidden_from_company_id": 456,
    "hidden_from_company_name": "TechCorp"
  }'
```

### Test 2: Vérification du Filtrage
```bash
# Requête depuis un utilisateur de TechCorp
curl -X GET http://localhost:3000/api/publications \
  -H "Authorization: Bearer <token_entreprise_456>"

# Les publications du candidat ne doivent pas apparaître
```

### Test 3: Vérification de la Visibilité pour Autres
```bash
# Requête depuis un utilisateur d'une autre entreprise
curl -X GET http://localhost:3000/api/publications \
  -H "Authorization: Bearer <token_autre_entreprise>"

# Les publications du candidat DOIVENT apparaître
```

---

## 📱 Compatibilité

- ✅ Desktop
- ✅ Tablet
- ✅ Mobile
- ✅ Responsive (carte adapte sa taille au sidebar)

---

## 🚀 Améliorations Futures

1. **Masquage du Profil Complet**
   - Option pour masquer le profil complet (pas juste les activités)

2. **Multiples Entreprises**
   - Support pour masquer activités envers plusieurs entreprises

3. **Notification d'Activation**
   - Email de confirmation quand le mode est activé

4. **Historique**
   - Voir quand le mode a été activé/désactivé

5. **Statistiques Détaillées**
   - Nombre d'activités masquées
   - Nombre de visites masquées du profil

---

## 📞 Support & Maintenance

Pour toute question ou bug:
1. Vérifier les logs du serveur: `backend.log`
2. Vérifier la colonne `discreet_mode_enabled` dans la table `users`
3. Vérifier l'authentification sur `GET /api/publications`
