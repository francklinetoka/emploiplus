import { pool } from '../backend/src/config/database.js';
(async ()=>{
  try{
    const { rows } = await pool.query('SELECT id, job_id, applicant_id, company_id, message, created_at FROM job_applications ORDER BY created_at DESC LIMIT 50');
    console.log('count', rows.length);
    console.log(JSON.stringify(rows, null, 2));
  }catch(e){console.error('ERR', e.stack||e.message||e)}finally{await pool.end()}
})();
