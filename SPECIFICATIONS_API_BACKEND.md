# Spécifications API Backend - Candidature Spontanée

**Version** : 1.0  
**Date** : 18 janvier 2026

---

## 📋 Vue d'ensemble

L'API backend doit gérer la réception et le traitement des candidatures spontanées.
Deux types de candidatures sont supportés :
- **Type 1** : Candidature avec profil utilisateur (`with_profile`)
- **Type 2** : Candidature manuelle avec fichiers (`manual`)

---

## 🔌 Endpoint Principal

### POST /api/applications/spontaneous

Reçoit une candidature spontanée en FormData.

---

## 📤 Paramètres de Requête

### Exemple Complet (Type Manual)

```bash
curl -X POST http://localhost:3000/api/applications/spontaneous \
  -H "Authorization: Bearer {token}" \
  -F "company_id=123" \
  -F "applicant_name=Jean Dupont" \
  -F "applicant_email=jean@example.com" \
  -F "applicant_phone=+243 xxx xxx xxx" \
  -F "message=Je suis très intéressé par votre entreprise..." \
  -F "type=manual" \
  -F "position=Développeur Full Stack" \
  -F "cv_file=@/path/to/cv.pdf" \
  -F "letter_file=@/path/to/letter.pdf"
```

### Tous les Paramètres

| Paramètre | Type | Obligatoire | Description |
|-----------|------|-------------|-------------|
| `company_id` | string | ✅ Oui | ID de l'entreprise cible |
| `applicant_name` | string | ✅ Oui | Nom complet du candidat |
| `applicant_email` | string | ✅ Oui | Email du candidat |
| `applicant_phone` | string | ❌ Non | Téléphone du candidat |
| `message` | string | ✅ Oui | Message d'introduction/motivation |
| `type` | enum | ✅ Oui | `"with_profile"` ou `"manual"` |
| `position` | string | ❌ Non | Poste recherché |
| `profile_data` | string | ⚠️ Cond. | Données du profil (requis si type=`with_profile`) |
| `cv_file` | File | ⚠️ Cond. | Fichier CV en PDF/DOC (requis si type=`manual`) |
| `letter_file` | File | ⚠️ Cond. | Lettre de motivation en PDF/DOC (requis si type=`manual`) |

---

## 📥 Réponses

### Succès (200 OK)

```json
{
  "success": true,
  "message": "Candidature reçue et enregistrée avec succès",
  "data": {
    "id": "APP-2026-01-18-001",
    "company_id": "123",
    "applicant_email": "jean@example.com",
    "application_type": "manual",
    "status": "pending",
    "created_at": "2026-01-18T10:30:00Z",
    "message": "Je suis très intéressé..."
  }
}
```

### Erreur - Champs Obligatoires Manquants (400)

```json
{
  "success": false,
  "message": "Paramètres obligatoires manquants",
  "errors": {
    "applicant_name": "Le nom est obligatoire",
    "message": "Le message d'introduction est obligatoire"
  }
}
```

### Erreur - Fichier Invalide (400)

```json
{
  "success": false,
  "message": "Fichier invalide",
  "errors": {
    "cv_file": "Format non supporté. PDF ou DOC requis"
  }
}
```

### Erreur - Entreprise Non Trouvée (404)

```json
{
  "success": false,
  "message": "Entreprise non trouvée",
  "error": "L'entreprise avec l'ID 999 n'existe pas"
}
```

### Erreur - Non Authentifié (401)

```json
{
  "success": false,
  "message": "Authentification requise"
}
```

### Erreur - Erreur Serveur (500)

```json
{
  "success": false,
  "message": "Erreur interne du serveur",
  "error": "Détails techniques de l'erreur"
}
```

---

## 🗄️ Structure de Données en Base

### Table: `spontaneous_applications`

```sql
CREATE TABLE spontaneous_applications (
  -- Identité
  id VARCHAR(36) PRIMARY KEY,
  
  -- Références
  company_id VARCHAR(36) NOT NULL,
  applicant_id VARCHAR(36) NULL,  -- Optionnel si candidat non connecté
  
  -- Informations du candidat
  applicant_name VARCHAR(255) NOT NULL,
  applicant_email VARCHAR(255) NOT NULL,
  applicant_phone VARCHAR(20) NULL,
  
  -- Candidature
  application_type ENUM('with_profile', 'manual') NOT NULL,
  message LONGTEXT NOT NULL,
  position VARCHAR(255) NULL,
  status ENUM('pending', 'viewed', 'rejected', 'accepted') DEFAULT 'pending',
  
  -- Fichiers (type manual)
  cv_file_path VARCHAR(500) NULL,
  cv_original_filename VARCHAR(255) NULL,
  letter_file_path VARCHAR(500) NULL,
  letter_original_filename VARCHAR(255) NULL,
  
  -- Profil (type with_profile)
  profile_data_json LONGTEXT NULL,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  viewed_at TIMESTAMP NULL,
  response_at TIMESTAMP NULL,
  response_message LONGTEXT NULL,
  
  -- Contraintes
  FOREIGN KEY (company_id) REFERENCES users(id),
  FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_company_id (company_id),
  INDEX idx_applicant_email (applicant_email),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

---

## 🔒 Validations Requises

### Côté Backend

**1. Validations des Champs**
```typescript
- applicant_name: Non vide, 255 caractères max
- applicant_email: Format email valide
- applicant_phone: Format valide (optionnel)
- message: Non vide, min 10 caractères
- position: 255 caractères max (optionnel)
- company_id: Doit exister en base
```

**2. Validations des Fichiers (Type Manual)**
```typescript
- cv_file: PDF ou DOC/DOCX
- cv_file: Max 5MB
- letter_file: PDF ou DOC/DOCX
- letter_file: Max 5MB
- Scan anti-virus (optionnel mais recommandé)
```

**3. Validations Métier**
```typescript
- L'entreprise doit exister
- Ne pas accepter les candidatures dupliquées (même email + entreprise)
- Limiter le taux de candidatures par IP (rate limiting)
```

---

## 📁 Gestion des Fichiers

### Chemin de Stockage

```
/uploads/applications/{YEAR}/{MONTH}/{company_id}/{application_id}/
  ├── cv_{original_filename}
  └── letter_{original_filename}
```

Exemple :
```
/uploads/applications/2026/01/comp-123/APP-2026-01-18-001/
  ├── cv_Jean_Dupont_CV.pdf
  └── letter_Jean_Dupont_Lettre.pdf
```

### Sécurité

- Valider les noms de fichiers (pas de caractères dangereux)
- Stocker les fichiers en dehors du web root
- Servir les fichiers via un endpoint sécurisé
- Implémenter les permissions d'accès (l'entreprise peut voir ses candidatures)
- Configurer les headers de téléchargement
- Implémenter un scan anti-virus

---

## 📧 Notifications (Optionnel)

### Email à l'Entreprise

**Quand** : Immédiatement après réception

```
Subject: Nouvelle candidature spontanée - {applicant_name}

Contenu :
- Nom du candidat
- Email et téléphone
- Lien vers la candidature dans le dashboard
- Aperçu du message d'introduction
```

### Email au Candidat

**Quand** : Immédiatement après envoi

```
Subject: Candidature reçue par {company_name}

Contenu :
- Confirmation de réception
- Référence de candidature
- Message d'attente
```

---

## 🔍 Endpoints Supplémentaires Recommandés

### GET /api/applications/spontaneous/:id
Récupérer les détails d'une candidature (pour l'entreprise)

```json
{
  "id": "APP-2026-01-18-001",
  "company_id": "123",
  "applicant_name": "Jean Dupont",
  "applicant_email": "jean@example.com",
  "applicant_phone": "+243 xxx xxx xxx",
  "message": "...",
  "type": "manual",
  "status": "pending",
  "cv_url": "/api/applications/spontaneous/APP-2026-01-18-001/cv",
  "letter_url": "/api/applications/spontaneous/APP-2026-01-18-001/letter",
  "created_at": "2026-01-18T10:30:00Z"
}
```

### GET /api/applications/spontaneous?company_id=123
Lister les candidatures pour une entreprise

### PATCH /api/applications/spontaneous/:id
Mettre à jour le statut d'une candidature

```json
{
  "status": "viewed" | "accepted" | "rejected",
  "response_message": "Texte optionnel de réponse"
}
```

### DELETE /api/applications/spontaneous/:id
Supprimer une candidature (optionnel)

---

## 🔐 Authentification et Autorisation

### Authentification
- Utiliser le Bearer token existant
- Token optionnel (permettre les candidatures de non-membres)

### Autorisation
- Entreprise : Accès à ses propres candidatures
- Admin : Accès à toutes les candidatures
- Candidat : Voir ses propres candidatures

---

## ⚡ Performance

### Optimisations Recommandées
- Indexer `company_id` et `created_at`
- Paginer les listes (20-50 candidatures par page)
- Compresser les fichiers lors du stockage
- Implémenter un cache pour les stats

### Logs
- Logger toutes les candidatures reçues
- Logger les erreurs avec contexte
- Tracker les fichiers uploadés

---

## 📊 Exemple d'Implémentation Node.js/Express

```typescript
import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const upload = multer({
  dest: 'uploads/applications/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté'));
    }
  }
});

router.post('/applications/spontaneous', 
  upload.fields([
    { name: 'cv_file', maxCount: 1 },
    { name: 'letter_file', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        company_id,
        applicant_name,
        applicant_email,
        applicant_phone,
        message,
        type,
        position,
        profile_data
      } = req.body;

      // Validations
      if (!applicant_name || !applicant_email || !message) {
        return res.status(400).json({
          success: false,
          message: 'Champs obligatoires manquants'
        });
      }

      if (type === 'manual' && (!req.files?.cv_file || !req.files?.letter_file)) {
        return res.status(400).json({
          success: false,
          message: 'Fichiers obligatoires manquants'
        });
      }

      // Créer l'enregistrement en base de données
      const applicationId = `APP-${Date.now()}-${uuidv4()}`;
      
      // ... Insérer en base de données
      
      res.json({
        success: true,
        message: 'Candidature reçue',
        data: { id: applicationId }
      });
    } catch (error) {
      console.error('Error processing application:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }
);

export default router;
```

---

## 📝 Checklist d'Implémentation Backend

- [ ] Créer la table `spontaneous_applications`
- [ ] Implémenter l'endpoint POST `/api/applications/spontaneous`
- [ ] Ajouter les validations côté serveur
- [ ] Configurer le stockage des fichiers
- [ ] Implémenter la sécurité (authentification, autorisation)
- [ ] Ajouter les logs et monitoring
- [ ] Créer les endpoints GET (détail, liste)
- [ ] Implémenter les notifications email (optionnel)
- [ ] Ajouter les tests unitaires
- [ ] Documenter l'API

---

**Statut** : ✅ Spécifications Complètes  
**Dernière mise à jour** : 18 janvier 2026
