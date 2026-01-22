# 🔧 SOLUTION: Récupération des données de profil après l'inscription

## Problème Identifié
Après création du compte, les données saisies à l'inscription (prénom, nom, email, téléphone, genre, date de naissance) ne s'affichaient pas dans les paramètres du profil - tous les champs étaient vides.

## Root Cause Analysis

### 1. **Endpoint d'inscription incomplet**
L'ancien endpoint `POST /api/register` ne capturait que:
- `full_name` (combiné)
- `email`
- `password`
- `user_type`
- `company_name` / `company_address` (pour entreprises)
- `phone` (optionnel)
- `country`

**Données perdues:**
- `gender` (genre)
- `birthdate` (date de naissance)
- `nationality` (nationalité)
- `city` (ville)

### 2. **Formulaire d'inscription incomplet**
Le formulaire n'envoie pas les champs `gender` et `birthdate` même s'il les saisissait.

### 3. **Colonnes manquantes en base de données**
Les colonnes `gender`, `birthdate`, `nationality` n'existaient peut-être pas dans la table `users`.

---

## ✅ SOLUTION IMPLÉMENTÉE

### Étape 1: Amélioration Backend (POST /api/register)

**Fichier:** `backend/src/server.ts` (ligne 1597)

Le endpoint a été amélioré pour:

1. ✅ Accepter les nouveaux paramètres:
```typescript
let { 
  email, password, user_type = "candidate", 
  full_name, company_name, company_address, phone, country,
  // NOUVEAUX CHAMPS
  city, gender, birthdate, nationality,
  representative
} = req.body;
```

2. ✅ Sauvegarder dynamiquement selon le type utilisateur:

**Pour les Candidats:**
```typescript
if (user_type === 'candidate') {
  if (phone) { columns.push('phone'); values.push(phone); }
  if (city) { columns.push('city'); values.push(city); }
  if (gender) { columns.push('gender'); values.push(gender); }
  if (birthdate) { columns.push('birthdate'); values.push(birthdate); }
  if (nationality) { columns.push('nationality'); values.push(nationality); }
}
```

3. ✅ Retourner tous les champs:
```typescript
const returnColumns = [
  'id', 'full_name', 'email', 'user_type', 'company_name', 
  'company_address', 'phone', 'country', 'created_at', 
  'city', 'gender', 'birthdate', 'nationality'
].join(', ');
```

---

### Étape 2: Amélioration Frontend (Formulaire d'inscription)

**Fichier:** `src/pages/Register.tsx`

1. ✅ Ajout des champs à l'état du formulaire:
```typescript
const [candidatForm, setCandidatForm] = useState({
  firstName: "",
  lastName: "",
  email: "",
  country: "",
  city: "",
  phone: "",
  gender: "",      // ← NOUVEAU
  birthdate: "",   // ← NOUVEAU
  password: "",
  confirmPassword: "",
});
```

2. ✅ Ajout des éléments de formulaire:
```typescript
{/* Gender and Birthdate */}
<div className="grid gap-4 md:grid-cols-2">
  <div className="space-y-2">
    <Label htmlFor="gender">Genre</Label>
    <Select value={candidatForm.gender} 
            onValueChange={(value) => setCandidatForm({ ...candidatForm, gender: value })}>
      <SelectTrigger>
        <SelectValue placeholder="Sélectionner le genre" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="male">Homme</SelectItem>
        <SelectItem value="female">Femme</SelectItem>
        <SelectItem value="other">Autre</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <div className="space-y-2">
    <Label htmlFor="birthdate">Date de naissance</Label>
    <Input
      id="birthdate"
      type="date"
      value={candidatForm.birthdate}
      onChange={(e) => setCandidatForm({ ...candidatForm, birthdate: e.target.value })}
    />
  </div>
</div>
```

3. ✅ Envoi des nouveaux champs:
```typescript
const metadata: Record<string, unknown> = {
  user_type: "candidate",
  full_name: `${candidatForm.firstName} ${candidatForm.lastName}`.trim(),
  country: candidatForm.country,
};
if (candidatForm.phone) metadata.phone = candidatForm.phone;
if (candidatForm.city) metadata.city = candidatForm.city;
if (candidatForm.gender) metadata.gender = candidatForm.gender;           // ← NOUVEAU
if (candidatForm.birthdate) metadata.birthdate = candidatForm.birthdate;  // ← NOUVEAU
```

---

### Étape 3: Migration Base de Données

**Fichier:** `backend/migrate-add-profile-columns.js`

Vérifier et ajouter les colonnes manquantes:
```sql
ALTER TABLE users ADD COLUMN gender TEXT;          -- male, female, other
ALTER TABLE users ADD COLUMN birthdate DATE;       -- Date de naissance
ALTER TABLE users ADD COLUMN nationality TEXT;     -- Nationalité
```

**À exécuter:** 
```bash
cd backend
node migrate-add-profile-columns.js
```

---

## 📊 FLUX COMPLET DE DONNÉES

```
INSCRIPTION
├─ Frontend: User remplit firstName, lastName, email, phone, gender, birthdate, country, city
├─ Frontend: signUp() envoie POST /api/register { email, password, ...metadata }
│
└─→ Backend: POST /api/register
   ├─ Accepte tous les paramètres
   ├─ Construit la query INSERT dynamiquement
   ├─ Sauvegarde en BD: (full_name, email, password, user_type, phone, city, gender, birthdate, nationality, country)
   ├─ RETOURNE: { success: true, token, user: {...all fields...} }
   │
   └─→ Frontend: Stocke token + user dans localStorage
      └─→ useAuth() met à jour user state
         └─→ Redirection vers paramètres/profil

AFFICHAGE DU PROFIL
├─ CandidateProfile.tsx: useEffect() → fetchProfile()
├─ GET /api/users/me
│  └─→ Backend: Retourne tous les champs du profil
│
└─→ Frontend: 
   ├─ Charge full_name → sépare en firstName + lastName
   ├─ Charge email, phone, city, gender, birthdate
   ├─ Affiche tous les champs dans le formulaire
   └─ ✅ DONNÉES VISIBLES!
```

---

## 🎯 VÉRIFICATION

Pour vérifier que tout fonctionne:

1. **Créer un nouveau compte:**
   ```
   ✅ Prénom: Jean
   ✅ Nom: Dupont
   ✅ Email: jean@example.com
   ✅ Genre: Homme
   ✅ Date: 1990-05-15
   ✅ Téléphone: +242 6 1234567
   ✅ Ville: Brazzaville
   ```

2. **Se connecter:**
   - Aller à `/parametres/profil-candidat`

3. **Vérifier l'affichage:**
   - ✅ Prénom: Jean
   - ✅ Nom: Dupont
   - ✅ Email: jean@example.com
   - ✅ Genre: Homme
   - ✅ Date de naissance: 15/05/1990
   - ✅ Téléphone: +242 6 1234567
   - ✅ Ville: Brazzaville

---

## 📝 FICHIERS MODIFIÉS

| Fichier | Changement |
|---------|-----------|
| `backend/src/server.ts` | ✅ POST /api/register: capture tous les champs |
| `src/pages/Register.tsx` | ✅ Ajout inputs gender + birthdate |
| `backend/migrate-add-profile-columns.js` | ✅ Nouvelle migration |

---

## 🚀 DÉPLOIEMENT

1. **Base de données:** Exécuter la migration
   ```bash
   cd backend
   node migrate-add-profile-columns.js
   ```

2. **Backend:** Redéployer avec les modifications de `server.ts`

3. **Frontend:** Redéployer avec les modifications de `Register.tsx`

4. **Tester:** Créer un nouveau compte et vérifier les paramètres

---

## ✨ RÉSULTAT

Avant:
```
❌ Tous les champs vides dans les paramètres
❌ Données saisies perdues après inscription
```

Après:
```
✅ Tous les champs remplis automatiquement
✅ Les données sont persistées et affichées
✅ L'utilisateur peut continuer à les éditer
```
