# 🚀 GUIDE DE MIGRATION - Stockage Local → Supabase Storage

## 📋 Vue d'ensemble de la Migration

Cette migration remplace le système de stockage local (Mac `/uploads/`) par **Supabase Storage**. Tous les fichiers seront maintenant stockés dans le cloud avec une sécurité et une scalabilité améliorées.

### Avantages:
✅ Aucun stockage sur le Mac  
✅ Stockage illimité dans le cloud  
✅ Meilleure performance (CDN)  
✅ Gestion de la sécurité simplifiée  
✅ Sauvegarde automatique  

---

## 📂 Nouvelles Buckets Supabase

| Bucket | Usage | Format | Max |
|--------|-------|--------|-----|
| `candidats-docs` | Documents candidats (CV, CNI, etc.) | PDF | 5 MB |
| `entreprises-docs` | Documents entreprises (RCCM, etc.) | PDF | 5 MB |
| `feed-posts` | Posts du fil d'actualité | Images + PDF | 5 MB |
| `entreprises` | Logos entreprises | Images | 1 MB |
| `avatars` | Photos de profil | Images | 2 MB |
| `assets-emploi` | Bannières d'offres/formations | Images | 3 MB |

---

## 🔧 Étapes de Migration (OBLIGATOIRES)

### Étape 1: Créer les Buckets Supabase

1. Aller à [dashboard.supabase.com](https://dashboard.supabase.com)
2. Sélectionner votre projet
3. Menu **Storage** → **Buckets**
4. Créer les 6 buckets avec les noms ci-dessus
5. Configurer les politiques RLS (voir [SUPABASE_BUCKETS_SETUP.md](./SUPABASE_BUCKETS_SETUP.md))

✅ **Vérification:** Les buckets doivent être accessibles (status PUBLIC)

---

### Étape 2: Vérifier les Credentials Supabase

Dans `.env.production` et `.env.local`:

```env
VITE_SUPABASE_URL=https://PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ **Vérification:** Les variables sont définies et valides

---

### Étape 3: Mettre à Jour le Frontend

#### ✅ Fichiers Modifiés:

1. **src/lib/supabaseStorage.ts** (NOUVEAU)
   - Service centralisé pour uploads Supabase
   - Validation MIME et taille
   - Gestion des 6 buckets

2. **src/lib/upload.ts** (MODIFIÉ)
   - Ré-exporte les fonctions de supabaseStorage
   - `uploadFile()` redirige vers Supabase
   - Maintient la compatibilité avec l'ancien code

3. **Backend** (MODIFIÉ)
   - `/api/upload` retourne 410 Gone (deprecated)
   - Plus de sauvegarde locale

---

### Étape 4: Remplacer les Références aux Fichiers

#### Avant (Local):
```typescript
// URL locale
storage_url: '/uploads/documents/file.pdf'

// Affichage
<img src={storage_url} />
```

#### Après (Supabase):
```typescript
// URL Supabase publique
storage_url: 'https://project.supabase.co/storage/v1/object/public/candidats-docs/USER_ID/file.pdf'

// Affichage (identique)
<img src={storage_url} />
```

---

## 💻 Exemples de Code

### Upload Avatar

```typescript
import { uploadAvatar } from '@/lib/upload';

// Dans un composant
const handleAvatarUpload = async (file: File) => {
  try {
    const userId = user.id;
    const url = await uploadAvatar(file, userId);
    // L'URL est maintenant une URL Supabase publique
    updateProfileImage(url);
  } catch (error) {
    toast.error(error.message);
  }
};
```

### Upload Document Candidat

```typescript
import { uploadCandidateDocument } from '@/lib/upload';

const handleDocumentUpload = async (file: File) => {
  try {
    const url = await uploadCandidateDocument(file, userId, 'cv');
    // Sauvegarder l'URL dans la base de données
    await saveCandidateDocument({ doc_type: 'cv', storage_url: url });
  } catch (error) {
    toast.error(error.message);
  }
};
```

### Upload Post Fil d'Actualité

```typescript
import { uploadFeedPost } from '@/lib/upload';

const handlePostImageUpload = async (file: File) => {
  try {
    const url = await uploadFeedPost(file, userId);
    // Utiliser l'URL dans le post
    createPublication({ image_url: url, content: '...' });
  } catch (error) {
    toast.error(error.message);
  }
};
```

---

## 📊 Mappage des Chemins

### Documents Candidats
```
Ancien: /uploads/documents/cv_john.pdf
Nouveau: https://project.supabase.co/storage/v1/object/public/candidats-docs/123/cv_john.pdf
```

### Photos de Profil
```
Ancien: /uploads/profiles/user_123.jpg
Nouveau: https://project.supabase.co/storage/v1/object/public/avatars/123/123.jpg
```

### Posts Fil d'Actualité
```
Ancien: /uploads/services/image_post.jpg
Nouveau: https://project.supabase.co/storage/v1/object/public/feed-posts/123/image_post.jpg
```

---

## 🔄 Migration des Fichiers Existants

### Option 1: Script de Migration (Recommandé)

```bash
# Créer un script de migration
node scripts/migrate-storage.js
```

### Option 2: Upload Manuel via Dashboard Supabase

1. Aller à Storage → Bucket
2. Cliquer "Upload"
3. Sélectionner les fichiers
4. Copier les URLs publiques
5. Mettre à jour la base de données

### Option 3: Programme de Nettoyage

```bash
# Supprimer les anciens fichiers locaux
rm -rf backend/uploads/
```

---

## ✅ Checklist de Vérification

### Avant de Déployer:

- [ ] Les 6 buckets Supabase créés
- [ ] Credentials Supabase dans `.env`
- [ ] Fichiers supabaseStorage.ts créés
- [ ] upload.ts mis à jour
- [ ] Backend `/api/upload` déprécié
- [ ] Tests d'upload locaux réussis
- [ ] Références `/uploads/` remplacées par URLs Supabase

### Après le Déploiement:

- [ ] Tests sur production
- [ ] Uploads fonctionnent correctement
- [ ] Images s'affichent avec les URLs Supabase
- [ ] Pas d'erreurs 404 sur les anciens `/uploads/`
- [ ] Ancien dossier `/uploads/` du Mac peut être supprimé

---

## 🐛 Dépannage

### Erreur: "Missing Supabase credentials"

**Solution:** Vérifier que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont définis dans `.env`

### Erreur: "Bucket not found"

**Solution:** Créer le bucket dans Supabase Dashboard → Storage

### Erreur: "Upload failed: File type not allowed"

**Solution:** Vérifier que le type MIME correspond à `allowedMimeTypes` du bucket

### Erreur: "413 Payload Too Large"

**Solution:** Le fichier dépasse la limite de taille max du bucket. Utiliser une version compressée.

---

## 📝 Notes Importantes

1. **URLs Publiques:** Les URLs des buckets sont publiques (lisibles par tous), mais les uploads sont sécurisés par RLS
2. **Aucun Stockage Local:** Plus de fichiers sur le Mac
3. **Compatibilité:** L'ancien code utilisant `uploadFile()` continue de fonctionner
4. **Compression:** Les images sont compressées automatiquement avant upload
5. **Nommage:** Les PDFs gardent leur nom original, les images sont renommées avec timestamp

---

## 🚀 Résultat Attendu

Après la migration:

✅ Tous les uploads vont vers Supabase  
✅ Les URLs sont en format `https://project.supabase.co/storage/v1/object/public/...`  
✅ Aucun fichier ne reste sur le Mac  
✅ Les images s'affichent normalement  
✅ Aucune modification requise dans les templates (les URLs sont les mêmes)

---

**Statut:** 🟢 Prêt à être implémenté
