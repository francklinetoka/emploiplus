# Filtre de Contenu et Modération Automatique pour Emploi+

## 📋 Vue d'ensemble

Le système de filtre de contenu et modération automatique maintient une communauté professionnelle, respectueuse et sûre sur Emploi+ en empêchant la publication de contenu contenant des mots ou expressions interdits (insultes, grossièretés, discours de haine, harcèlement, etc.).

## 📁 Structure des fichiers

### Frontend
```
src/
├── constants/
│   └── bannedWords.ts          # Liste des mots interdits (300+ termes)
├── hooks/
│   └── useProfanityFilter.ts    # Hook personnalisé avec gestion des récidives
├── components/
│   ├── ui/
│   │   └── ProfanityWarningModal.tsx  # Modale d'avertissement
│   └── CommentsSection.tsx      # Composant réutilisable pour commentaires
└── pages/
    ├── Newsfeed.tsx             # Intégration dans création de posts
    └── MyPublications.tsx        # Intégration dans édition de publications
```

### Backend
```
backend/src/
└── middleware/
    └── contentFilter.ts         # Middleware de filtrage côté serveur
```

## 🚀 Utilisation

### 1. **Créer un Post (Newsfeed)**

Le filtre est automatiquement appliqué lors du clic sur "Publier" :

```tsx
// src/pages/Newsfeed.tsx
const handleCreatePost = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Vérification du filtre de profanité
  const filterResult = filterContent(newPost);
  if (filterResult.isBlocked) {
    // Modale d'avertissement s'affiche
    setProfanityWarningOpen(true);
    return;
  }
  
  // Continuer avec la création...
};
```

### 2. **Éditer une Publication (MyPublications)**

Même logique que la création :

```tsx
const handleSaveEdit = async (publicationId: number) => {
  const filterResult = filterContent(editContent);
  if (filterResult.isBlocked) {
    setProfanityWarningOpen(true);
    return;
  }
  
  // Continuer avec la sauvegarde...
};
```

### 3. **Ajouter un Commentaire (CommentsSection)**

```tsx
import { CommentsSection } from '@/components/CommentsSection';

// Dans le composant de publication :
<CommentsSection
  publicationId={publication.id}
  comments={publication.comments}
  onCommentAdded={(comment) => console.log('Nouveau commentaire:', comment)}
  onCommentDeleted={(commentId) => console.log('Supprimé:', commentId)}
/>
```

## ⚙️ Configuration du Hook `useProfanityFilter`

```tsx
import { useProfanityFilter } from '@/hooks/useProfanityFilter';

const MyComponent = () => {
  const {
    filterContent,           // Fonction pour filtrer
    warningCount,           // Nombre d'avertissements (0-3)
    isTemporarilySuspended, // Utilisateur temporairement suspendu
    resetWarnings,          // Réinitialiser les avertissements (admin)
    getRemainingLiftTime,   // Temps restant avant levée de suspension
  } = useProfanityFilter();

  // Utiliser dans un formulaire
  const result = filterContent(userText);
  // result = {
  //   isBlocked: boolean,
  //   triggeredWords: string[],
  //   warningCount: number,
  //   isTemporarilySuspended: boolean
  // }
};
```

## 🔍 Comment fonctionne la détection

### Normalisation du texte
- Conversion en minuscules
- Suppression des accents (é → e, à → a, etc.)
- Remplacement des caractères spéciaux par des espaces
- Gestion des variantes : "m e r d e", "merde!", "MERDE" → détectés

### Détection
- Recherche de substring (un mot banni peut être contenu dans un mot plus long)
- Cas insensitif
- Gestion des accents

### Exemple
```
"Salut j'aime cette m e r d e de code!" 
→ Détecte "merde" même avec espaces
→ Affiche modale d'avertissement
```

## ⚠️ Gestion des Récidives

### Stockage Local (localStorage)
```
{
  "profanity_warnings": [
    { timestamp: 1234567890, triggeredWords: ["merde"] },
    { timestamp: 1234567900, triggeredWords: ["connard"] },
    { timestamp: 1234567910, triggeredWords: ["putain"] }
  ],
  "profanity_suspension": {
    timestamp: 1234567920,
    reason: "Multiple profanity violations"
  }
}
```

### Seuils
- **0-2 avertissements** : Affichage de la modale, sans suspension
- **3 avertissements** : Suspension temporaire de 1 heure
- **> 24h sans violation** : Réinitialisation automatique du compteur

### Suspension
- Bloque la création de posts
- Bloque les commentaires
- Affiche un message avec temps restant
- Notification envoyée aux admins (optionnel)

## 🎨 Modale d'Avertissement

### États

**État Normal (< 3 avertissements)**
```
┌─────────────────────────────────────┐
│ ⚠️ Contenu non autorisé détecté      │
├─────────────────────────────────────┤
│ Message explicatif                   │
│ Termes détectés : [merde] [connard]  │
│ Avertissements : 1/3                 │
├─────────────────────────────────────┤
│ [Annuler]           [Modifier]       │
└─────────────────────────────────────┘
```

**État Suspendu (3+ avertissements)**
```
┌──────────────────────────────────────┐
│ ⚠️ Contenu non autorisé détecté       │
├──────────────────────────────────────┤
│ 🚫 Compte temporairement suspendu     │
│ Reprendre dans : 45 minutes           │
├──────────────────────────────────────┤
│ [Annuler]                            │
└──────────────────────────────────────┘
```

## 🔒 Filtrage Backend (Sécurité)

### Intégration dans les Routes

```typescript
// backend/src/server.ts
import { contentFilterMiddleware, profanityViolationLogger } from './middleware/contentFilter.js';

// Appliquer le middleware aux routes de publications
app.post('/api/publications', userAuth, contentFilterMiddleware, handleCreatePublication);
app.put('/api/publications/:id', userAuth, contentFilterMiddleware, handleUpdatePublication);
app.post('/api/publications/:id/comments', userAuth, contentFilterMiddleware, handleAddComment);
```

### Réponse d'erreur
```json
{
  "success": false,
  "error": "Contenu non autorisé détecté",
  "message": "En raison du respect des règles de notre communauté professionnelle...",
  "triggeredWords": ["merde", "connard"],
  "code": "BANNED_CONTENT"
}
```

## 📊 Liste des Mots Interdits

### Catégories
- **Grossièretés courantes** (français & anglais)
- **Discriminations** (raciales, religieuses, sexuelles)
- **Harcèlement & Menaces**
- **Contenu adulte/explicite**
- **Maltraitance animale**
- **Promotion de drogues**
- Et plus...

**Total : 300+ termes clés**

### Extension de la liste
Pour ajouter des mots :

```typescript
// src/constants/bannedWords.ts
export const BANNED_WORDS = [
  // ... mots existants
  "nouveau_mot_interdit",
  "autre_terme_offensant",
];
```

## 🛠️ Maintenance et Administration

### Réinitialiser les Avertissements (Admin)

```tsx
import { useProfanityFilter } from '@/hooks/useProfanityFilter';

const AdminPanel = () => {
  const { resetWarnings } = useProfanityFilter();
  
  const handleResetUserWarnings = () => {
    resetWarnings();
    toast.success("Avertissements réinitialisés");
  };
  
  return <button onClick={handleResetUserWarnings}>Réinitialiser</button>;
};
```

### Logs des Violations

Consultez la console du serveur :
```
[CONTENT FILTER] Banned words detected by user 42:
[ 'merde', 'connard' ] in content: "C'est quoi cette merde de..."

[VIOLATION LOGGED] User 42 attempted to post banned content at 2025-01-17T10:30:45Z
```

## 📈 Métriques à Suivre

- Nombre de tentatives d'envoi de contenu banni par jour
- Utilisateurs les plus souvent avertis
- Mots les plus fréquemment détectés
- Taux d'utilisateurs suspendus
- Impact sur l'engagement de la communauté

## ✅ Checklist de Déploiement

- [x] Créer `bannedWords.ts` avec liste complète
- [x] Créer hook `useProfanityFilter`
- [x] Créer modale d'avertissement responsive
- [x] Intégrer dans Newsfeed (création de posts)
- [x] Intégrer dans MyPublications (édition)
- [x] Créer composant CommentsSection réutilisable
- [x] Ajouter middleware backend pour double sécurité
- [ ] Tester en local
- [ ] Déployer sur serveur
- [ ] Monitorer les logs
- [ ] Ajuster la liste selon les retours utilisateurs

## 🧪 Tests à Effectuer

### Client
```
✓ Post avec mots interdits → modale d'avertissement
✓ Clic "Annuler" → efface le champ
✓ Clic "Modifier" → garde le texte pour édition
✓ 3 violations → suspension + bouton grisé
✓ Texte avec espaces/symboles → détection
✓ Accents différents → normalisation correcte
```

### Serveur
```
✓ Contournement du client → bloqué par middleware
✓ Logs d'erreur corrects
✓ Réponse JSON valide
✓ Autorisation pour utilisateurs connectés
```

## 🚨 Limitations Connues

1. **False Positives** : Certains mots peuvent être légitimes (ex: "nègre" en histoire)
2. **Évolution** : Nouveaux termes peuvent émerger rapidement
3. **Contexte** : Impossible de détecter le contexte (ironie, citation)
4. **Multilingue** : Actuellement français + anglais

## 🔮 Améliorations Futures

- [ ] Machine Learning pour améliorer la détection
- [ ] Contexte utilisant NLP (Natural Language Processing)
- [ ] Modération manuelle des cas limites
- [ ] Panel d'administration pour gérer la liste
- [ ] Notifications en temps réel aux modérateurs
- [ ] Historique des violations par utilisateur
- [ ] Système de points (plutôt que suspension binaire)
- [ ] Support multilingue avancé

## 📚 Ressources

- [OWASP Content Security](https://owasp.org/)
- [React Hook Best Practices](https://react.dev/reference/react/hooks)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express Middleware](https://expressjs.com/guide/using-middleware.html)

## 📞 Support

Pour toute question ou suggestion d'amélioration, veuillez contacter l'équipe de développement.

---

**Version** : 1.0  
**Dernière mise à jour** : 17 janvier 2026
