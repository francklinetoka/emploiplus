import { pool } from '../backend/src/config/database.js';
(async ()=>{
  try{
    const q = `SELECT id, user_id, title, message, created_at FROM notifications WHERE lower(message) LIKE '%candidat%' OR lower(message) LIKE '%candidature%' ORDER BY created_at DESC LIMIT 200`;
    const { rows } = await pool.query(q);
    console.log('found', rows.length);
    console.log(JSON.stringify(rows, null, 2));
  }catch(e){console.error('ERR', e.stack||e.message||e)}finally{await pool.end()}
})();
