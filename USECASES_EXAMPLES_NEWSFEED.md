# 📚 CAS D'USAGE ET EXEMPLES - OPTIMISATION NEWSFEED

## 1️⃣ CAS D'USAGE : AJOUTER UN COMMENTAIRE

### Scénario
Un utilisateur souhaite commenter une publication.

### Étapes
```
1. Utilisateur voit une publication
2. Clique sur "Commenter"
3. Textarea s'affiche (section CommentsSection)
4. Tapes : "Excellente initiative !"
5. Clique "Commenter"
```

### Backend - Flux d'Exécution
```typescript
// Frontend envoie
POST /api/publications/123/comments
Content-Type: application/json
Authorization: Bearer <token>

{
  "content": "Excellente initiative !"
}

// Backend retourne
{
  "id": 456,
  "publication_id": 123,
  "author_id": 789,
  "content": "Excellente initiative !",
  "created_at": "2026-01-17T10:30:00Z",
  "author_name": "Jean Dupont",
  "author_profile_image": "https://...",
  "author_title": "Développeur Senior",
  "is_publication_author": false
}
```

### Frontend - Mise à Jour UI
```typescript
// Optimistic update
setPublications(publications.map(p =>
  p.id === 123
    ? { ...p, comments_count: (p.comments_count || 0) + 1 }
    : p
));

// Ajouter à la liste des commentaires
setPublicationComments({
  ...publicationComments,
  [123]: [...(publicationComments[123] || []), newComment]
});
```

---

## 2️⃣ CAS D'USAGE : ENVOYER UNE RÉACTION RAPIDE

### Scénario
Un utilisateur clique sur un emoji pour envoyer une réaction.

### Étapes
```
1. Utilisateur voit la barre "Réagir rapidement :"
2. Voit 8 emojis : 👏 👍 🎉 🤝 🚀 💡 ✨ 🔥
3. Clique sur 🚀 (Excellent)
4. Emoji s'agrandit (scale 125%)
5. Commentaire instantané envoyé avec contenu = "🚀"
6. Toast "Réaction envoyée !"
```

### Backend - Flux d'Exécution
```typescript
// Frontend envoie
POST /api/publications/123/comments
Content-Type: application/json
Authorization: Bearer <token>

{
  "content": "🚀"  // Juste l'emoji
}

// Backend traite
// - Insère dans publication_comments
// - Incrémente comments_count
// - Retourne le commentaire

// Frontend affiche dans la liste
{
  "author_name": "Marie Leblanc",
  "author_profile_image": "https://...",
  "content": "🚀",
  "created_at": "2026-01-17T10:35:00Z"
}
```

---

## 3️⃣ CAS D'USAGE : SIGNALER UNE PUBLICATION

### Scénario
Un utilisateur signale une publication pour contenu inapproprié.

### Étapes
```
1. Utilisateur clique sur le bouton "3 points" (MoreVertical)
2. Modal de signalement s'ouvre
3. Sélectionne "Contenu inapproprié"
4. Clique "Signaler"
5. Modal se ferme
6. Toast "Merci ! Votre signalement a été envoyé avec succès."
7. Reste sur le fil d'actualité
```

### Backend - Flux d'Exécution
```typescript
// Frontend envoie
POST /api/publications/123/report
Content-Type: application/json
Authorization: Bearer <token>

{
  "reason": "inappropriate",
  "details": null,
  "reported_by": 789
}

// Backend insère dans publication_reports
INSERT INTO publication_reports (
  publication_id, reported_by, reason, details, status
) VALUES (123, 789, 'inappropriate', null, 'pending')

// Envoie notification à l'auteur
POST /api/notifications
{
  "recipient_id": <publication_author_id>,
  "type": "report_notification",
  "title": "Votre publication a été signalée",
  "message": "Votre publication a été signalée par un membre...",
  "related_id": 123
}
```

---

## 4️⃣ CAS D'USAGE : VOIR LE BADGE "PROPRIÉTAIRE"

### Scénario
L'auteur d'une publication commente sa propre publication.

### Étapes
```
1. Alice crée une publication
2. Bob commente la publication
3. Alice répond au commentaire de Bob
4. À côté du nom "Alice", un badge bleu "Propriétaire" s'affiche
5. Bob voit le badge et sait que c'est l'auteur de la publication
```

### Backend - Vérification
```sql
SELECT 
  pc.id,
  pc.author_id,
  p.author_id as publication_author_id,
  p.author_id = pc.author_id as is_publication_author
FROM publication_comments pc
JOIN publications p ON p.id = pc.publication_id
WHERE pc.publication_id = 123
```

### Frontend - Affichage
```tsx
{comment.is_publication_author && (
  <span className="bg-blue-100 text-blue-800">
    Propriétaire
  </span>
)}
```

---

## 5️⃣ CAS D'USAGE : SUPPRIMER UN COMMENTAIRE

### Scénario
Un utilisateur supprime son commentaire.

### Étapes
```
1. Utilisateur voit le bouton trash 🗑️ à côté de son commentaire
2. Clique dessus
3. Commentaire supprimé
4. Compteur de commentaires décrémente
5. Toast "Commentaire supprimé"
```

### Backend - Flux d'Exécution
```typescript
// Frontend envoie
DELETE /api/publications/123/comments/456
Authorization: Bearer <token>

// Backend vérifie
// - Que le commentaire existe
// - Que l'utilisateur en est l'auteur

// Backend supprime
DELETE FROM publication_comments WHERE id = 456

// Décrémente le compteur
UPDATE publications SET comments_count = comments_count - 1 WHERE id = 123

// Retourne success
{ "success": true }
```

---

## 6️⃣ CAS D'USAGE : LIKE UNE PUBLICATION

### Scénario
Un utilisateur aime une publication (déjà existant, mais amélioré).

### Étapes
```
1. Utilisateur clique sur "J'aime"
2. Bouton devient rouge, compteur s'incrémente
3. Clique à nouveau pour désaimer
4. Bouton redevient normal, compteur décrémente
```

### Backend - Flux d'Exécution
```typescript
// Vérifier si déjà liké
SELECT * FROM publication_likes 
WHERE publication_id = 123 AND user_id = 789

// Si existe : DELETE (unlike)
DELETE FROM publication_likes 
WHERE publication_id = 123 AND user_id = 789
UPDATE publications SET likes_count = likes_count - 1

// Sinon : INSERT (like)
INSERT INTO publication_likes VALUES (123, 789)
UPDATE publications SET likes_count = likes_count + 1
```

---

## 🔄 FLUX COMPLET : DE LA PUBLICATION AU COMMENTAIRE

```
┌─────────────────────────────────────────────────────────┐
│                 UTILISATEUR A (Auteur)                   │
│            Crée une publication                          │
│            (Contenu + Image optionnelle)                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
        POST /api/publications (userAuth)
        Frontend: handleCreatePost()
                     │
                     ↓
        ┌──────────────────────────────────┐
        │  Base de Données                 │
        │  INSERT INTO publications        │
        │  - author_id                     │
        │  - content                       │
        │  - image_url                     │
        │  - likes_count = 0               │
        │  - comments_count = 0            │
        └────────────┬─────────────────────┘
                     │
                     ↓
   ┌─────────────────────────────────────┐
   │    UTILISATEUR B (Commentateur)     │
   │  Voit la publication                │
   │  Clique "Commenter"                 │
   └──────────────┬──────────────────────┘
                  │
                  ↓
     POST /api/publications/123/comments
     Frontend: handleAddComment()
                  │
                  ↓
     ┌────────────────────────────────────┐
     │  Base de Données                   │
     │  INSERT INTO publication_comments  │
     │  - publication_id = 123            │
     │  - author_id = Bob_id              │
     │  - content = "Très bien !"         │
     └────────────┬───────────────────────┘
                  │
                  ↓
     UPDATE publications
     SET comments_count = comments_count + 1
     WHERE id = 123
                  │
                  ↓
     Frontend: handleCommentAdded()
     - Incrémente compteur
     - Affiche le commentaire avec profil
                  │
                  ↓
   ┌─────────────────────────────────────┐
   │    UTILISATEUR A voit le commenter  │
   │    - Nom : Bob Dupont               │
   │    - Titre : Développeur            │
   │    - Photo : [avatar]               │
   │    - Message : "Très bien !"        │
   └─────────────────────────────────────┘
```

---

## 📋 AUTRES CAS D'USAGE

### Cas : Plusieurs commentaires
- Les commentaires s'affichent dans l'ordre chronologique (ASC)
- Chacun affiche son profil complet
- Badge "Propriétaire" seulement pour l'auteur de la publication

### Cas : Utilisateur non connecté
- Bouton "Commenter" désactivé
- Toast "Vous devez être connecté"
- Redirection vers /connexion possible

### Cas : Modification de profil
- Si un utilisateur change sa profession
- Les commentaires futurs afficheront la nouvelle profession
- Les anciens commentaires conservent l'ancienne (snapshot en BDD)

### Cas : Signalement multiple
- Un utilisateur ne peut signaler qu'une fois par publication
- Deuxième tentative : toast "Vous avez déjà signalé cette publication"
- État : pending → reviewed (après examen des admins)

---

## 🔗 INTÉGRATION API

### Endpoints Utilisés
```
GET    /api/publications              - Récupérer tous les posts
POST   /api/publications              - Créer un post (userAuth)
POST   /api/publications/:id/like     - Aimer un post (userAuth)
GET    /api/publications/:id/comments - Récupérer les commentaires
POST   /api/publications/:id/comments - Ajouter un commentaire (userAuth)
DELETE /api/publications/:id/comments/:cId - Supprimer un commentaire (userAuth)
POST   /api/publications/:id/report   - Signaler un post (userAuth)
POST   /api/notifications             - Envoyer une notification
```

---

## ✅ CHECKLIST D'IMPLÉMENTATION

- [x] Table `publication_comments` créée
- [x] Table `publication_reports` créée
- [x] Endpoint GET comments implémenté
- [x] Endpoint POST comments implémenté
- [x] Endpoint DELETE comments implémenté
- [x] Endpoint POST report implémenté
- [x] Composant ReportModal créé
- [x] Composant ReactionBar créé
- [x] CommentsSection amélioré
- [x] Newsfeed.tsx intégré
- [x] Badge "Propriétaire" affichant correctement
- [x] Suppression du badge "💡 Conseil"
- [x] Tests en environnement local

---

**Tous les cas d'usage sont maintenant couverts et testés ! ✅**
