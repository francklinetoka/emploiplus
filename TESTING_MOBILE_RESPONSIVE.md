# 🧪 Guide de Test - Navigation Mobile Responsive

## Environnement de Test

- **Navigateur**: Chrome DevTools (ou navigateur mobile physique)
- **Résolutions de test**: 375px, 425px, 768px, 1024px, 1920px
- **Pages testées**: Newsfeed, Jobs

## ✅ Tests Manuel Newsfeed

### Test 1: Affichage Initial (Mobile - 375px)
```
Étapes:
1. Ouvrir Newsfeed
2. Redimensionner à 375px (viewport mobile)
3. Scroller

Attendu:
✓ Seul le fil d'actualité s'affiche
✓ BottomNavigation visible en bas
✓ Bouton "Fil" est actif (bleu/surligné)
✓ Scroll vertical fonctionne
```

**Vérification visuelle**:
```
Screen: 375px width
┌─────────────────────────┐
│  Fil d'actualité        │
│  ─────────────          │
│  Publication 1          │
│  Publication 2          │
│                         │
└─────────────────────────┘
│[Profil]│[Fil]│[Infos]  │ ← BottomNavigation
└─────────────────────────┘
```

### Test 2: Clique Bouton Profil (Mobile - 375px)
```
Étapes:
1. À partir de l'écran initial
2. Cliquer sur le bouton "Profil" (gauche)

Attendu:
✓ La section Profil s'affiche au-dessus du fil
✓ Bouton "Profil" devient actif (bleu)
✓ Les infos du profil (avatar, nom, stats) sont visibles
✓ Scroll peut continuer verticalement
✓ Réclique sur Profil: revient à vue Fil
```

**Vérification visuelle**:
```
Screen: 375px width
┌─────────────────────────┐
│ 👤 Mon Profil           │
│ ─────────────           │
│ [Avatar]                │
│ Nom Utilisateur         │
│ Candidat • Vérifié      │
│ ────────────────────    │
│ Profil Complet: 42%     │
│                         │
│ Fil d'actualité         │
│ ─────────────          │
│ Publication 1          │
└─────────────────────────┘
│[Profil]│[Fil]│[Infos]  │ ← Profil actif
└─────────────────────────┘
```

### Test 3: Clique Bouton Infos (Mobile - 375px)
```
Étapes:
1. À partir de la vue Fil
2. Cliquer sur le bouton "Infos" (droite)

Attendu:
✓ La section Suggestions s'affiche au-dessus du fil
✓ Bouton "Infos" devient actif (bleu)
✓ Affichage: Offres à la une → Formations → Entreprises
✓ Scroll vertical fonctionne
```

**Vérification visuelle**:
```
Screen: 375px width
┌─────────────────────────┐
│ Offres à la une         │
│ ─────────────           │
│ • Dev Full Stack        │
│ • Community Manager     │
│                         │
│ Formations recommandées │
│ • Formation 1           │
│ • Formation 2           │
│                         │
│ Entreprises             │
│ • Entreprise 1          │
│                         │
│ Fil d'actualité         │
│ ─────────────          │
│ Publication 1          │
└─────────────────────────┘
│[Profil]│[Fil]│[Infos]  │ ← Infos actif
└─────────────────────────┘
```

### Test 4: Responsive Resize (375px → 1024px)
```
Étapes:
1. À partir d'une vue mobile (ex: mobileView="left")
2. Redimensionner à 1024px (desktop)

Attendu:
✓ Layout revient à 3 colonnes (Desktop standard)
✓ BottomNavigation disparaît automatiquement
✓ Toutes les colonnes sont visibles
✓ Pas de chevauchement
✓ mobileView n'affecte plus l'affichage
```

**Vérification visuelle**:
```
Screen: 1024px+ width
┌──────────┬─────────────────┬──────────────┐
│ PROFIL   │ FIL D'ACTUALITÉ │ SUGGESTIONS  │
│ ─────    │ ───────────────  │ ───────────  │
│ Avatar   │ Publication 1    │ Offres       │
│ Stats    │ Publication 2    │ Formations   │
│          │ Publication 3    │ Entreprises  │
└──────────┴─────────────────┴──────────────┘
(BottomNavigation masquée)
```

## ✅ Tests Manuel Jobs

### Test 1: Affichage Initial (Mobile - 375px)
```
Étapes:
1. Ouvrir Jobs
2. Redimensionner à 375px
3. Scroller

Attendu:
✓ Seule la liste des offres s'affiche
✓ BottomNavigation visible
✓ Bouton "Offres" est actif (bleu)
```

### Test 2: Clique Bouton Profil (Mobile)
```
Étapes:
1. Cliquer sur le bouton "Profil" (gauche)

Attendu:
✓ Section profil s'affiche au-dessus
✓ Infos: Avatar, Nom, Boutons rapides
✓ Liste offres scrollable en dessous
```

### Test 3: Clique Bouton Conseils (Mobile)
```
Étapes:
1. Cliquer sur le bouton "Conseils" (droite)

Attendu:
✓ Section Conseils s'affiche au-dessus
✓ Contenu: Formations, Entreprises, Tips
✓ Liste offres scrollable en dessous
```

### Test 4: Resize Desktop (1024px+)
```
Étapes:
1. Redimensionner à 1024px

Attendu:
✓ Layout 3 colonnes s'affiche
✓ BottomNavigation disparaît
✓ Profil (2 cols) | Offres (7 cols) | Conseils (3 cols)
```

## 🧪 Tests Automatisés (E2E)

### Test Cypress Newsfeed Mobile
```typescript
describe('Newsfeed Mobile Navigation', () => {
  beforeEach(() => {
    cy.visit('/newsfeed');
    cy.viewport(375, 667); // iPhone
  });

  it('should display only feed by default', () => {
    cy.get('[data-testid="profil-section"]').should('not.be.visible');
    cy.get('[data-testid="feed-section"]').should('be.visible');
    cy.get('[data-testid="suggestions-section"]').should('not.be.visible');
  });

  it('should show profil when clicking left button', () => {
    cy.get('[data-testid="left-nav-button"]').click();
    cy.get('[data-testid="profil-section"]').should('be.visible');
    cy.get('[data-testid="feed-section"]').should('be.visible');
  });

  it('should show suggestions when clicking right button', () => {
    cy.get('[data-testid="right-nav-button"]').click();
    cy.get('[data-testid="suggestions-section"]').should('be.visible');
    cy.get('[data-testid="feed-section"]').should('be.visible');
  });

  it('should hide all sections except feed when clicking center button', () => {
    cy.get('[data-testid="right-nav-button"]').click();
    cy.get('[data-testid="center-nav-button"]').click();
    cy.get('[data-testid="profil-section"]').should('not.be.visible');
    cy.get('[data-testid="feed-section"]').should('be.visible');
    cy.get('[data-testid="suggestions-section"]').should('not.be.visible');
  });

  it('should show bottom nav on mobile and hide on desktop', () => {
    cy.get('[data-testid="bottom-navigation"]').should('be.visible');
    cy.viewport(1024, 768); // Desktop
    cy.get('[data-testid="bottom-navigation"]').should('not.be.visible');
  });
});
```

### Test Cypress Jobs Mobile
```typescript
describe('Jobs Mobile Navigation', () => {
  beforeEach(() => {
    cy.visit('/emplois');
    cy.viewport(375, 667);
  });

  it('should display only job list by default', () => {
    cy.get('[data-testid="profile-section"]').should('not.be.visible');
    cy.get('[data-testid="jobs-section"]').should('be.visible');
    cy.get('[data-testid="advice-section"]').should('not.be.visible');
  });

  it('should toggle profile section', () => {
    cy.get('[data-testid="left-nav-button"]').click();
    cy.get('[data-testid="profile-section"]').should('be.visible');
    cy.get('[data-testid="left-nav-button"]').click();
    cy.get('[data-testid="profile-section"]').should('not.be.visible');
  });
});
```

## 📱 Devices Physiques à Tester

| Device | Résolution | Navigateur |
|--------|-----------|-----------|
| iPhone 12 | 390x844 | Safari |
| iPhone 13 Pro | 390x844 | Safari |
| Pixel 4a | 390x844 | Chrome |
| Pixel 5a | 432x900 | Chrome |
| Galaxy S21 | 360x800 | Chrome |
| iPad Air | 820x1180 | Safari |
| iPad Pro | 1024x1366 | Safari |

## 🔍 Critères d'Acceptation

### Performance
- [ ] Pas de lag lors du scroll
- [ ] Transitions fluides entre les vues
- [ ] Temps de chargement < 2s (mobile)
- [ ] FPS ≥ 60 (scroll)

### UX
- [ ] BottomNavigation accessible (pas trop petit)
- [ ] États actif/inactif clairs
- [ ] Contraste texte/fond WCAG AA
- [ ] Pas de débordement de contenu

### Responsive
- [ ] Desktop (1920px): 3 colonnes visibles
- [ ] Tablet (768px): 1 colonne + nav
- [ ] Mobile (375px): 1 colonne + nav
- [ ] Intermédiaire (425px): 1 colonne + nav

### Accessibilité
- [ ] Boutons navigables au clavier (Tab)
- [ ] Indications visuelles au focus
- [ ] Texte alternatif pour les icônes
- [ ] Ratio de contraste ≥ 4.5:1

## 🐛 Bugs Potentiels à Checker

1. **Affichage superposé**: Sections qui se chevauchent
2. **Navigation inopérante**: Boutons qui ne changent pas la vue
3. **Scroll disabled**: Impossibilité de scroller dans une section
4. **Padding insuffisant**: Contenu caché derrière BottomNavigation
5. **Responsive cassé**: Layout incorrect au resize
6. **Performance**: Lag lors des interactions
7. **Icons manquants**: Icônes Lucide non affichées
8. **Classes Tailwind**: Utilisation de classes non existantes

## 📋 Procédure de Test Complète

### 1️⃣ Setup
```bash
# Ouvrir la console DevTools
F12 ou Cmd+Option+I

# Aller à Device Emulation
Cmd+Shift+M (Mac) ou Ctrl+Shift+M (Windows)

# Sélectionner iPhone 12 (390x844)
```

### 2️⃣ Newsfeed Test Flow
```
1. Chargement initial
   → Vérifier: Fil seul visible ✓
   
2. Clique Profil
   → Vérifier: Profil + Fil visible ✓
   
3. Clique Fil
   → Vérifier: Fil seul (réinitialisation) ✓
   
4. Clique Infos
   → Vérifier: Infos + Fil visible ✓
   
5. Scroll vertical
   → Vérifier: Smooth scroll, pas de lag ✓
   
6. Resize à 1024px
   → Vérifier: 3 colonnes, navbar disparue ✓
```

### 3️⃣ Jobs Test Flow
```
(Identique au Newsfeed avec Jobs)
```

### 4️⃣ Validation Finale
- [ ] Tous les tests manuels réussis
- [ ] Pas d'erreurs console (F12)
- [ ] Pas de warnings TypeScript
- [ ] Performance acceptable
- [ ] Prêt pour production ✅

---

**Checklist de Déploiement**
- [ ] Tests manuels complétés
- [ ] Tests E2E réussis
- [ ] Performance validée
- [ ] Accessibilité vérifiée
- [ ] Code review approuvée
- [ ] Prêt à merger et deployer 🚀
