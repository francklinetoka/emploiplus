# Architecture Modulaire - Plan de Refactorisation

## Structure Proposée

```
backend/src/
├── server.ts              # Point d'entrée principal (épuré)
├── config/
│   ├── database.ts        # Configuration PostgreSQL
│   └── constants.ts       # Constantes globales
├── middleware/
│   ├── auth.ts           # Authentication & Authorization
│   ├── error.ts          # Error handling
│   └── validation.ts     # Input validation
├── routes/
│   ├── index.ts          # Centralise toutes les routes
│   ├── auth.ts           # Routes: /api/auth/* (login, register)
│   ├── users.ts          # Routes: /api/users/* (profils, paramètres)
│   ├── jobs.ts           # Routes: /api/jobs/*
│   ├── formations.ts     # Routes: /api/formations/*
│   ├── admin.ts          # Routes: /api/admin/* (gestion admins)
│   ├── publications.ts   # Routes: /api/publications/* (newsfeed)
│   ├── portfolios.ts     # Routes: /api/portfolios/*
│   ├── notifications.ts  # Routes: /api/notifications/*
│   ├── faqs.ts           # Routes: /api/faqs/*
│   ├── services.ts       # Routes: /api/services/*
│   └── upload.ts         # Routes: /api/upload/* (fichiers)
├── controllers/
│   ├── authController.ts
│   ├── userController.ts
│   ├── jobController.ts
│   ├── formationController.ts
│   ├── adminController.ts
│   ├── publicationController.ts
│   ├── portfolioController.ts
│   └── [autres...]
├── models/
│   ├── User.ts
│   ├── Job.ts
│   ├── Formation.ts
│   ├── Publication.ts
│   └── [autres...]
├── utils/
│   ├── helpers.ts        # Utilitaires généraux
│   ├── validators.ts     # Validation des données
│   └── formatters.ts     # Formatage des réponses
└── services/
    ├── emailService.ts
    ├── fileService.ts
    └── [autres services métier]
```

## Avantages de cette Architecture

✅ **Séparation des responsabilités** - Chaque fichier a une seule responsabilité
✅ **Maintenabilité** - Facile de localiser et modifier du code
✅ **Testabilité** - Chaque module peut être testé isolément
✅ **Scalabilité** - Facile d'ajouter de nouvelles routes/features
✅ **Réutilisabilité** - Code partagé via utils et services
✅ **Performance** - Import à la demande plutôt que tout au démarrage

## Phase 1: Middleware et Config
- ✅ middleware/auth.ts
- ✅ config/constants.ts
- ✅ utils/helpers.ts
- [ ] middleware/error.ts
- [ ] utils/validators.ts

## Phase 2: Routes Modulaires
Extraire les routes du server.ts monolithe vers des fichiers dédiés:
- routes/auth.ts - Login, register, logout
- routes/users.ts - Profils, documents, skills
- routes/jobs.ts - CRUD emplois
- routes/formations.ts - CRUD formations
- routes/admin.ts - Gestion admins
- routes/publications.ts - Newsfeed
- routes/portfolios.ts - Portfolios
- routes/notifications.ts - Notifications
- routes/faqs.ts - FAQs
- routes/services.ts - Catalogs
- routes/upload.ts - File upload

## Phase 3: Controllers
Extraire la logique métier vers des controllers pour chaque domaine

## Phase 4: Services
Créer des services réutilisables pour:
- Email/Notifications
- Fichiers (upload, delete, etc)
- Analytics
- Verification workflows

## Phase 5: Models/Queries
Centraliser les requêtes DB dans des models typés

## Migration Strategy
1. Garder server.ts comme fichier temporaire avec imports
2. Créer progressivement les fichiers modulaires
3. Tester chaque module indépendamment
4. Rediriger progressivement vers les nouveaux fichiers
5. Supprimer le code du server.ts une fois migré
