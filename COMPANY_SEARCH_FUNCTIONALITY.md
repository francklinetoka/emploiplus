# Fonctionnalité de Recherche d'Entreprises - Documentation

## Vue d'ensemble

La section "💼 Profil Professionnel" du profil candidat dispose maintenant d'une **recherche dynamique d'entreprises** fonctionnelle.

## Fonctionnalités

### 1. Recherche Dynamique
- **Endpoint API:** `GET /api/companies/search?q=terme`
- **Authentification requise:** Oui (userAuth)
- **Debounce:** 300ms pour optimiser les requêtes

### 2. Sélection d'Entreprises
L'utilisateur peut:
- **Sélectionner une entreprise enregistrée** depuis la liste de suggestions
  - Affiche un badge de confirmation
  - Stocke l'`company_id` de l'entreprise
- **Saisir manuellement** une entreprise non inscrite
  - Option "Ajouter une entreprise manuelle"
  - Stocke le nom sans `company_id`
  - Affichage d'une alerte indiquant que l'entreprise n'est pas inscrite

### 3. Mode Recherche Discrète
Lorsqu'une entreprise est sélectionnée, l'utilisateur peut utiliser le **Mode Recherche Discrète** pour rester invisible auprès de son employeur actuel.

## Architecture Technique

### Frontend
**Fichier:** `src/components/CompanySearch.tsx`

```tsx
interface CompanySearchProps {
  value: string;                    // Nom de l'entreprise
  companyId: string;                // ID de l'entreprise (vide si saisie manuelle)
  onSelect: (company) => void;      // Callback pour sélection
  onManualEntry: (name) => void;    // Callback pour saisie manuelle
  label?: string;                   // Label personnalisé
  description?: string;             // Description personnalisée
  required?: boolean;               // Champ obligatoire
  disabled?: boolean;               // Désactiver le champ
}
```

**Flux:**
1. Montage du composant → `fetchCompanies('')` initialise la liste
2. Saisie utilisateur → debounce de 300ms → `fetchCompanies(searchInput)`
3. Sélection → `onSelect()` enregistre l'entreprise avec l'ID
4. Saisie manuelle → `onManualEntry()` enregistre le nom sans ID

### Backend
**Endpoint:** `GET /api/companies/search`

**Paramètres:**
- `q` (optional): Terme de recherche

**Réponse:**
```json
[
  {
    "id": 123,
    "name": "Nom Entreprise",
    "company_name": "Nom Entreprise",
    "logo_url": "https://..."
  }
]
```

**Logique:**
1. Récupère tous les utilisateurs avec `user_type = 'company'` et `is_blocked = false`
2. Formate les données avec le nom et le logo
3. Filtre côté serveur si un terme de recherche est spécifié
4. Retourne la liste complète ou filtrée

### Base de Données
Utilise la table `users` avec les colonnes:
- `id` (PRIMARY KEY)
- `company_name` (VARCHAR)
- `full_name` (VARCHAR)
- `email` (VARCHAR)
- `profile_image_url` (VARCHAR)
- `user_type` (VARCHAR) → doit être 'company'
- `is_blocked` (BOOLEAN) → doit être false

## Intégration dans le Profil Candidat

**Fichier:** `src/pages/settings/CandidateProfile.tsx`

Le composant `CompanySearch` est utilisé dans la section "Profil Professionnel":

```tsx
<CompanySearch
  value={company}
  companyId={companyId}
  onSelect={(comp) => {
    setCompany(comp.name);
    setCompanyId(comp.id);
  }}
  onManualEntry={(name) => {
    setCompany(name);
    setCompanyId('');
  }}
  label="Entreprise *"
  description="Sélectionnez votre entreprise actuelle ou saisissez son nom"
  disabled={editingSection !== 'professional'}
/>
```

**Données sauvegardées:**
```json
{
  "company": "Nom de l'entreprise",
  "company_id": "123"  // Vide pour saisie manuelle
}
```

## Affichage du Profil

Quand le profil n'est pas en édition, l'entreprise s'affiche avec:
- Nom de l'entreprise
- Icône externe si l'utilisateur a sélectionné une entreprise enregistrée (company_id présent)

## Points Clés

✅ **Recherche en temps réel** avec debounce  
✅ **Sélection dynamique** parmi les entreprises inscrites  
✅ **Saisie manuelle** pour les entreprises non inscrites  
✅ **Distinction visuelle** entre entreprises sélectionnées et saisies manuelles  
✅ **Intégration Mode Recherche Discrète**  
✅ **Authentication required** pour la sécurité  
✅ **Optimisation** avec endpoint dédié  

## Tests

### Test de Recherche
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/companies/search?q=emploi"
```

### Test de Sélection
1. Aller au profil candidat
2. Éditer la section "Profil Professionnel"
3. Taper "Emploi" dans le champ Entreprise
4. Sélectionner une entreprise de la liste
5. Vérifier que le badge de confirmation s'affiche
6. Sauvegarder le profil
7. Vérifier que l'entreprise est bien enregistrée

## Améliorations Futures

- [ ] Pagination pour les listes longues
- [ ] Tri par pertinence de recherche
- [ ] Affichage des informations complètes de l'entreprise (secteur, taille, etc.)
- [ ] Synchronisation automatique du Mode Recherche Discrète avec l'entreprise sélectionnée
