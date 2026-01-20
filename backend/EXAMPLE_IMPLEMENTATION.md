# 📚 Exemple Complet: Implémentation d'une Route Utilisateur

Ce guide montre comment implémenter `routes/users.ts` en suivant l'architecture modulaire.

## 📝 Étape 1: Créer la Route (`routes/users.ts`)

Copiez le contenu ci-dessous:

```typescript
/**
 * Users Routes
 * 
 * Endpoints:
 * GET /api/users/:id - Get user profile
 * PUT /api/users/me - Update my profile (auth required)
 * DELETE /api/users/:id - Delete user
 * GET /api/users/candidates - List candidates (public)
 */

import { Router, Request, Response } from 'express';
import { userAuth, adminAuth } from '../middleware/auth.js';
import {
  getUserProfile,
  getCurrentUserProfile,
  updateUserProfile,
  deleteUser,
  listCandidates,
} from '../controllers/userController.js';

const router = Router();

// Public routes
router.get('/:id', getUserProfile);
router.get('/candidates', listCandidates);

// Protected routes
router.get('/me', userAuth, getCurrentUserProfile);
router.put('/me', userAuth, updateUserProfile);
router.delete('/:id', userAuth, deleteUser);

export default router;
```

## 🎯 Étape 2: Créer le Controller (`controllers/userController.ts`)

```typescript
/**
 * User Controller
 * 
 * Gère la logique métier pour les opérations utilisateur
 */

import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { getErrorMessage } from '../utils/helpers.js';

/**
 * Get User Profile by ID
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validation
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide',
      });
    }

    // Query
    const { rows } = await pool.query(
      'SELECT id, full_name, email, user_type, profession, profile_image_url, is_verified FROM users WHERE id = $1 AND is_deleted = false',
      [id]
    );

    const user = rows[0];

    // Not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error('Get user profile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: process.env.NODE_ENV === 'development' ? getErrorMessage(err) : undefined,
    });
  }
};

/**
 * Get Current User Profile (authenticated user)
 */
export const getCurrentUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND is_deleted = false',
      [userId]
    );

    const user = rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Profil non trouvé',
      });
    }

    // Remove password from response
    const { password, ...safeUser } = user;

    return res.json({
      success: true,
      user: safeUser,
    });
  } catch (err) {
    console.error('Get current user error:', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: process.env.NODE_ENV === 'development' ? getErrorMessage(err) : undefined,
    });
  }
};

/**
 * Update User Profile
 */
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const {
      full_name,
      email,
      profession,
      bio,
      phone,
      linkedin,
      profile_image_url,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (full_name !== undefined) {
      updates.push(`full_name = $${paramIndex++}`);
      values.push(full_name);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (profession !== undefined) {
      updates.push(`profession = $${paramIndex++}`);
      values.push(profession);
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`);
      values.push(bio);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (linkedin !== undefined) {
      updates.push(`linkedin = $${paramIndex++}`);
      values.push(linkedin);
    }
    if (profile_image_url !== undefined) {
      updates.push(`profile_image_url = $${paramIndex++}`);
      values.push(profile_image_url);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun champ à mettre à jour',
      });
    }

    // Add userId and timestamp
    values.push(userId);
    updates.push(`updated_at = NOW()`);

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const { rows } = await pool.query(sql, values);
    const updatedUser = rows[0];

    // Remove password
    const { password, ...safeUser } = updatedUser;

    return res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: safeUser,
    });
  } catch (err) {
    console.error('Update user profile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: process.env.NODE_ENV === 'development' ? getErrorMessage(err) : undefined,
    });
  }
};

/**
 * Delete User (mark as deleted)
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // User can only delete their own account
    if (parseInt(id) !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que votre propre compte',
      });
    }

    // Soft delete
    const { rows } = await pool.query(
      `UPDATE users SET is_deleted = true, deletion_scheduled_at = NOW() WHERE id = $1 RETURNING id, email`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    return res.json({
      success: true,
      message: 'Compte supprimé avec succès',
    });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du compte',
      error: process.env.NODE_ENV === 'development' ? getErrorMessage(err) : undefined,
    });
  }
};

/**
 * List Candidates
 */
export const listCandidates = async (req: Request, res: Response) => {
  try {
    const limitParam = req.query.limit as string | undefined;
    const offsetParam = req.query.offset as string | undefined;
    const limit = Math.min(parseInt(limitParam || '10') || 10, 100);
    const offset = parseInt(offsetParam || '0') || 0;

    const { rows } = await pool.query(
      `SELECT id, full_name, profession, email, phone, profile_image_url, is_verified, created_at
       FROM users
       WHERE LOWER(COALESCE(user_type, '')) = 'candidate' AND is_deleted = false
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return res.json({
      success: true,
      candidates: rows,
    });
  } catch (err) {
    console.error('List candidates error:', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des candidats',
      error: process.env.NODE_ENV === 'development' ? getErrorMessage(err) : undefined,
    });
  }
};
```

## 🔗 Étape 3: Enregistrer dans Routes Index

Modifiez `routes/index.ts`:

```typescript
import { Express } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';

export const registerRoutes = (app: Express) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  
  // ... autres routes
};
```

## ✅ Résultat

Endpoints disponibles:
- `GET /api/users/:id` - Récupérer profil utilisateur
- `GET /api/users/me` - Récupérer mon profil (auth)
- `PUT /api/users/me` - Mettre à jour mon profil (auth)
- `DELETE /api/users/:id` - Supprimer mon compte (auth)
- `GET /api/users/candidates` - Lister les candidats

## 🧪 Test avec cURL

```bash
# Get user profile
curl http://localhost:5000/api/users/1

# List candidates
curl http://localhost:5000/api/users/candidates?limit=5

# Get current user (need token)
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/users/me

# Update profile
curl -X PUT \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Doe","bio":"My bio"}' \
  http://localhost:5000/api/users/me
```

---

Ce guide démontre la pattern complet:
1. **Route** - Définit les endpoints
2. **Controller** - Implémente la logique
3. **Middleware** - Protège les routes
4. **Database** - Requêtes PostgreSQL
5. **Error Handling** - Gestion cohérente des erreurs

Répétez ce pattern pour les autres routes!
