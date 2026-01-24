/**
 * ============================================================================
 * SQL Optimizations for Emploi+ - Supabase Migrations
 * ============================================================================
 *
 * Ces migrations créent:
 * 1. Vues optimisées pour le newsfeed
 * 2. Indexes pour accélérer les requêtes
 * 3. Tsvector pour la recherche fulltext
 * 4. Trigger pour updater les timestamps
 *
 * À exécuter dans: Supabase SQL Editor
 */

-- ============================================================================
-- 1. NEWSFEED OPTIMIZED VIEW (avec pagination keyset)
-- ============================================================================

CREATE OR REPLACE VIEW v_newsfeed_feed AS
SELECT 
  p.id,
  p.user_id,
  p.content,
  p.created_at,
  p.updated_at,
  p.is_pinned,
  
  -- Compteurs
  COALESCE(l.likes_count, 0) as likes_count,
  COALESCE(c.comments_count, 0) as comments_count,
  COALESCE(sh.shares_count, 0) as shares_count,
  
  -- Informations utilisateur (denormalisé pour performance)
  u.email,
  u.full_name,
  u.avatar_url,
  u.role,
  
  -- Informations entreprise si C'est un post d'entreprise
  comp.company_name,
  comp.logo_url,
  
  -- Richement pour le tri/filtrage
  CASE 
    WHEN p.is_pinned THEN 0
    WHEN EXTRACT(EPOCH FROM (NOW() - p.created_at)) < 3600 THEN 1  -- < 1h = très récent
    WHEN EXTRACT(EPOCH FROM (NOW() - p.created_at)) < 86400 THEN 2 -- < 1j = récent
    ELSE 3
  END as recency_score
  
FROM posts p
LEFT JOIN users u ON p.user_id = u.id
LEFT JOIN companies comp ON u.company_id = comp.id
LEFT JOIN (
  SELECT post_id, COUNT(*) as likes_count
  FROM post_likes
  GROUP BY post_id
) l ON p.id = l.post_id
LEFT JOIN (
  SELECT post_id, COUNT(*) as comments_count
  FROM comments
  GROUP BY post_id
) c ON p.id = c.post_id
LEFT JOIN (
  SELECT post_id, COUNT(*) as shares_count
  FROM post_shares
  GROUP BY post_id
) sh ON p.id = sh.post_id
WHERE p.deleted_at IS NULL
AND u.active = true;

-- Grant permissions
GRANT SELECT ON v_newsfeed_feed TO anon, authenticated;

-- ============================================================================
-- 2. CANDIDATE JOB MATCHES VIEW (avec score de matching)
-- ============================================================================

CREATE OR REPLACE VIEW v_candidate_job_matches AS
SELECT 
  c.id as candidate_id,
  c.email,
  c.full_name,
  c.skills,
  c.experience_level,
  j.id as job_id,
  j.title as job_title,
  j.company_id,
  comp.company_name,
  j.required_skills,
  j.salary_min,
  j.salary_max,
  
  -- Match score calculation
  (
    ARRAY_LENGTH(
      ARRAY(
        SELECT UNNEST(c.skills) 
        INTERSECT 
        SELECT UNNEST(j.required_skills)
      ), 
      1
    ) :: FLOAT / ARRAY_LENGTH(j.required_skills, 1)
  ) * 100 as skill_match_score,
  
  CASE 
    WHEN c.experience_level >= j.experience_level THEN 100
    ELSE 50
  END as experience_match_score,
  
  CASE 
    WHEN (c.target_salary_min IS NULL OR j.salary_min IS NULL) THEN 100
    WHEN c.target_salary_min <= COALESCE(j.salary_max, 999999) THEN 100
    ELSE 50
  END as salary_match_score,
  
  -- Combined score
  ROUND(
    ((
      ARRAY_LENGTH(
        ARRAY(
          SELECT UNNEST(c.skills) 
          INTERSECT 
          SELECT UNNEST(j.required_skills)
        ), 
        1
      ) :: FLOAT / ARRAY_LENGTH(j.required_skills, 1)
    ) * 100 * 0.5) +  -- 50% weight for skills
    (CASE WHEN c.experience_level >= j.experience_level THEN 100 ELSE 50 END * 0.3) +  -- 30% weight for experience
    (CASE WHEN (c.target_salary_min IS NULL OR j.salary_min IS NULL OR c.target_salary_min <= COALESCE(j.salary_max, 999999)) THEN 100 ELSE 50 END * 0.2)  -- 20% weight for salary
  , 1) as overall_match_score,
  
  j.created_at as job_created_at,
  j.status as job_status
  
FROM candidates c
CROSS JOIN jobs j
WHERE j.deleted_at IS NULL
AND j.status = 'active'
AND c.deleted_at IS NULL
AND c.is_active = true;

GRANT SELECT ON v_candidate_job_matches TO anon, authenticated;

-- ============================================================================
-- 3. SEARCH OPTIMIZED VIEW (avec tsvector)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Ajouter colonne tsvector si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='posts' AND column_name='search_vector'
  ) THEN
    ALTER TABLE posts ADD COLUMN search_vector tsvector 
      GENERATED ALWAYS AS (
        setweight(to_tsvector('french', COALESCE(content, '')), 'A') ||
        setweight(to_tsvector('french', COALESCE(title, '')), 'B')
      ) STORED;
  END IF;
END $$;

-- Index sur tsvector pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_posts_search_vector ON posts USING gin(search_vector);

-- Pareil pour les jobs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='jobs' AND column_name='search_vector'
  ) THEN
    ALTER TABLE jobs ADD COLUMN search_vector tsvector 
      GENERATED ALWAYS AS (
        setweight(to_tsvector('french', COALESCE(title, '')), 'A') ||
        setweight(to_tsvector('french', COALESCE(description, '')), 'B') ||
        setweight(to_tsvector('french', COALESCE(location, '')), 'C')
      ) STORED;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_jobs_search_vector ON jobs USING gin(search_vector);

-- ============================================================================
-- 4. PERFORMANCE INDEXES
-- ============================================================================

-- Newsfeed: pagination par created_at + user
CREATE INDEX IF NOT EXISTS idx_posts_created_at_desc 
  ON posts(created_at DESC NULLS LAST, id DESC) 
  WHERE deleted_at IS NULL;

-- Newsfeed: filtrer par pinnés
CREATE INDEX IF NOT EXISTS idx_posts_is_pinned 
  ON posts(is_pinned DESC, created_at DESC) 
  WHERE deleted_at IS NULL AND is_pinned = true;

-- Jobs: recherche par skills et niveau
CREATE INDEX IF NOT EXISTS idx_jobs_required_skills 
  ON jobs USING gin(required_skills) 
  WHERE deleted_at IS NULL AND status = 'active';

CREATE INDEX IF NOT EXISTS idx_jobs_experience_level 
  ON jobs(experience_level) 
  WHERE deleted_at IS NULL AND status = 'active';

-- Candidates: recherche par skills
CREATE INDEX IF NOT EXISTS idx_candidates_skills 
  ON candidates USING gin(skills) 
  WHERE deleted_at IS NULL AND is_active = true;

-- Messages: conversation lookup
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
  ON messages(conversation_id, created_at DESC) 
  WHERE is_deleted = false;

-- Likes/Comments/Shares: compteurs rapides
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id 
  ON post_likes(post_id);

CREATE INDEX IF NOT EXISTS idx_comments_post_id 
  ON comments(post_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_post_shares_post_id 
  ON post_shares(post_id);

-- Notifications: queued/sent
CREATE INDEX IF NOT EXISTS idx_jobs_notification_status 
  ON jobs(notification_status, created_at DESC) 
  WHERE notification_status != 'sent';

-- ============================================================================
-- 5. MATERIALIZED VIEWS (pour les statistiques - refresh quotidien)
-- ============================================================================

-- Stats des candidats (pour insights RH)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_candidate_stats AS
SELECT 
  COUNT(*) as total_candidates,
  COUNT(CASE WHEN is_active THEN 1 END) as active_candidates,
  COUNT(CASE WHEN notifications_enabled THEN 1 END) as notification_enabled,
  ARRAY_AGG(DISTINCT role) as roles,
  MAX(created_at) as latest_signup
FROM candidates
WHERE deleted_at IS NULL;

-- Stats des jobs
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_job_stats AS
SELECT 
  COUNT(*) as total_jobs,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_jobs,
  COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_jobs,
  AVG(ARRAY_LENGTH(required_skills, 1)) as avg_required_skills,
  MIN(salary_min) as min_salary,
  MAX(salary_max) as max_salary
FROM jobs
WHERE deleted_at IS NULL;

-- Index pour les materialized views
CREATE INDEX IF NOT EXISTS idx_mv_candidate_stats ON mv_candidate_stats(total_candidates);
CREATE INDEX IF NOT EXISTS idx_mv_job_stats ON mv_job_stats(total_jobs);

-- ============================================================================
-- 6. TRIGGER: Mettre à jour updated_at automatiquement
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer à tous les tables
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT t.tablename FROM pg_tables t
    WHERE schemaname = 'public' 
    AND EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = t.tablename 
      AND column_name = 'updated_at'
    )
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS tr_update_%s_updated_at ON %I',
      table_name, table_name
    );
    
    EXECUTE format(
      'CREATE TRIGGER tr_update_%s_updated_at 
       BEFORE UPDATE ON %I 
       FOR EACH ROW 
       EXECUTE FUNCTION update_updated_at_column()',
      table_name, table_name
    );
  END LOOP;
END $$;

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) - Assurez qu'elles sont activées
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Candidates: Voir que leur propre profil
CREATE POLICY candidates_self_access 
  ON candidates FOR SELECT 
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

-- Messages: Voir que les messages de mes conversations
CREATE POLICY messages_conversation_access 
  ON messages FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT unnest(participants) FROM conversations WHERE id = conversation_id
    )
  );

-- ============================================================================
-- 8. PERFORMANCE: Refresh materialized views nightly
-- ============================================================================

-- PostgreSQL doesn't have native scheduled jobs, but you can use pg_cron if available
-- Or refresh from your Node.js backend

-- For Supabase cron (if enabled):
-- SELECT cron.schedule('refresh-candidate-stats', '0 2 * * *', 'REFRESH MATERIALIZED VIEW mv_candidate_stats');
-- SELECT cron.schedule('refresh-job-stats', '0 2 * * *', 'REFRESH MATERIALIZED VIEW mv_job_stats');

-- ============================================================================
-- 9. VERIFY SETUP
-- ============================================================================

-- Vérifier les indexes créés
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Vérifier les vues
SELECT schemaname, viewname
FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;
