# 🧪 TEST RAPIDE - DROPDOWN MENU PUBLICATIONS

## 🎯 Objectif
Vérifier que le menu dropdown fonctionne correctement avec :
1. ✅ Affichage du bouton "3 points"
2. ✅ Ouverture du dropdown
3. ✅ Clic sur "Modifier" ouvre la modal
4. ✅ Modal d'édition fonctionne
5. ✅ Clic sur "Supprimer" propose une confirmation

---

## 🚀 Démarrage Rapide

### Étape 1 : Redémarrer le frontend
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-
npm run dev
```

Attendre que Vite soit prêt :
```
VITE v5.4.21  ready in 1234 ms

➜  Local:   http://localhost:5173/
```

---

### Étape 2 : Redémarrer le backend (si modifié)
```bash
cd backend
npm start
```

Attendre que le serveur soit prêt :
```
Express server is running on port 5000
PostgreSQL connected
```

---

## 📋 Checklist de Test

### Test A : Affichage UI
- [ ] Aller sur http://localhost:5173/actualite
- [ ] Créer une publication (si aucune)
- [ ] Vérifier qu'il n'y a qu'un bouton "⋮" (3 points) en haut à droite
- [ ] Les anciens boutons "✏️" et "🗑️" ne sont pas visibles
- [ ] Le bouton est aligné à droite du header

### Test B : Ouvrir le Dropdown
- [ ] Cliquer sur le bouton "⋮"
- [ ] Le dropdown apparaît avec :
  - [ ] ✏️ Modifier
  - [ ] 🗑️ Supprimer
- [ ] Cliquer ailleurs pour fermer le dropdown
- [ ] Le dropdown disparaît

### Test C : Cliquer sur "Modifier"
- [ ] Cliquer sur "⋮"
- [ ] Cliquer sur "✏️ Modifier"
- [ ] **La modal "Modifier la publication" s'ouvre**
- [ ] La modal affiche :
  - [ ] Titre : "Modifier la publication"
  - [ ] Textarea avec le contenu actuel
  - [ ] Sélecteur de catégorie (Conseil/Annonce)
  - [ ] Champ "Opportunité spéciale"
  - [ ] Aperçu de l'image actuelle (si elle existe)
  - [ ] Bouton "Annuler"
  - [ ] Bouton "Mettre à jour"

### Test D : Modifier et Sauvegarder
- [ ] Dans la modal, changer le contenu
- [ ] Changer la catégorie (ex: Conseil → Annonce)
- [ ] Cliquer "Mettre à jour"
- [ ] Attendre que le bouton affiche "Mise à jour..." avec spinner
- [ ] Toast "Publication modifiée avec succès" apparaît
- [ ] Modal se ferme automatiquement
- [ ] La publication sur la page affiche les nouvelles données
- [ ] Rafraîchir la page (F5) : les changements persistent

### Test E : Modifier l'Image
- [ ] Ouvrir la modal d'édition
- [ ] Cliquer sur "Cliquez pour changer l'image"
- [ ] Sélectionner une nouvelle image
- [ ] L'aperçu s'affiche dans la modal
- [ ] Voir le bouton "Supprimer" sur l'image
- [ ] Cliquer "Mettre à jour"
- [ ] La nouvelle image s'affiche sur la page

### Test F : Supprimer l'Image
- [ ] Ouvrir la modal d'édition
- [ ] Si une image existe, voir le bouton "Supprimer" dessus
- [ ] Cliquer "Supprimer"
- [ ] L'aperçu disparaît
- [ ] Cliquer "Mettre à jour"
- [ ] L'image est supprimée de la publication

### Test G : Cliquer sur "Supprimer"
- [ ] Cliquer sur "⋮"
- [ ] Cliquer sur "🗑️ Supprimer"
- [ ] **Dialog de confirmation apparaît** :
  - [ ] Titre : "Supprimer la publication"
  - [ ] Message : "Êtes-vous sûr de vouloir supprimer..."
  - [ ] Bouton "Annuler"
  - [ ] Bouton "Supprimer" (rouge)
- [ ] Cliquer "Annuler" : la dialog se ferme, publication persiste
- [ ] Cliquer "Supprimer" : publication est supprimée
- [ ] Toast "Publication supprimée avec succès" apparaît

### Test H : Annuler l'Édition
- [ ] Ouvrir la modal d'édition
- [ ] Changer le contenu
- [ ] Cliquer "Annuler"
- [ ] Modal se ferme
- [ ] Les changements ne sont pas sauvegardés

### Test I : Validation du Formulaire
- [ ] Ouvrir la modal d'édition
- [ ] Effacer tout le contenu
- [ ] Le bouton "Mettre à jour" doit être **désactivé** (grisé)
- [ ] Ajouter du contenu : le bouton devient actif

### Test J : Cas d'Erreur (optionnel)
- [ ] Ouvrir la modal d'édition
- [ ] Ajouter du contenu
- [ ] Arrêter le backend (Ctrl+C)
- [ ] Cliquer "Mettre à jour"
- [ ] Toast d'erreur : "Erreur lors de la modification..."
- [ ] Modal reste ouverte pour corriger

---

## 📱 Test sur Différentes Tailles

### Desktop (1920x1080)
```bash
# Tester sans redimensionner
# Vérifier que le dropdown s'ouvre à droite
# Vérifier que la modal est centrée
```

### Tablet (768x1024)
```bash
# F12 → Dimensions personnalisées → 768x1024
# Vérifier le dropdown est toujours accessible
# Vérifier la modal tient à l'écran
```

### Mobile (375x667)
```bash
# F12 → Dimensions personnalisées → 375x667
# Vérifier le dropdown est visible
# Vérifier la modal est responsive
# Vérifier les inputs sont accessibles
```

---

## 🐛 Dépannage

### Le bouton "⋮" n'apparaît pas
**Vérifier** :
1. Êtes-vous connecté ? (Il faut être l'auteur)
2. La publication vous appartient-elle ? (Vérifier le nom d'auteur)
3. Rechargez la page (F5)

### Le dropdown ne s'ouvre pas
**Vérifier** :
1. La console du navigateur (F12) pour les erreurs
2. Que le fichier `dropdown-menu.tsx` existe
3. Redémarrer le frontend (`npm run dev`)

### La modal ne s'ouvre pas après clic
**Vérifier** :
1. Console : erreurs JavaScript ?
2. Que le fichier `EditPublicationModal.tsx` existe
3. L'import dans `Newsfeed.tsx`

### L'édition ne se sauvegarde pas
**Vérifier** :
1. Backend tourne ? (vérifier port 5000)
2. Console du backend pour les erreurs SQL
3. Vous êtes bien l'auteur ?

### Image ne s'affiche pas dans la modal
**Vérifier** :
1. L'URL de l'image est-elle valide ?
2. L'image existe sur le serveur ?
3. Les permissions CORS sont correctes

---

## ✅ Résultat Final Attendu

Après tous les tests, vous devez avoir :

1. **Un bouton unique "⋮"** en haut à droite de chaque publication (si auteur)
2. **Un dropdown menu** avec :
   - ✏️ Modifier
   - 🗑️ Supprimer
3. **Une modal d'édition** complète et fonctionnelle
4. **Une dialog de confirmation** pour la suppression
5. **Mises à jour en temps réel** sur la page
6. **Pas d'erreurs** dans la console

---

## 💾 Enregistrement des Résultats

Créez un fichier `TEST_RESULTS_DROPDOWN.txt` :

```
DATE : 17/01/2026
TESTEUR : [Votre nom]
NAVIGATEUR : Chrome v[version]
SYSTÈME : macOS

RÉSULTATS :
- Affichage UI : ✅ / ❌
- Dropdown s'ouvre : ✅ / ❌
- Modal s'ouvre : ✅ / ❌
- Édition fonctionne : ✅ / ❌
- Suppression fonctionne : ✅ / ❌
- Responsive Design : ✅ / ❌
- Pas d'erreurs console : ✅ / ❌

NOTES :
[Vos observations]

STATUS : ✅ PASSÉ / ❌ ÉCHOUÉ
```

---

## 🎉 Succès !

Si tous les tests passent, vous pouvez confirmer que :
- ✅ Le dropdown menu fonctionne correctement
- ✅ La modal d'édition est opérationnelle
- ✅ La suppression avec confirmation fonctionne
- ✅ L'interface est propre et intuitive
- ✅ Prêt pour la production

---

**Guide de test créé** : 17 janvier 2026  
**Durée estimée** : 15-20 minutes  
**Complexité** : Facile ✅

Bon test ! 🧪
