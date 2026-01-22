# 📂 Configuration des Buckets Supabase - Guide Complet

## 🚀 Procédure de Création des Buckets

Tous les buckets doivent être configurés avec **visibilité publique** pour les lectures, mais **privé** pour les uploads (seuls les utilisateurs authentifiés peuvent uploader).

### 1. Accès au Dashboard Supabase

1. Aller à [dashboard.supabase.com](https://dashboard.supabase.com)
2. Sélectionner votre projet **emploi-connect**
3. Menu gauche → **Storage** → **Buckets**

### 2. Créer les Buckets

#### ✅ Bucket 1: `candidats-docs` (Documents Candidats)

```
Nom du bucket: candidats-docs
Visibilité: PUBLIC (pour lire les fichiers)
Description: Documents privés des candidats (CV, Lettre, CNI, Récépissés)
```

**Politique d'accès (RLS):**
```sql
-- Lecture: Propriétaire et admins uniquement
SELECT (auth.uid()::text = owner_id OR current_user_role = 'admin')

-- Écriture: Propriétaire uniquement
INSERT (auth.uid()::text = owner_id)
UPDATE (auth.uid()::text = owner_id)
DELETE (auth.uid()::text = owner_id)
```

**Métadonnées:**
- Format: PDF uniquement
- Taille max: 5 MB
- Organisation: `/ID_USER/nom_du_fichier.pdf`

---

#### ✅ Bucket 2: `entreprises-docs` (Documents Entreprises)

```
Nom du bucket: entreprises-docs
Visibilité: PUBLIC
Description: Documents administratifs et fiscaux (RCCM, Contrat, NUI)
```

**Politique d'accès (RLS):**
```sql
-- Même que candidats-docs
```

**Métadonnées:**
- Format: PDF uniquement
- Taille max: 5 MB
- Organisation: `/ID_USER/nom_du_fichier.pdf`

---

#### ✅ Bucket 3: `feed-posts` (Fil d'Actualité)

```
Nom du bucket: feed-posts
Visibilité: PUBLIC
Description: Images et documents pour le fil d'actualité (réseau social)
```

**Politique d'accès (RLS):**
```sql
-- Lecture: Tous les utilisateurs authentifiés
SELECT auth.role() = 'authenticated'

-- Écriture: Propriétaire uniquement
INSERT (auth.uid()::text = owner_id)
UPDATE (auth.uid()::text = owner_id)
DELETE (auth.uid()::text = owner_id)
```

**Métadonnées:**
- Format: Images (JPEG, PNG, GIF, WebP) + PDF
- Taille max: 5 MB
- Organisation: `/ID_USER/nom_du_fichier`

---

#### ✅ Bucket 4: `entreprises` (Logos)

```
Nom du bucket: entreprises
Visibilité: PUBLIC
Description: Logo officiel des entreprises
```

**Politique d'accès (RLS):**
```sql
-- Lecture: Tous
-- Écriture: Propriétaire uniquement
```

**Métadonnées:**
- Format: Images (JPEG, PNG, SVG, WebP)
- Taille max: 1 MB
- Nom unique par utilisateur: `logo_ID_USER.ext`

---

#### ✅ Bucket 5: `avatars` (Photos de Profil)

```
Nom du bucket: avatars
Visibilité: PUBLIC
Description: Photos de profil des utilisateurs
```

**Politique d'accès (RLS):**
```sql
-- Lecture: Tous
-- Écriture: Propriétaire uniquement
```

**Métadonnées:**
- Format: Images (JPEG, PNG, WebP)
- Taille max: 2 MB
- Nom unique: `ID_USER.jpg`

---

#### ✅ Bucket 6: `assets-emploi` (Bannières)

```
Nom du bucket: assets-emploi
Visibilité: PUBLIC
Description: Bannières et illustrations pour offres/formations
```

**Politique d'accès (RLS):**
```sql
-- Lecture: Tous
-- Écriture: Admins uniquement
```

**Métadonnées:**
- Format: Images (JPEG, PNG, WebP)
- Taille max: 3 MB

---

## ⚙️ Configuration des Politiques RLS (Row Level Security)

### Étapes pour Configurer RLS:

1. **Aller à Storage → Buckets**
2. **Cliquer sur le bucket** (ex: `candidats-docs`)
3. **Onglet "Policies"**
4. **Cliquer "New Policy"**
5. **Sélectionner le type** (SELECT, INSERT, UPDATE, DELETE)
6. **Ajouter la condition** (voir ci-dessus)

### Configuration Simplifiée:

Si vous voulez que ça fonctionne rapidement:

**Pour TOUS les buckets:**

```sql
-- Permettre la lecture à TOUS
-- (À adapter selon votre besoin de sécurité)
SELECT: true

-- Permettre l'écriture aux utilisateurs authentifiés
INSERT: auth.role() = 'authenticated'
UPDATE: auth.role() = 'authenticated'
DELETE: auth.role() = 'authenticated'
```

---

## 🔐 Configuration de Sécurité Recommandée

### Option 1: Sécurité Maximum (Recommandé)

- **Lectures:** Seulement propriétaire et admins
- **Écritures:** Seulement propriétaire
- **Suppression:** Seulement propriétaire ou admins

### Option 2: Sécurité Modérée (Facile)

- **Lectures:** Tous les utilisateurs authentifiés
- **Écritures:** Utilisateur authentifié
- **Suppression:** Propriétaire

### Option 3: Développement (Temporaire)

- **Toutes les opérations:** Utilisateurs authentifiés

---

## 🧪 Vérification des Buckets

Une fois créés, vérifier que:

1. ✅ Les buckets apparaissent dans Storage → Buckets
2. ✅ L'URL publique fonctionne:
   ```
   https://PROJECT_ID.supabase.co/storage/v1/object/public/BUCKET_NAME/test.txt
   ```
3. ✅ Les politiques RLS sont en place

---

## 📋 Commandes SQL pour Vérifier

```sql
-- Vérifier les buckets existants
SELECT name, public FROM storage.buckets;

-- Vérifier les politiques
SELECT * FROM pg_policies WHERE schemaname = 'storage';
```

---

## 🚀 Migration des Fichiers Existants

Si vous avez des fichiers dans `/uploads/` du Mac:

1. **Télécharger les fichiers existants**
   ```bash
   scp -r user@mac_ip:/path/to/uploads ./old_uploads
   ```

2. **Uploader vers Supabase** (via le frontend ou un script)

3. **Mettre à jour les URLs** dans la base de données
   ```sql
   UPDATE user_documents 
   SET storage_url = 'https://project.supabase.co/storage/v1/object/public/candidats-docs/...'
   WHERE storage_url LIKE '/uploads/%';
   ```

---

## ✅ Checklist de Configuration

- [ ] Bucket `candidats-docs` créé
- [ ] Bucket `entreprises-docs` créé
- [ ] Bucket `feed-posts` créé
- [ ] Bucket `entreprises` créé
- [ ] Bucket `avatars` créé
- [ ] Bucket `assets-emploi` créé
- [ ] Tous les buckets sont PUBLIC (lecture)
- [ ] Politiques RLS configurées
- [ ] Test d'upload réussi
- [ ] URLs publiques accessibles

---

## 📝 Notes Importantes

- Assurez-vous que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont dans `.env`
- Les uploads utilisent le **token du navigateur** (anon key)
- Les fichiers sont **immuables** une fois uploadés (pas de mise à jour sur place)
- Pour mettre à jour un fichier, le supprimer puis uploader un nouveau

---

**Statut:** 📋 Prêt à être configuré dans Supabase Dashboard
