-- Peupler search_vector pour jobs
UPDATE jobs 
SET search_vector = 
  setweight(to_tsvector('french', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('french', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('french', COALESCE(company, '')), 'C');

-- Peupler search_vector pour formations
UPDATE formations 
SET search_vector = 
  setweight(to_tsvector('french', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('french', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('french', COALESCE(category, '')), 'C');

-- Peupler search_vector pour users
UPDATE users 
SET search_vector = 
  setweight(to_tsvector('french', COALESCE(full_name, '') || ' ' || COALESCE(company_name, '')), 'A') ||
  setweight(to_tsvector('french', COALESCE(profession, '') || ' ' || COALESCE(job_title, '')), 'B') ||
  setweight(to_tsvector('french', COALESCE(city, '')), 'C');

-- Vérifier que tout est peuplé
SELECT 'jobs' as table_name, COUNT(*) as total, COUNT(search_vector) as with_vector FROM jobs
UNION ALL
SELECT 'formations', COUNT(*), COUNT(search_vector) FROM formations
UNION ALL
SELECT 'users', COUNT(*), COUNT(search_vector) FROM users;
