import { pool } from '../backend/src/config/database.js';

async function run() {
  try {
    const userId = 12; // from comp_res.json earlier
    console.log('Testing for userId', userId);
    const { rows: companyInfo } = await pool.query('SELECT company_name FROM users WHERE id = $1 LIMIT 1', [userId]);
    const companyName = companyInfo && companyInfo[0] ? companyInfo[0].company_name : null;
    console.log('companyName:', companyName);
    const q = `SELECT ja.*, j.title as job_title, u.full_name as applicant_name, u.email as applicant_email
       FROM job_applications ja
       LEFT JOIN jobs j ON j.id = ja.job_id
       LEFT JOIN users u ON u.id = ja.applicant_id
       WHERE (ja.company_id = $1)
         OR (j.company_id = $1)
         OR (j.company IS NOT NULL AND $2 IS NOT NULL AND lower(trim(j.company)) = lower(trim($2)))
       ORDER BY ja.created_at DESC`;
    const { rows } = await pool.query(q, [userId, companyName]);
    console.log('rows len', rows.length);
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error('QUERY_ERROR', e.stack || e.message || e);
  } finally {
    await pool.end();
  }
}

run();
