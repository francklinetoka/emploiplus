// backend/src/config/database.ts
import { Pool } from "pg";

export const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "emploi_plus_db_cg",
  user: "postgres",
  password: "1414",
});

pool.on("connect", () => console.log("PostgreSQL connecté"));
pool.on("error", (err) => console.error("Erreur DB:", err));