# Guide Rapide - Candidature Spontanée

## 🎯 Vue d'Ensemble

Le module de candidature spontanée permet aux candidats de postuler directement auprès des entreprises avec deux méthodes :
1. **Candidature Rapide** : Utilise les données du profil utilisateur
2. **Candidature Personnalisée** : Upload de documents CV + lettre

---

## 🚀 Étapes Utilisateur

### Étape 1 : Accéder à la Candidature Spontanée
1. Naviguer vers une page d'entreprise
2. Cliquer sur le bouton orange **"Candidature Spontanée"**

### Étape 2 : Choisir une Méthode

#### 📄 Option A : Postuler avec mon profil Emploi+
✨ **Avantages** :
- Pré-remplissage automatique
- Basé sur vos données de profil
- Rapide et efficace

**Ce qui sera envoyé** :
- Vos informations personnelles
- Vos expériences professionnelles
- Vos compétences
- Vos formations
- Votre message de motivation

#### ✏️ Option B : Formulaire Manuel
✨ **Avantages** :
- Personnalisation complète
- Upload de documents
- Plus de contrôle

**Ce qui sera envoyé** :
- Vos informations personnelles
- Votre CV (PDF/DOC)
- Votre lettre de motivation (PDF/DOC)
- Votre message de motivation

### Étape 3 : Remplir le Formulaire

#### Pour Option A :
1. ✅ Vérifier l'aperçu de votre profil
2. 📝 Saisir un **Message d'Introduction** (obligatoire)
3. 🚀 Cliquer sur **"Envoyer ma candidature"**

#### Pour Option B :
1. 📋 Remplir les informations personnelles
2. 📎 Télécharger votre CV (obligatoire)
3. 📄 Télécharger votre lettre de motivation (obligatoire)
4. 📝 Saisir un **Message d'Introduction** (obligatoire)
5. 🚀 Cliquer sur **"Envoyer ma candidature"**

---

## ⚙️ Configuration Requise

### Pour les Candidats

#### Option A (Profil)
- Profil utilisateur complété avec :
  - Nom et email
  - Au moins une expérience professionnelle (idéal)
  - Compétences (idéal)
  - Formations (idéal)

#### Option B (Manuel)
- Fichiers CV et lettre de motivation en PDF ou DOC
- Taille maximale : 5MB par fichier

### Pour les Développeurs

#### Installation
```bash
# Aucune installation supplémentaire requise
# Utilisez les composants directement
```

#### Imports
```typescript
import { ApplicationOptionSelector } from '@/components/recruitment';
import { ApplicationWithProfile } from '@/components/recruitment';
import { ApplicationManual } from '@/components/recruitment';
import { useProfileData } from '@/hooks/useProfileData';
```

---

## 🔧 Personnalisation

### Modifier les Messages
Éditez les fichiers des composants :
- `ApplicationOptionSelector.tsx` - Textes des options
- `ApplicationWithProfile.tsx` - Textes du formulaire profil
- `ApplicationManual.tsx` - Textes du formulaire manuel

### Ajouter des Champs
1. Modifiez le composant concerné
2. Ajoutez les nouveaux champs au FormData envoyé à l'API
3. Mettez à jour le backend pour traiter les nouveaux champs

### Modifier les Styles
Utilisez les classes Tailwind CSS existantes ou créez des variantes personnalisées.

---

## ✅ Checklists

### Avant de Déployer
- [ ] Endpoint API `/api/applications/spontaneous` fonctionne
- [ ] Upload de fichiers configuré sur le serveur
- [ ] Permissions CORS correctes
- [ ] Base de données pour stocker les candidatures

### Pour les Candidats
- [ ] Profil complété (pour Option A)
- [ ] Documents CV et lettre prêts (pour Option B)
- [ ] Message de motivation préparé

---

## 🐛 Dépannage

### Message : "Profil utilisateur non chargé"
**Cause** : Le hook useProfileData n'arrive pas à récupérer les données
**Solution** :
1. Vérifier la connexion utilisateur
2. Vérifier que les données de profil existent dans la base de données
3. Vérifier les logs du navigateur (Console)

### Message : "Format non supporté"
**Cause** : Le fichier n'est pas en PDF ou DOC
**Solution** : Convertissez votre fichier en PDF ou DOC et réessayez

### Message : "Fichier trop volumineux"
**Cause** : Le fichier dépasse 5MB
**Solution** : Réduisez la taille du fichier

### Candidature non reçue
**Cause** : Problème API backend
**Solutions** :
1. Vérifier que l'endpoint API existe
2. Vérifier les logs du serveur
3. Vérifier les permissions d'accès à l'API
4. Vérifier la base de données

---

## 📊 Statistiques et Monitoring

### Données Enregistrées
- ID de la candidature
- ID de l'entreprise
- Informations du candidat
- Type de candidature (profil/manuel)
- Date et heure d'envoi
- Statut (en attente/lue/réponse)

### Points de Suivi
- Nombre de candidatures par entreprise
- Taux de conversion profil vs manuel
- Temps moyen de traitement
- Taux d'acceptation

---

## 📞 Support

Pour des questions ou problèmes, consultez :
- `DOCUMENTATION_CANDIDATURE_SPONTANEE.md` - Documentation technique
- Code source des composants avec commentaires
- Tests unitaires (si disponibles)

---

**Mis à jour** : 18 janvier 2026
