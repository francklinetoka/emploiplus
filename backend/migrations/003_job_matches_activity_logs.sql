-- Migration 003: Job Matches and Activity Logs tables for microservices
-- This migration creates the necessary tables for job matching and activity scoring

-- Create job_matches table if not exists
CREATE TABLE IF NOT EXISTS job_matches (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  matched_skills TEXT,
  missing_skills TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

-- Create indexes for job_matches
CREATE INDEX IF NOT EXISTS idx_job_matches_job_id ON job_matches(job_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_candidate_id ON job_matches(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_score ON job_matches(match_score DESC);

-- Create activity_logs table if not exists
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50),
  target_type VARCHAR(50),
  target_id INTEGER,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for activity_logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created ON activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- Add columns to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS flag_reason TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS analysis_completed BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS candidates_matched INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS spam_score INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS rank_score INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS engagement_updated_at TIMESTAMP;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMP;

-- Create indexes for posts moderation
CREATE INDEX IF NOT EXISTS idx_posts_is_flagged ON posts(is_flagged);
CREATE INDEX IF NOT EXISTS idx_posts_moderated_at ON posts(moderated_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_rank_score ON posts(rank_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_spam_score ON posts(spam_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_moderation_status ON posts(moderation_status);

-- Add columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP;

-- Create index for users engagement
CREATE INDEX IF NOT EXISTS idx_users_engagement_score ON users(engagement_score DESC);

-- Create trigger to auto-update user engagement_score
CREATE OR REPLACE FUNCTION update_user_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET engagement_score = COALESCE(engagement_score, 0) + NEW.points_earned
  WHERE id = NEW.user_id;
  
  UPDATE users
  SET last_activity_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (to avoid error on re-run)
DROP TRIGGER IF EXISTS trigger_update_user_engagement ON activity_logs;

-- Create trigger
CREATE TRIGGER trigger_update_user_engagement
AFTER INSERT ON activity_logs
FOR EACH ROW
EXECUTE FUNCTION update_user_engagement_score();

-- Grant permissions if using RLS
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for job_matches (users can see matches for jobs they posted)
CREATE POLICY "Users can view job matches for their jobs"
  ON job_matches FOR SELECT
  USING (
    job_id IN (SELECT id FROM jobs WHERE company_id = auth.uid())
    OR candidate_id = auth.uid()
  );

-- Create RLS policies for activity_logs (users can only see their own)
CREATE POLICY "Users can view their own activity logs"
  ON activity_logs FOR SELECT
  USING (user_id = auth.uid());

-- Migration complete
SELECT 'Migration 003 completed successfully' as status;
