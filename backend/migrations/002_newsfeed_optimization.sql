/**
 * ============================================================================
 * SQL Migration - Newsfeed Optimization with Engagement Scoring
 * ============================================================================
 *
 * Crée une vue optimisée pour le fil d'actualité avec:
 * - Join posts + profiles + interactions
 * - Scoring engagement (likes, comments, shares)
 * - Scoring temporel (récence)
 * - Score de pertinence pour ranking
 *
 * À exécuter dans Supabase SQL Editor
 */

-- ============================================================================
-- 1. NEWSFEED VIEW - Avec scoring d'engagement et pertinence
-- ============================================================================

CREATE OR REPLACE VIEW v_newsfeed_ranked AS
SELECT
  p.id,
  p.user_id,
  p.content,
  p.created_at,
  p.updated_at,
  p.image_urls,
  
  -- Informations utilisateur
  u.email,
  u.full_name,
  u.avatar_url,
  u.engagement_score as user_engagement_score,
  
  -- Compteurs d'interactions
  COALESCE(COUNT(DISTINCT pl.id), 0) as likes_count,
  COALESCE(COUNT(DISTINCT c.id), 0) as comments_count,
  COALESCE(COUNT(DISTINCT ps.id), 0) as shares_count,
  
  -- ======================================================================
  -- SCORING D'ENGAGEMENT
  -- ======================================================================
  
  -- Score likes (5 pts par like)
  (COALESCE(COUNT(DISTINCT pl.id), 0) * 5) as engagement_score_likes,
  
  -- Score comments (10 pts par comment)
  (COALESCE(COUNT(DISTINCT c.id), 0) * 10) as engagement_score_comments,
  
  -- Score shares (15 pts par share)
  (COALESCE(COUNT(DISTINCT ps.id), 0) * 15) as engagement_score_shares,
  
  -- Score engagement total
  (
    (COALESCE(COUNT(DISTINCT pl.id), 0) * 5) +
    (COALESCE(COUNT(DISTINCT c.id), 0) * 10) +
    (COALESCE(COUNT(DISTINCT ps.id), 0) * 15)
  ) as total_engagement_score,
  
  -- ======================================================================
  -- SCORING TEMPOREL (Récence)
  -- ======================================================================
  
  -- Heures depuis création
  EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 as hours_ago,
  
  -- Score de récence (moins = plus récent)
  CASE
    WHEN EXTRACT(EPOCH FROM (NOW() - p.created_at)) < 3600 THEN 100          -- < 1h
    WHEN EXTRACT(EPOCH FROM (NOW() - p.created_at)) < 86400 THEN 75          -- < 24h
    WHEN EXTRACT(EPOCH FROM (NOW() - p.created_at)) < 604800 THEN 50         -- < 7j
    ELSE 25                                                                     -- > 7j
  END as recency_score,
  
  -- ======================================================================
  -- SCORE DE PERTINENCE (pour ranking)
  -- ======================================================================
  
  -- Formule: 40% engagement + 40% récence + 20% user score
  ROUND(
    (
      (COALESCE(COUNT(DISTINCT pl.id), 0) * 5 + 
       COALESCE(COUNT(DISTINCT c.id), 0) * 10 + 
       COALESCE(COUNT(DISTINCT ps.id), 0) * 15) / 100.0 * 40) +  -- 40% engagement
      (
        CASE
          WHEN EXTRACT(EPOCH FROM (NOW() - p.created_at)) < 3600 THEN 40
          WHEN EXTRACT(EPOCH FROM (NOW() - p.created_at)) < 86400 THEN 30
          WHEN EXTRACT(EPOCH FROM (NOW() - p.created_at)) < 604800 THEN 20
          ELSE 10
        END
      ) +  -- 40% récence
      (COALESCE(u.engagement_score, 0) / 5) * 4  -- 20% user score
    ), 2
  ) as relevance_score

FROM posts p
LEFT JOIN users u ON p.user_id = u.id
LEFT JOIN post_likes pl ON p.id = pl.post_id AND pl.deleted_at IS NULL
LEFT JOIN comments c ON p.id = c.post_id AND c.deleted_at IS NULL
LEFT JOIN post_shares ps ON p.id = ps.post_id AND ps.deleted_at IS NULL

WHERE p.deleted_at IS NULL
AND u.active = true
AND p.is_flagged = false  -- Exclure les posts modérés

GROUP BY p.id, p.user_id, p.content, p.created_at, p.updated_at, p.image_urls,
         u.email, u.full_name, u.avatar_url, u.engagement_score;

-- Donner l'accès en lecture
GRANT SELECT ON v_newsfeed_ranked TO anon, authenticated;

-- ============================================================================
-- 2. INDEX POUR PERFOMANCE
-- ============================================================================

-- Index sur la colonne created_at pour tri efficace
CREATE INDEX IF NOT EXISTS idx_posts_created_at_desc
  ON posts(created_at DESC NULLS LAST)
  WHERE deleted_at IS NULL;

-- Index sur user_id pour filtrer par auteur
CREATE INDEX IF NOT EXISTS idx_posts_user_id
  ON posts(user_id)
  WHERE deleted_at IS NULL;

-- Index sur post_likes pour comptage rapide
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id
  ON post_likes(post_id)
  WHERE deleted_at IS NULL;

-- Index sur comments pour comptage rapide
CREATE INDEX IF NOT EXISTS idx_comments_post_id
  ON comments(post_id)
  WHERE deleted_at IS NULL;

-- Index sur shares
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id
  ON post_shares(post_id)
  WHERE deleted_at IS NULL;

-- Index composé pour pagination keyset
CREATE INDEX IF NOT EXISTS idx_posts_relevance_pagination
  ON posts(created_at DESC, id DESC)
  WHERE deleted_at IS NULL;

-- ============================================================================
-- 3. MATERIALIZED VIEW - Stats de newsfeed (refresh quotidien)
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_newsfeed_stats AS
SELECT
  COUNT(DISTINCT p.id) as total_posts,
  COUNT(DISTINCT p.user_id) as unique_authors,
  ROUND(AVG(
    COALESCE(COUNT(DISTINCT pl.id), 0) * 5 +
    COALESCE(COUNT(DISTINCT c.id), 0) * 10 +
    COALESCE(COUNT(DISTINCT ps.id), 0) * 15
  ), 2) as avg_engagement_score,
  MAX(p.created_at) as latest_post_time,
  MIN(p.created_at) as oldest_post_time
FROM posts p
LEFT JOIN post_likes pl ON p.id = pl.post_id AND pl.deleted_at IS NULL
LEFT JOIN comments c ON p.id = c.post_id AND c.deleted_at IS NULL
LEFT JOIN post_shares ps ON p.id = ps.post_id AND ps.deleted_at IS NULL
WHERE p.deleted_at IS NULL;

GRANT SELECT ON mv_newsfeed_stats TO anon, authenticated;

-- ============================================================================
-- 4. TRIGGER - Auto-update engagement_score dans users
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_engagement_score()
RETURNS TRIGGER AS $$
DECLARE
  new_engagement_score INTEGER;
BEGIN
  -- Calculer le score d'engagement de l'utilisateur
  SELECT COALESCE(SUM(
    (SELECT COALESCE(COUNT(*), 0) FROM post_likes WHERE user_id = NEW.user_id) * 5 +
    (SELECT COALESCE(COUNT(*), 0) FROM comments WHERE user_id = NEW.user_id) * 10 +
    (SELECT COALESCE(COUNT(*), 0) FROM post_shares WHERE user_id = NEW.user_id) * 15
  ), 0)
  INTO new_engagement_score;

  -- Mettre à jour le score dans la table users
  UPDATE users
  SET engagement_score = new_engagement_score
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencher lors de nouvelles interactions
CREATE TRIGGER tr_post_liked
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_user_engagement_score();

CREATE TRIGGER tr_comment_created
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_user_engagement_score();

CREATE TRIGGER tr_post_shared
  AFTER INSERT ON post_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_user_engagement_score();

-- ============================================================================
-- 5. FONCTION - Get newsfeed avec pagination keyset
-- ============================================================================

CREATE OR REPLACE FUNCTION get_newsfeed_ranked(
  p_limit INTEGER DEFAULT 20,
  p_cursor_created_at TIMESTAMP DEFAULT NULL,
  p_cursor_id UUID DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  content TEXT,
  created_at TIMESTAMP,
  email VARCHAR,
  full_name VARCHAR,
  avatar_url TEXT,
  likes_count BIGINT,
  comments_count BIGINT,
  shares_count BIGINT,
  relevance_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.user_id,
    v.content,
    v.created_at,
    v.email,
    v.full_name,
    v.avatar_url,
    v.likes_count,
    v.comments_count,
    v.shares_count,
    v.relevance_score
  FROM v_newsfeed_ranked v
  WHERE 
    -- Keyset pagination (éviter offset lent)
    (p_cursor_created_at IS NULL OR v.created_at < p_cursor_created_at OR
     (v.created_at = p_cursor_created_at AND v.id < p_cursor_id))
  ORDER BY v.created_at DESC, v.id DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. FONCTION - Get trending posts
-- ============================================================================

CREATE OR REPLACE FUNCTION get_trending_posts(
  p_hours INTEGER DEFAULT 24,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  content TEXT,
  created_at TIMESTAMP,
  email VARCHAR,
  full_name VARCHAR,
  likes_count BIGINT,
  comments_count BIGINT,
  shares_count BIGINT,
  relevance_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.user_id,
    v.content,
    v.created_at,
    v.email,
    v.full_name,
    v.likes_count,
    v.comments_count,
    v.shares_count,
    v.relevance_score
  FROM v_newsfeed_ranked v
  WHERE v.created_at > NOW() - (p_hours || ' hours')::INTERVAL
  ORDER BY v.relevance_score DESC, v.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. VERIFY SETUP
-- ============================================================================

-- Vérifier la vue
SELECT * FROM v_newsfeed_ranked LIMIT 5;

-- Vérifier les stats
SELECT * FROM mv_newsfeed_stats;

-- Vérifier les indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public' AND tablename IN ('posts', 'post_likes', 'comments', 'post_shares')
ORDER BY tablename, indexname;
