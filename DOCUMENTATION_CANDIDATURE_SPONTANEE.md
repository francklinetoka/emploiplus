# Documentation - Module Candidature Spontanée et Profils Entreprises

## 🎯 Objectifs Réalisés

Cette mise à jour implémente les fonctionnalités suivantes pour le module Recrutement :

### 1. Navigation Candidat et Identité Visuelle ✅

#### Sur les Cartes d'Offre d'Emploi (page Jobs)
- **Logo et Nom de l'Entreprise** : Affichés en haut à gauche de chaque carte
- **Éléments Cliquables** : Logo et nom sont cliquables et redirigent vers le profil public de l'entreprise
- **Design** : Identité visuelle claire avec badge "Voir le profil"

**Fichier modifié** : [src/pages/Jobs.tsx](src/pages/Jobs.tsx)

#### Sur le Profil Public de l'Entreprise
- **Badge de Statut de Confiance** : 
  - "Certifié" pour les entreprises vérifiées (avec icône verte)
  - "Non Certifié" pour les entreprises non vérifiées (avec icône grise)
- **Affichage Clair** : Badge affiché à proximité du nom de l'entreprise

**Fichier modifié** : [src/pages/Company.tsx](src/pages/Company.tsx)

---

## 📝 Module de Candidature Spontanée Côté Candidat

### Architecture Générale
L'interface de candidature spontanée utilise une architecture modulaire avec trois composants principaux :

```
SpontaneousApplication (Page principale)
├── ApplicationOptionSelector (Sélection d'option)
├── ApplicationWithProfile (Candidature avec profil)
└── ApplicationManual (Formulaire manuel)
```

### Composants Créés

#### 1. **ApplicationOptionSelector** 
📍 `src/components/recruitment/ApplicationOptionSelector.tsx`

Composant pour sélectionner entre deux méthodes de candidature.

**Props** :
- `onSelectOption: (option: 'profile' | 'manual') => void` - Callback au changement d'option
- `loading?: boolean` - État de chargement (optionnel)

**Fonctionnalités** :
- Affiche deux boutons d'option avec descriptions
- Interface intuitive avec icônes
- États visuels au survol

---

#### 2. **ApplicationWithProfile**
📍 `src/components/recruitment/ApplicationWithProfile.tsx`

Formulaire de candidature utilisant les données du profil utilisateur.

**Props** :
- `companyId: string` - ID de l'entreprise
- `companyName: string` - Nom de l'entreprise
- `onBack: () => void` - Callback pour retour
- `onSuccess?: () => void` - Callback au succès (optionnel)

**Fonctionnalités** :
- Récupère automatiquement les données du profil utilisateur
- Affiche un aperçu des informations envoyées :
  - Nom et email
  - Téléphone (si disponible)
  - Profession
  - Expériences professionnelles
  - Compétences
  - Formations
- Champ obligatoire : **Message d'introduction**
- Validation avant envoi
- Feedback utilisateur avec notifications (toast)

**Données Envoyées** :
```json
{
  "company_id": "xxx",
  "applicant_name": "...",
  "applicant_email": "...",
  "applicant_phone": "...",
  "message": "...",
  "type": "with_profile",
  "profile_data": "..."
}
```

---

#### 3. **ApplicationManual**
📍 `src/components/recruitment/ApplicationManual.tsx`

Formulaire manuel de candidature avec upload de fichiers.

**Props** :
- `companyId: string` - ID de l'entreprise
- `companyName: string` - Nom de l'entreprise
- `onBack: () => void` - Callback pour retour
- `onSuccess?: () => void` - Callback au succès (optionnel)

**Champs du Formulaire** :
1. **Informations Personnelles** (Section 1)
   - Nom complet (obligatoire)
   - Email (obligatoire)
   - Téléphone (optionnel)
   - Poste recherché (optionnel)

2. **Documents** (Section 2)
   - CV (obligatoire) - PDF/DOC max 5MB
   - Lettre de motivation (obligatoire) - PDF/DOC max 5MB
   - Indicateur visuel des fichiers sélectionnés
   - Possibilité de modifier les fichiers

3. **Message d'Introduction** (Section 3)
   - Champ obligatoire pour motivation/présentation
   - Compteur de caractères

**Validations** :
- Formats supportés : PDF, DOC, DOCX
- Taille maximale : 5MB par fichier
- Tous les champs obligatoires vérifiés

**Données Envoyées** :
```json
{
  "company_id": "xxx",
  "applicant_name": "...",
  "applicant_email": "...",
  "applicant_phone": "...",
  "message": "...",
  "type": "manual",
  "position": "...",
  "cv_file": File,
  "letter_file": File
}
```

---

### Hook Custom : useProfileData

📍 `src/hooks/useProfileData.ts`

Hook pour récupérer et structurer les données du profil utilisateur.

**Types Exportés** :
```typescript
interface UserProfile {
  full_name: string;
  email: string;
  phone?: string;
  profession?: string;
  headline?: string;
  bio?: string;
  experiences: Experience[];
  skills: Skill[];
  education: Education[];
}

interface Experience {
  id?: string;
  job_title: string;
  company_name: string;
  start_date: string;
  end_date: string;
  description: string;
  currently_working?: boolean;
}

interface Skill {
  id?: string;
  name: string;
  level?: string;
}

interface Education {
  id?: string;
  school_name: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  description?: string;
}
```

**Fonctions Principales** :
- `useProfileData()` - Hook principal pour récupérer le profil
- `formatProfileForApplication(profile)` - Formater les données en texte lisible

---

## 🔌 Intégration Backend

### Endpoint API
```
POST /api/applications/spontaneous
```

### Paramètres FormData
- `company_id` - ID de l'entreprise
- `applicant_name` - Nom du candidat
- `applicant_email` - Email du candidat
- `applicant_phone` - Téléphone (optionnel)
- `message` - Message d'introduction (obligatoire)
- `type` - Type de candidature : `"with_profile"` ou `"manual"`
- `position` - Poste recherché (optionnel)
- `profile_data` - Données du profil formatées (type profil uniquement)
- `cv_file` - Fichier CV (type manuel uniquement)
- `letter_file` - Fichier lettre (type manuel uniquement)

### Réponses
**Succès (200)** :
```json
{
  "message": "Candidature envoyée avec succès",
  "data": { ... }
}
```

**Erreur (4xx/5xx)** :
```json
{
  "message": "Description de l'erreur"
}
```

---

## 🎨 Design et UX

### Navigation
- Tous les éléments cliquables possèdent des états visuels (hover, focus)
- Retour facile à chaque étape
- Breadcrumb avec contexte

### Validations
- Validation côté client avant envoi
- Messages d'erreur clairs
- Toast notifications pour feedback

### Accessibilité
- Labels HTML correctement associés aux inputs
- Navigation au clavier supportée
- Structure sémantique HTML

---

## 📋 Checklist d'Implémentation

- ✅ Logo et nom de l'entreprise sur les cartes d'offre
- ✅ Éléments cliquables vers le profil de l'entreprise
- ✅ Badge de certification "Certifié" / "Non Certifié"
- ✅ Composant OptionSelector pour choisir la méthode
- ✅ Composant ApplicationWithProfile avec données du profil
- ✅ Composant ApplicationManual avec upload de fichiers
- ✅ Hook useProfileData pour récupérer les données
- ✅ Champ Message d'introduction obligatoire (commun aux deux options)
- ✅ Validations et feedback utilisateur
- ✅ Intégration avec API backend

---

## 🔍 Utilisation

### Sur la Page Jobs
Les cartes d'offre affichent le logo et le nom de l'entreprise en haut à gauche. Au clic, redirection vers le profil public de l'entreprise.

### Sur le Profil de l'Entreprise
1. Clic sur le bouton "Candidature Spontanée"
2. Sélection de la méthode :
   - **Option A** : Candidature avec profil → Formulaire pré-rempli
   - **Option B** : Formulaire manuel → Upload de documents
3. Remplissage obligatoire du message d'introduction
4. Envoi de la candidature

---

## 📁 Structure des Fichiers

```
src/
├── components/
│   └── recruitment/
│       ├── ApplicationOptionSelector.tsx
│       ├── ApplicationWithProfile.tsx
│       ├── ApplicationManual.tsx
│       └── index.ts
├── hooks/
│   └── useProfileData.ts
└── pages/
    ├── Jobs.tsx (modifié)
    ├── Company.tsx (modifié)
    └── SpontaneousApplication.tsx (refactorisé)
```

---

## 🚀 Prochaines Étapes (Optionnel)

1. **Admin Panel** : Gérer les candidatures spontanées reçues
2. **Email Notifications** : Envoyer des emails de confirmation
3. **Analytics** : Suivre les taux de conversion des candidatures
4. **Template Letters** : Suggestions de lettre de motivation
5. **Profile Completion** : Inciter les utilisateurs à compléter leur profil avant candidature

---

**Dernière mise à jour** : 18 janvier 2026
