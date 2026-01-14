import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:1414@localhost:5432/emploi_plus_db_cg';
const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000 });

(async () => {
  console.log('Testing DB connection using connection string:', connectionString.replace(/:\/\/.+?:.+?@/, '://<user>:<pass>@'));
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL successfully');
    const { rows } = await client.query("SELECT 1 as ok, NOW() as now");
    console.log('Test query result:', rows);
    client.release();
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Failed to connect to PostgreSQL:', err && err.message ? err.message : err);
    try { await pool.end(); } catch (e) {}
    process.exit(2);
  }
})();
