# 🏗️ Architecture Modulaire - Guide Rapide

## 📁 Structure actuelle

```
backend/src/
├── config/
│   ├── constants.ts          ← Constantes globales
│   └── database.ts           ← Pool PostgreSQL
├── middleware/
│   └── auth.ts               ← Authentification JWT
├── routes/
│   ├── index.ts              ← Registre central
│   └── auth.ts               ← Routes authentification (EXEMPLE)
├── controllers/
│   └── authController.ts     ← Logique métier auth (EXEMPLE)
├── utils/
│   └── helpers.ts            ← Fonctions utilitaires
├── services/                 ← À créer (logique métier réutilisable)
├── models/                   ← À créer (requêtes DB centralisées)
└── server.ts                 ← Original (3401 lignes)
```

## 🚀 Comment utiliser l'architecture

### 1. Créer une nouvelle route

**Fichier:** `routes/users.ts`

```typescript
import { Router } from 'express';
import { userAuth } from '../middleware/auth.js';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';

const router = Router();

// Public route
router.get('/:id', getUserProfile);

// Protected route
router.put('/:id', userAuth, updateUserProfile);

export default router;
```

### 2. Créer le controller correspondant

**Fichier:** `controllers/userController.ts`

```typescript
import { Request, Response } from 'express';
import { pool } from '../config/database.js';

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = rows[0];
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, error: String(err) });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { full_name, email } = req.body;
    
    const { rows } = await pool.query(
      'UPDATE users SET full_name = $1, email = $2 WHERE id = $3 RETURNING *',
      [full_name, email, id]
    );
    
    return res.json({ success: true, user: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: String(err) });
  }
};
```

### 3. Enregistrer la route

**Fichier:** `routes/index.ts`

```typescript
import { Express } from 'express';
import userRoutes from './users.js';

export const registerRoutes = (app: Express) => {
  app.use('/api/users', userRoutes);
  // ... autres routes
};
```

### 4. Utiliser dans le serveur

**Fichier:** `server-modular.ts`

```typescript
import { registerRoutes } from './routes/index.js';

// ...

registerRoutes(app);

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 🔑 Points clés

| Concept | Fichier | Rôle |
|---------|---------|------|
| **Route** | `routes/*.ts` | Définit les endpoints HTTP |
| **Controller** | `controllers/*.ts` | Logique métier des routes |
| **Middleware** | `middleware/*.ts` | Traitement des requêtes/réponses |
| **Service** | `services/*.ts` | Logique métier réutilisable |
| **Model** | `models/*.ts` | Requêtes DB centralisées |
| **Util** | `utils/*.ts` | Fonctions helper générales |
| **Config** | `config/*.ts` | Configuration globale |

## 📚 Exemples fournis

### ✅ Auth Route Example
Voir: `src/routes/auth.ts`

Démontre:
- Validation input
- Hash password
- JWT generation
- Error handling

### ✅ Auth Controller Example
Voir: `src/controllers/authController.ts`

Démontre:
- Séparation logique métier
- Gestion des erreurs
- Réponses structurées

### ✅ Middleware Example
Voir: `src/middleware/auth.ts`

Démontre:
- Vérification JWT
- Extraction userId/userRole
- Erreurs d'authentification

## 🔄 Flux d'une requête

```
HTTP Request
    ↓
Route Handler (routes/users.ts)
    ↓
Middleware (userAuth)
    ↓
Controller (controllers/userController.ts)
    ↓
Database Query (pool.query)
    ↓
Response JSON
```

## 💡 Avantages de cette architecture

✅ **Maintenabilité** - Code organisé et facile à trouver
✅ **Testabilité** - Chaque fonction peut être testée isolément
✅ **Scalabilité** - Facile d'ajouter de nouvelles routes
✅ **Réutilisabilité** - Middleware/controllers partagés
✅ **Performance** - Code propre et optimisé
✅ **Productivité** - Développement plus rapide

## 🎯 Prochain travail

1. Créer `routes/users.ts` en copiant le pattern de `routes/auth.ts`
2. Créer `controllers/userController.ts` basé sur `controllers/authController.ts`
3. Enregistrer dans `routes/index.ts`
4. Tester les endpoints
5. Répéter pour les autres routes

## 📖 Documentation complète

Voir:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture détaillée
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Migration complète
- [README_REFACTORING.md](./README_REFACTORING.md) - État du refactoring

---

**Status:** Phase 1 complétée ✅
**Exemple complet:** routes/auth.ts + controllers/authController.ts
**Prochaine étape:** Créer routes/users.ts
