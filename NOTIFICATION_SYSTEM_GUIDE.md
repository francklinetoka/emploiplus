# Système de Notifications - Guide Complet

## Vue d'ensemble

Le système de notifications d'Emploi+ permet aux utilisateurs de recevoir des alertes en temps réel lorsqu'un autre utilisateur aime ou commente leur publication.

## Architecture

### Base de Données

#### Table: `notifications`
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,           -- Destinataire
  sender_id INTEGER,                  -- Expéditeur
  sender_name TEXT,                   -- Nom du sender (dénormalisé)
  sender_profile_image TEXT,          -- Avatar du sender
  type TEXT DEFAULT 'message',        -- 'like', 'comment', 'interview', 'message', 'application'
  content TEXT,                       -- Contenu du message
  message TEXT,                       -- Message (héritage)
  publication_id INTEGER,             -- Référence à la publication (pour likes/comments)
  job_id INTEGER,                     -- Référence au job (pour interview/application)
  read BOOLEAN DEFAULT false,         -- Statut de lecture
  created_at TIMESTAMP DEFAULT NOW()  -- Timestamp
)
```

**Indexes:**
- `idx_notifications_user_id` - Recherche rapide par utilisateur
- `idx_notifications_created_at` - Tri par date récente

### Types de Notifications

1. **Like** (`type: 'like'`)
   - Déclenché quand un utilisateur aime une publication
   - Contenu: `"{SenderName} a aimé votre publication"`
   - `publication_id` rempli

2. **Comment** (`type: 'comment'`)
   - Déclenché quand un utilisateur commente une publication
   - Contenu: `"{SenderName} a commenté: {excerpt}"`
   - `publication_id` rempli

3. **Interview** (`type: 'interview'`)
   - Déclenché par une entreprise pour une interview
   - `job_id` rempli
   - Utilisé pour redirection vers la page entreprise

4. **Message** (`type: 'message'`)
   - Messages directs entre utilisateurs
   - Contenu libre

5. **Application** (`type: 'application'`)
   - Candidature à un job
   - `job_id` rempli

## API Endpoints

### GET /api/notifications
Récupère toutes les notifications de l'utilisateur authentifié.

**Headers:**
```
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": 1,
      "user_id": 5,
      "sender_id": 3,
      "sender_name": "Jean Dupont",
      "sender_profile_image": "https://...",
      "type": "like",
      "content": "Jean Dupont a aimé votre publication",
      "publication_id": 42,
      "job_id": null,
      "read": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /api/notifications
Crée une notification (usage interne).

**Body:**
```json
{
  "user_id": 5,
  "sender_id": 3,
  "sender_name": "Jean Dupont",
  "sender_profile_image": "https://...",
  "type": "like",
  "content": "Jean Dupont a aimé votre publication",
  "publication_id": 42,
  "job_id": null
}
```

### PUT /api/notifications/:id/read
Marque une notification comme lue.

**Headers:**
```
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "success": true
}
```

### DELETE /api/notifications/:id
Supprime une notification.

**Headers:**
```
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "success": true
}
```

## Frontend Components

### NotificationDropdown
Composant cloche dans le header affichant les notifications.

**Localisation:** `/src/components/NotificationDropdown.tsx`

**Fonctionnalités:**
- Badge de compteur (nombre de notifications non lues)
- Dropdown avec liste déroulante
- Affichage de l'avatar et du nom du sender
- Boutons "Marquer comme lu" et "Supprimer"
- Redirection intelligente selon le type
- Auto-refresh toutes les 30 secondes

**Props:** Aucun (utilise le hook interne `useNotifications`)

**Exemple:**
```tsx
import NotificationDropdown from '@/components/NotificationDropdown';

// Dans le Header
<NotificationDropdown />
```

### CommentsSection
Composant réutilisable pour afficher/gérer les commentaires avec filtre de contenu.

**Localisation:** `/src/components/CommentsSection.tsx`

**Props:**
```tsx
interface CommentsSectionProps {
  publicationId: number;
  comments: Comment[];
  onCommentAdded: (comment: Comment) => void;
  onCommentDeleted: (commentId: number) => void;
}
```

**Fonctionnalités:**
- Toggle visibilité des commentaires
- Formulaire d'ajout avec filtre de profanité
- Suppression des commentaires (propriétaire)
- Avatar et timestamp
- Modal d'avertissement si contenu bloqué

### NotificationPanel
Composant pour afficher une liste de notifications (utilisable indépendamment).

**Localisation:** `/src/components/NotificationPanel.tsx`

**Props:**
```tsx
interface NotificationPanelProps {
  notifications: Notification[];
  loading?: boolean;
  onDelete?: (id: number) => void;
  onRead?: (id: number) => void;
}
```

## Hooks

### useNotifications
Hook pour gérer les notifications.

**Localisation:** `/src/hooks/useNotifications.ts`

**Interface:**
```tsx
interface UseNotificationsReturn {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  createNotification: (data: any) => Promise<void>;
}
```

**Exemple d'utilisation:**
```tsx
import { useNotifications } from '@/hooks/useNotifications';

const MyComponent = () => {
  const { notifications, loading, deleteNotification } = useNotifications();
  
  return (
    <div>
      {notifications.map(notif => (
        <div key={notif.id}>
          {notif.sender_name}: {notif.content}
          <button onClick={() => deleteNotification(notif.id)}>Supprimer</button>
        </div>
      ))}
    </div>
  );
};
```

## Flux de Données

### Quand un utilisateur aime une publication:

```
1. Frontend: handleLike() appelé
   ↓
2. POST /api/publications/:id/like
   ↓
3. Backend: Incrémente likes_count
   ↓
4. Backend: Crée notification pour l'auteur
   ↓
5. Frontend: useNotifications recharge les notifications (30s)
   ↓
6. NotificationDropdown: Affiche la nouvelle notification
```

### Quand un utilisateur commente:

```
1. Frontend: form submission
   ↓
2. POST /api/publications/:id/comments
   ↓
3. Backend: Ajoute le commentaire
   ↓
4. Backend: Crée notification pour l'auteur
   ↓
5. Frontend: CommentsSection affichée + notification créée
   ↓
6. useNotifications: Recharge les notifications
```

## Configuration

### Auto-refresh
Les notifications se rechargent automatiquement toutes les **30 secondes** via `setInterval` dans `useNotifications.ts`.

Pour modifier cet intervalle:
```tsx
// Dans useNotifications.ts, ligne ~50
const interval = setInterval(fetchNotifications, 30000); // Changer 30000 à votre valeur
```

### Styling
- Avatar circulaire: 10x10 (h-10 w-10)
- Notifications non lues: fond bleu clair (`bg-blue-50`)
- Notifications lues: fond blanc
- Bouton supprimer: rouge (`hover:bg-red-50`)
- Bouton "marquer comme lu": vert (`hover:bg-green-50`)

## Intégration avec le Profanity Filter

Les notifications sont **automatiquement créées** après que le contenu ait passé le filtre de profanité:

1. `CommentsSection` bloque le contenu si profanité détectée
2. Si validation réussie, commentaire créé
3. Notification générée pour l'auteur

## Tests

### Tester localement:

1. **Démarrer les serveurs:**
   ```bash
   # Terminal 1 - Frontend
   npm run dev
   
   # Terminal 2 - Backend
   cd backend && npm run dev
   ```

2. **Tester un like:**
   - Connectez-vous comme utilisateur A
   - Publiez une publication
   - Connectez-vous comme utilisateur B (autre navigateur/fenêtre)
   - Likez la publication de l'utilisateur A
   - Reconnectez-vous comme A
   - Vous devriez voir une notification: "Utilisateur B a aimé votre publication"

3. **Tester un commentaire:**
   - Même processus mais cliquez sur "Commenter"
   - Ajoutez un commentaire
   - La notification affichera le début du texte du commentaire

4. **Tester la suppression:**
   - Cliquez sur l'icône poubelle dans la notification
   - La notification disparaît

5. **Tester "Marquer comme lu":**
   - Cliquez sur la coche verte
   - Le fond bleu devient blanc
   - La notification reste visible

## Troubleshooting

### Les notifications ne s'affichent pas:

1. Vérifiez que la table `notifications` existe:
   ```sql
   SELECT * FROM notifications;
   ```

2. Vérifiez que l'utilisateur authentifié reçoit bien ses notifications:
   ```sql
   SELECT * FROM notifications WHERE user_id = 5; -- Votre ID
   ```

3. Vérifiez les logs du backend pour les erreurs de création de notification

### Les notifications s'affichent mais pas en temps réel:

- C'est normal! Le système utilise un polling de 30 secondes
- Pour un système en temps réel, implémenter WebSocket ou Server-Sent Events (SSE)

### L'avatar du sender ne s'affiche pas:

- Vérifiez que `sender_profile_image` n'est pas null dans la BD
- Vérifiez que l'URL de l'image est accessible

## Améliorations Futures

1. **WebSocket:** Notifications en temps réel au lieu de polling
2. **Grouping:** Regrouper les likes multiples ("Vous et 5 autres ont aimé")
3. **Persistence:** Garder un historique de notifications
4. **Email:** Envoyer des email résumé des notifications
5. **Push Notifications:** Intégrer Web Push API pour notifications du navigateur
6. **Preferences:** Permettre aux utilisateurs de choisir les types de notifications reçues

## Notes de Développement

- Les notifications sont **non-destructives**: suppression côté frontend n'affecte pas le backend immédiatement
- Les timestamps utilisent l'`TIMESTAMP DEFAULT NOW()` du serveur PostgreSQL
- Les noms et avatars des senders sont **dénormalisés** pour améliorer les performances (pas besoin de JOIN)
- L'authentification utilise le middleware `userAuth` standard

---

**Dernière mise à jour:** 2024-01-15
**Statut:** ✅ Production-ready
