# 📚 DOCUMENTATION TECHNIQUE - MODULE CONNEXIONS

## Architecture Overview

### Structure 3 Colonnes
```
┌─────────────────────────────────────────────────────────────┐
│                     Header (Connexions Link)                 │
├──────────────┬──────────────────────┬──────────────────────┤
│  Left Col    │    Center Col        │   Right Col          │
│              │                      │                      │
│ NetworkStats │ SuggestedProfiles    │  NetworkActivity     │
│              │ (IA Matching)        │  (Live Feed)         │
│  • Followers │ • Match Score Badge  │  • Publications      │
│  • Following │ • Common Skills      │  • Recent Actions    │
│  • Total     │ • Follow Button      │  • Timestamps        │
│              │ • Real-time Updates  │                      │
└──────────────┴──────────────────────┴──────────────────────┘
```

---

## Backend Architecture

### Database Schema

#### 1. `follows` Table
```sql
CREATE TABLE follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER NOT NULL,        -- User doing the following
  following_id INTEGER NOT NULL,       -- User being followed
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for fast queries
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
```

**Cardinality:** Many-to-Many (unidirectional)
- Alice → Bob: Alice follows Bob
- Bob → Alice: Separate relationship

#### 2. `blocks` Table
```sql
CREATE TABLE blocks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,            -- User doing the blocking
  blocked_user_id INTEGER NOT NULL,    -- User being blocked
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_blocks_user ON blocks(user_id);
```

**Logique:**
- Blocage entraîne suppression automatique des follows bidirectionnels
- Impossible de suivre un utilisateur bloqué
- Possible de débloquer à tout moment

---

### Backend Services

#### File: `backend/src/services/followService.ts`

**Fonctions principales:**

##### 1. `followUser(follower_id, following_id)`
```typescript
// Établit une relation de suivi
// Vérifie:
//  - Pas déjà suivi
//  - Pas bloqué
// Retourne: Follow object avec id et timestamps
```

**Flow:**
1. Vérifier si déjà suivi → retourner existing
2. Vérifier si bloqué → throw error
3. Insérer dans DB → retourner nouvelle ligne

---

##### 2. `unfollowUser(follower_id, following_id)`
```typescript
// Supprime une relation de suivi
// Retourne: boolean (success)
```

**Flow:**
1. DELETE FROM follows WHERE...
2. Retourner rowCount > 0

---

##### 3. `getFollowers(user_id)` 
```typescript
// Récupère stats du réseau
// Retourne: NetworkStats
interface NetworkStats {
  followerCount: number;      // Nombre d'abonnés
  followingCount: number;     // Nombre d'abonnements
  followerIds: number[];      // IDs des followers
  followingIds: number[];     // IDs des followings
}
```

**Queries:**
```sql
-- Followers
SELECT follower_id FROM follows WHERE following_id = $1

-- Following
SELECT following_id FROM follows WHERE follower_id = $1
```

---

##### 4. `getSuggestions(user_id, limit)` ⭐ CORE IA
```typescript
// Retourne: Suggestion[] avec match scores
interface Suggestion {
  user: UserProfile;
  matchScore: number;         // 0-100%
  commonSkills: string[];     // Compétences partagées
  reason: string;             // "2 compétence(s) commune(s)"
  isFollowing: boolean;
}
```

**Algorithm (Match Score Calculation):**
```
1. Récupérer profil utilisateur courant
   - full_name, profession, skills, experience_years

2. Récupérer tous les utilisateurs non bloqués, non supprimés
   - Limiter à 50 potentiels

3. Pour chaque candidat:
   a) Extraire skills (JSONB array)
   b) Trouver compétences communes (intersection des sets)
   c) Calculer scores:
      - Hard Skills Score = (common skills / user skills) * 100
      - Type Match = +50 si même user_type, else +20
      - Final Score = (hardSkills * 0.5 + typeMatch) / 1.5
      
   d) Filter: Score > 30% (keep only meaningful suggestions)

4. Sort par score DESC

5. Retourner top 10-12 suggestions
```

**Example:**
```
User Alice: 4 skills (React, JS, TS, CSS), Type: Candidate
Candidate Bob: 4 skills (React, JS, Node, PG), Type: Candidate

Common: React, JS = 2 skills
Score = (2/4) * 100 = 50 (hard)
Type Match = 50 (same type)
Final = (50 * 0.5 + 50) / 1.5 = 55.5 → 56%
```

---

##### 5. `getNetworkActivity(user_id, limit)`
```typescript
// Retourne: Activity[] des suivis
interface Activity {
  id: string;
  type: 'follow' | 'publication' | 'job_posted';
  actor: UserProfile;
  action: string;             // Description en texte
  timestamp: string;
  target?: string;
}
```

**Flow:**
1. Récupérer liste des following
2. Requêter les publications de ces users
3. Formater avec timestamp humain
4. Trier par date DESC
5. Limiter à 20 résultats

**Queries:**
```sql
SELECT * FROM publications
WHERE user_id IN (ids des suivis)
  AND is_active = true
ORDER BY created_at DESC
LIMIT 20
```

---

##### 6. `blockUser(user_id, blocked_user_id)`
```typescript
// 1. Supprimer les follows bidirectionnels
// 2. Créer entrée dans blocks table
// 3. Retourner Block object
```

---

##### 7. Helper Functions
```typescript
- isFollowing(follower_id, following_id): boolean
- getFollowingUsers(user_id): UserProfile[]
- getFollowerUsers(user_id): UserProfile[]
- unblockUser(user_id, blocked_user_id): boolean
```

---

### API Endpoints

#### Follow Management
```
POST   /api/follows/:followingId
       Create follow relationship
       Auth: Required (userAuth)
       Response: { success: true, follow }

DELETE /api/follows/:followingId
       Remove follow relationship
       Auth: Required
       Response: { success: true }

GET    /api/follows/:userId/is-following
       Check if following
       Response: { following: boolean }
```

#### Network Stats & Discovery
```
GET    /api/follows/stats
       Get follower/following counts
       Auth: Required
       Response: NetworkStats

GET    /api/follows/suggestions?limit=10
       Get personalized suggestions (IA)
       Auth: Required
       Response: Suggestion[]

GET    /api/follows/activity?limit=20
       Get network activity feed
       Auth: Required
       Response: Activity[]

GET    /api/follows/following
       List all followed users
       Auth: Required
       Response: UserProfile[]

GET    /api/follows/followers
       List all followers
       Auth: Required
       Response: UserProfile[]
```

#### Blocking
```
POST   /api/blocks/:blockedUserId
       Block user (removes mutual follows)
       Auth: Required
       Response: { success: true, block }

DELETE /api/blocks/:blockedUserId
       Unblock user
       Auth: Required
       Response: { success: true }
```

---

## Frontend Architecture

### Components Structure
```
src/pages/Connections.tsx          (Main page - 3 columns layout)
  ├── src/components/connections/NetworkStats.tsx     (Left col)
  ├── src/components/connections/SuggestedProfiles.tsx (Center col)
  └── src/components/connections/NetworkActivity.tsx  (Right col)
```

---

### Component: NetworkStats

**Props:** None (fetches own data)

**State Management:**
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['networkStats'],
  queryFn: api.getNetworkStats,
});
```

**Rendering:**
```
┌─────────────────────┐
│ Votre Réseau        │
├─────────────────────┤
│ 👥 Abonnés: 5       │
│ 👤 Abonnements: 12  │
├─────────────────────┤
│ Total réseau: 17    │
└─────────────────────┘
```

**Features:**
- Real-time updates via React Query
- Auto-refresh on dependency changes
- Loading skeleton while fetching

---

### Component: SuggestedProfiles ⭐

**Props:** None (fetches self-customized data)

**State Management:**
```typescript
// Fetching suggestions
const { data: suggestions } = useQuery({
  queryKey: ['followSuggestions'],
  queryFn: () => api.getFollowSuggestions(12),
});

// Mutations
const followMutation = useMutation({
  mutationFn: (userId) => api.followUser(userId),
  onSuccess: () => {
    // Invalidate both queries to refresh
    queryClient.invalidateQueries({ queryKey: ['followSuggestions'] });
    queryClient.invalidateQueries({ queryKey: ['networkStats'] });
  },
});
```

**Card Display:**
```
┌────────────────────────────────┐
│ [Avatar] Bob Martin      [82%] │   ← Match Score badge
│          Developer              │
├────────────────────────────────┤
│ "Passionné par web dev"         │   ← Bio (truncated)
├────────────────────────────────┤
│ Compétences communes:           │
│ [React] [JavaScript] [+1 plus] │
├────────────────────────────────┤
│ 💡 2 compétence(s) commune(s)   │   ← Reason
├────────────────────────────────┤
│ [💜 Suivre]                     │   ← Action button
└────────────────────────────────┘
```

**Features:**
- Dynamic match score coloring
  ```
  Green: ≥75%
  Orange: 45-74%
  Gray: <45%
  ```
- Instant follow/unfollow
- Common skills display
- Avatar fallback with initials
- Disabled state during mutation

---

### Component: NetworkActivity

**Props:** None (fetches self-customized data)

**State Management:**
```typescript
const { data: activities } = useQuery({
  queryKey: ['networkActivity'],
  queryFn: () => api.getNetworkActivity(20),
  refetchInterval: 30000, // Auto-refresh every 30s
});
```

**Activity Feed:**
```
┌────────────────────────────┐
│ 📄 Bob Martin              │ ← Icon + name
│    a publié: "Mon projet"  │ ← Action description
│    Full-Stack Dev          │ ← Profession
│                      2m    │ ← Time ago
└────────────────────────────┘

┌────────────────────────────┐
│ 📄 Charlie R.              │
│    a publié: "New stuff"   │
│    Frontend Eng            │
│                      42m   │
└────────────────────────────┘
```

**Features:**
- Relative time formatting
  ```
  "À l'instant" → <1min
  "2m" → 2 minutes
  "1h" → 1 hour
  "3j" → 3 days
  "Jan 15" → older dates
  ```
- Icon-based activity type differentiation
- Auto-refresh every 30 seconds
- Empty state handling

---

### Page: Connections

**Props:** None

**Logic:**
1. Check authentication (useAuth)
2. Render 3-column layout
3. Each column sticky on desktop
4. Responsive: stacks on mobile

**Header:**
```
┌─────────────────────────────┐
│ 🌐 Connexions              │
│ Découvrez et construisez... │
└─────────────────────────────┘
```

**Layout CSS:**
```css
grid grid-cols-1 lg:grid-cols-3 gap-6

/* Sticky positioning */
.sticky { top: 1rem }
```

---

## API Client Methods (src/lib/api.ts)

```typescript
followUser(userId: number) → Promise<Follow>
unfollowUser(userId: number) → Promise<{ success: boolean }>
getNetworkStats() → Promise<NetworkStats>
getFollowSuggestions(limit = 10) → Promise<Suggestion[]>
getNetworkActivity(limit = 20) → Promise<Activity[]>
getFollowingUsers() → Promise<UserProfile[]>
getFollowerUsers() → Promise<UserProfile[]>
isFollowing(userId: number) → Promise<{ following: boolean }>
blockUser(userId: number) → Promise<Block>
unblockUser(userId: number) → Promise<{ success: boolean }>
```

---

## Data Flow Diagrams

### Follow Action Flow
```
User clicks [Suivre]
    ↓
followMutation.mutate(userId)
    ↓
POST /api/follows/:userId
    ↓
Backend:
  1. Verify not already following
  2. Verify not blocked
  3. INSERT into follows
  4. RETURN follow object
    ↓
Frontend:
  1. queryClient.invalidateQueries(['followSuggestions'])
  2. queryClient.invalidateQueries(['networkStats'])
    ↓
[Network stats update]
[Suggestions list re-fetch and re-render]
[Button state changes]
    ↓
✓ Complete
```

### Suggestions Loading Flow
```
Page mounts
    ↓
useQuery('followSuggestions')
    ↓
GET /api/follows/suggestions?limit=12
    ↓
Backend algorithm:
  1. Get current user profile + skills
  2. Get all non-blocked, non-deleted users
  3. Calculate match score for each
  4. Filter score > 30%
  5. Sort by score DESC
  6. Return top 12
    ↓
Frontend renders 12 cards
    ↓
✓ Suggestions displayed
```

---

## Performance Considerations

### Caching Strategy
```
React Query defaults:
  staleTime: 5 min (data considered fresh)
  gcTime: 5 min (cache retained)
  
Manual invalidation triggers refresh on:
  - Follow/unfollow
  - Block/unblock
  - Return to page
```

### Database Indexes
```sql
-- Fast lookups by follower
CREATE INDEX idx_follows_follower ON follows(follower_id);

-- Fast lookups by following
CREATE INDEX idx_follows_following ON follows(following_id);

-- Fast lookups by user blocking
CREATE INDEX idx_blocks_user ON blocks(user_id);
```

### Query Optimization
```sql
-- Suggestions: Only fetch non-deleted, non-blocked
SELECT ... FROM users
WHERE is_deleted = false AND is_blocked = false
LIMIT 50

-- Activity: Only fetch active publications
SELECT ... FROM publications
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 20
```

---

## Error Handling

### Frontend Error Handling
```typescript
// API calls wrapped in try-catch
try {
  const result = await api.followUser(userId);
  handleSuccess();
} catch (error) {
  handleError(error.message);
  // Show toast notification
}

// Query errors handled by React Query
const { error } = useQuery({ ... });
if (error) {
  // Display error state
}
```

### Backend Error Handling
```typescript
// Self-follow prevention
if (followingId === userId) {
  return res.status(400).json({
    success: false,
    message: 'You cannot follow yourself'
  });
}

// Block prevention
const blocked = await isBlocked(follower_id, following_id);
if (blocked) {
  throw new Error('Cannot follow blocked user');
}
```

---

## Testing Scenarios

### Unit Tests (Backend)
```typescript
// followService.ts
describe('followUser', () => {
  test('should create follow relationship', async () => {
    const follow = await followUser(1, 2);
    expect(follow.follower_id).toBe(1);
  });
  
  test('should throw if already following', async () => {
    await expect(followUser(1, 2)).rejects.toThrow();
  });
});
```

### Integration Tests
```typescript
describe('Follow endpoint', () => {
  test('POST /api/follows/:userId creates follow', async () => {
    const res = await request
      .post('/api/follows/2')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
```

---

## Security Considerations

### Authentication
- All endpoints require `userAuth` middleware
- Token validated on every request
- userId extracted from JWT

### Authorization
- User can only modify their own relationships
- Cannot follow/block without authentication
- Cannot see private profiles

### Input Validation
```typescript
// Prevent self-follow
if (parseInt(followingId) === userId) {
  return error('Cannot follow yourself');
}

// Prevent duplicate follows (UNIQUE constraint)
// Prevent duplicate blocks (UNIQUE constraint)
```

---

## Deployment Checklist

- [ ] Tables `follows` and `blocks` created
- [ ] Indexes created on follower_id, following_id, user_id
- [ ] Backend imports followService
- [ ] All 11 endpoints added to server.ts
- [ ] Frontend API methods added to api.ts
- [ ] Connections page and components created
- [ ] Route added to App.tsx
- [ ] Header navigation updated
- [ ] Build passes without errors
- [ ] Tested with multiple users
- [ ] Performance acceptable (no N+1 queries)

---

## Future Enhancements

### Phase 2
1. **Notifications Badge**: Red dot for new followers
2. **Mutual Follows**: Show "Connected" badge
3. **Statistics**: Dashboard with follow growth
4. **Export**: Download followers/following list
5. **Advanced Filtering**: Filter suggestions by skill/sector

### Phase 3
1. **ML Recommendations**: Use user behavior
2. **Trending**: Show most followed profiles
3. **Messaging**: Private messages between followers
4. **Notifications**: Email alerts for new followers
5. **Analytics**: Detailed engagement metrics

---

**Version:** 1.0.0  
**Last Updated:** January 20, 2026  
**Status:** Production Ready
