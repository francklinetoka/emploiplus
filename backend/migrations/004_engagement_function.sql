-- Function pour incrémenter engagement_score
CREATE OR REPLACE FUNCTION increment_engagement(user_id UUID, points_earned INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET engagement_score = COALESCE(engagement_score, 0) + points_earned,
      last_activity_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Ou avec integer ID si les IDs ne sont pas UUID:
-- CREATE OR REPLACE FUNCTION increment_engagement(user_id INTEGER, points_earned INTEGER)
-- RETURNS VOID AS $$
-- BEGIN
--   UPDATE users 
--   SET engagement_score = COALESCE(engagement_score, 0) + points_earned,
--       last_activity_at = NOW()
--   WHERE id = user_id;
-- END;
-- $$ LANGUAGE plpgsql;
