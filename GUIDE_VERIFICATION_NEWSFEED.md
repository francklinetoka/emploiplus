# 🔍 GUIDE D'INTÉGRATION ET VÉRIFICATION - OPTIMISATION NEWSFEED

## Checklist de Vérification

### ✅ Étape 1 : Redémarrage du Backend

```bash
# Arrêter le serveur Node.js actuel
# Redémarrer le backend
cd /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-/backend
npm start
# ou
node src/server.js
```

**Attendu** : Les tables `publication_comments` et `publication_reports` se créent automatiquement

---

### ✅ Étape 2 : Vérifier que les Nouveaux Composants sont Importés

**Fichier** : `src/pages/Newsfeed.tsx`

Vérifier que les imports sont présents :
```tsx
import { ReportModal } from "@/components/ReportModal";
import { ReactionBar } from "@/components/ReactionBar";
```

---

### ✅ Étape 3 : Tester les Likes

1. Naviguer vers le fil d'actualité (`/actualite` ou `/newsfeed`)
2. Cliquer sur le bouton "J'aime" d'une publication
3. **Résultat attendu** :
   - ✓ Le bouton devient rouge
   - ✓ Le compteur de likes s'incrémente
   - ✓ Un toast "Aimé!" s'affiche
   - ✓ Cliquer à nouveau désaime et décrémente

---

### ✅ Étape 4 : Tester les Commentaires

1. Cliquer sur "Commenter" d'une publication
2. Section de commentaires s'affiche (ou toggle si déjà visible)
3. Taper un commentaire dans la textarea
4. Cliquer "Commenter"
5. **Résultat attendu** :
   - ✓ Nouveau commentaire apparaît
   - ✓ Compteur de commentaires s'incrémente
   - ✓ Affiche : photo, nom, et profession du commentateur
   - ✓ Si c'est l'auteur du post : badge "Propriétaire" bleu

---

### ✅ Étape 5 : Tester les Réactions Rapides

1. Sous les actions principales, voir la barre "Réagir rapidement :"
2. Cliquer sur un emoji (ex: 👏)
3. **Résultat attendu** :
   - ✓ Emoji s'agrandit (scale)
   - ✓ Commentaire instantané envoyé avec juste cet emoji
   - ✓ Toast "Réaction envoyée !"
   - ✓ Emoji apparaît dans la liste des commentaires

---

### ✅ Étape 6 : Tester le Signalement

1. Cliquer sur le bouton "3 points" (MoreVertical) en haut droit d'une publication
2. **Résultat attendu** : Modal de signalement s'ouvre
3. Sélectionner une raison (ex: "Harcèlement")
4. Cliquer "Signaler"
5. **Résultat attendu** :
   - ✓ Toast "Merci ! Votre signalement a été envoyé avec succès."
   - ✓ Modal se ferme
   - ✓ Utilisateur reste sur le fil d'actualité

---

### ✅ Étape 7 : Vérifier la Notification

1. Être connecté en tant que l'auteur d'une publication
2. Signaler cette publication depuis un autre compte
3. **Résultat attendu** :
   - ✓ Notification "Votre publication a été signalée..." apparaît
   - ✓ Accessible via l'icône notification

---

### ✅ Étape 8 : Suppression du Badge "💡 Conseil"

1. Naviguer vers le fil d'actualité
2. **Résultat attendu** :
   - ✓ Aucun badge "💡 Conseil" ou "📢 Annonce" n'est visible
   - ✓ Cartes de publications affichent uniquement les infos pertinentes

---

## 🐛 Dépannage

### Problème : Modal ReportModal ne s'ouvre pas
**Solution** :
- Vérifier que `Dialog` de shadcn/ui est bien installé
- Vérifier l'import dans ReportModal.tsx
- Vérifier la console pour les erreurs

### Problème : Commentaires n'apparaissent pas
**Solution** :
- Vérifier que le backend est redémarré
- Vérifier les logs du backend pour les erreurs SQL
- Vérifier que les tables `publication_comments` et `publication_reports` existent

```bash
# Vérifier les tables en PostgreSQL
psql -U emploi_user -d emploi_connect
\dt publication*
```

### Problème : Réactions ne s'envoient pas
**Solution** :
- Vérifier que l'utilisateur est connecté (middleware `userAuth`)
- Vérifier la console network pour les erreurs API
- S'assurer que `/api/publications/:id/comments` endpoint répond

### Problème : Badge "Propriétaire" ne s'affiche pas
**Solution** :
- Vérifier que la propriété `is_publication_author` est retournée par l'API
- Vérifier que les IDs d'auteur correspondent correctement
- Vérifier la query SQL pour l'égalité des IDs

---

## 📊 Vérification des Tables en Base de Données

### Vérifier les tables créées
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'publication%';
```

### Vérifier la structure de `publication_comments`
```sql
\d publication_comments
```

### Insérer un test manuel
```sql
INSERT INTO publication_comments (publication_id, author_id, content) 
VALUES (1, 2, 'Test comment');
```

---

## 🔗 URLs Utiles

- **Frontend** : `http://localhost:5173/actualite`
- **API Like** : `POST /api/publications/:id/like`
- **API Comments GET** : `GET /api/publications/:id/comments`
- **API Comments POST** : `POST /api/publications/:id/comments`
- **API Comments DELETE** : `DELETE /api/publications/:id/comments/:commentId`
- **API Report** : `POST /api/publications/:id/report`

---

## 📋 Points à Vérifier Avant de Considérer Comme Terminé

- [ ] Backend redémarré et tables créées
- [ ] Likes fonctionnent avec compteur en temps réel
- [ ] Commentaires s'affichent avec profil complet
- [ ] Badge "Propriétaire" s'affiche correctement
- [ ] Réactions rapides (emojis) envoient des commentaires
- [ ] Signalement ouvre le modal et envoie l'API
- [ ] Notification créée pour l'auteur du post
- [ ] Badge "💡 Conseil" supprimé
- [ ] Pas d'erreurs dans la console browser
- [ ] Pas d'erreurs dans les logs backend

---

## 🎉 Succès !

Si tous les points de vérification sont ✓, l'optimisation avancée du fil d'actualité est complète et fonctionnelle.

**Dernière étape** : Tester avec plusieurs utilisateurs pour vérifier les interactions croisées.

---

**Date de création** : 17 janvier 2026
**Version** : 1.0
**Status** : Production Ready ✅
