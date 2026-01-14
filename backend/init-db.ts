// Script pour initialiser/corriger la base de données
import { pool } from "./src/config/database.js";
import bcrypt from "bcryptjs";

async function initDatabase() {
  try {
    console.log("🔧 Initialisation de la base de données...\n");

    // 1. Créer/recréer la table users correctement
    console.log("📝 Création de la table users...");
    await pool.query(`DROP TABLE IF EXISTS users CASCADE`);
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        user_type TEXT NOT NULL DEFAULT 'candidate',
        phone TEXT,
        company_name TEXT,
        company_address TEXT,
        profession TEXT,
        job_title TEXT,
        diploma TEXT,
        experience_years INTEGER DEFAULT 0,
        skills JSONB DEFAULT '[]',
        is_verified BOOLEAN DEFAULT false,
        is_blocked BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Table users créée\n");

    // 2. Créer/recréer la table admins
    console.log("📝 Création de la table admins...");
    await pool.query(`DROP TABLE IF EXISTS admins CASCADE`);
    await pool.query(`
      CREATE TABLE admins (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Table admins créée\n");

    // 3. Créer les autres tables si elles n'existent pas
    console.log("📝 Création de la table jobs...");
    await pool.query(`DROP TABLE IF EXISTS jobs CASCADE`);
    await pool.query(`
      CREATE TABLE jobs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT NOT NULL,
        sector TEXT,
        type TEXT NOT NULL,
        salary TEXT,
        description TEXT NOT NULL,
        image_url TEXT,
        published BOOLEAN DEFAULT false,
        published_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Table jobs créée\n");

    console.log("📝 Création de la table formations...");
    await pool.query(`DROP TABLE IF EXISTS formations CASCADE`);
    await pool.query(`
      CREATE TABLE formations (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        level TEXT NOT NULL,
        duration TEXT NOT NULL,
        price TEXT,
        description TEXT NOT NULL,
        image_url TEXT,
        published BOOLEAN DEFAULT false,
        published_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Table formations créée\n");

    console.log("📝 Création de la table portfolios...");
    await pool.query(`DROP TABLE IF EXISTS portfolios CASCADE`);
    await pool.query(`
      CREATE TABLE portfolios (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        project_url TEXT,
        service_category TEXT NOT NULL,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Table portfolios créée\n");

    console.log("📝 Création de la table communication_channels...");
    await pool.query(`DROP TABLE IF EXISTS communication_channels CASCADE`);
    await pool.query(`
      CREATE TABLE communication_channels (
        id SERIAL PRIMARY KEY,
        channel_name TEXT NOT NULL,
        channel_url TEXT NOT NULL,
        channel_type TEXT NOT NULL,
        icon_name TEXT,
        display_order INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Table communication_channels créée\n");

    console.log("📝 Création de la table publications...");
    await pool.query(`DROP TABLE IF EXISTS publications CASCADE`);
    await pool.query(`
      CREATE TABLE publications (
        id SERIAL PRIMARY KEY,
        author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        visibility TEXT DEFAULT 'public',
        hashtags TEXT,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Table publications créée\n");

    console.log("📝 Création de la table user_documents (CVs / Letters)...");
    await pool.query(`DROP TABLE IF EXISTS user_documents CASCADE`);
    await pool.query(`
      CREATE TABLE user_documents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        doc_type TEXT NOT NULL, -- 'cv' or 'letter'
        title TEXT,
        storage_url TEXT, -- where the generated file/content is stored
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Table user_documents créée\n");

    console.log("📝 Création de la table saved_jobs...");
    await pool.query(`DROP TABLE IF EXISTS saved_jobs CASCADE`);
    await pool.query(`
      CREATE TABLE saved_jobs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, job_id)
      )
    `);
    console.log("✅ Table saved_jobs créée\n");

    console.log("📝 Création de la table service_catalogs...");
    await pool.query(`DROP TABLE IF EXISTS service_catalogs CASCADE`);
    await pool.query(`
      CREATE TABLE service_catalogs (
        id SERIAL PRIMARY KEY,
        service_category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10,2) DEFAULT 0,
        currency TEXT DEFAULT 'XAF',
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Table service_catalogs créée\n");

    console.log("📝 Création de la table site_settings...");
    await pool.query(`DROP TABLE IF EXISTS site_settings CASCADE`);
    await pool.query(`
      CREATE TABLE site_settings (
        key TEXT PRIMARY KEY,
        value JSONB
      )
    `);
    console.log("✅ Table site_settings créée\n");

    // 4. Insérer des données de test
    console.log("📝 Insertion de données de test...\n");

    // Super Admin
    const adminPassword = bcrypt.hashSync("admin123", 10);
    await pool.query(
      `INSERT INTO admins (email, password, full_name, role) VALUES ($1, $2, $3, $4)`,
      ["admin@emploi.cg", adminPassword, "Administrateur Principal", "super_admin"]
    );
    console.log("✅ Super Admin créé (admin@emploi.cg / admin123)");

    // Admin contenu
    await pool.query(
      `INSERT INTO admins (email, password, full_name, role) VALUES ($1, $2, $3, $4)`,
      ["contenu@emploi.cg", bcrypt.hashSync("contenu123", 10), "Admin Contenu", "admin_content"]
    );
    console.log("✅ Admin Contenu créé (contenu@emploi.cg / contenu123)");

    // Utilisateurs de test
    const userPassword = bcrypt.hashSync("user123", 10);
    
    // Candidat
    await pool.query(
      `INSERT INTO users (full_name, email, password, user_type, phone, profession) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ["Jean Dupont", "jean@example.com", userPassword, "candidate", "+242 06 123 45 67", "Développeur Full Stack"]
    );
    console.log("✅ Candidat créé (jean@example.com / user123)");

    // Entreprise
    await pool.query(
      `INSERT INTO users (full_name, email, password, user_type, phone, company_name, company_address) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ["Tech Solutions", "contact@techsolutions.com", userPassword, "company", "+242 06 987 65 43", "Tech Solutions SARL", "Brazzaville, Congo"]
    );
    console.log("✅ Entreprise créée (contact@techsolutions.com / user123)");

    // Canaux de communication
    await pool.query(
      `INSERT INTO communication_channels (channel_name, channel_url, channel_type, icon_name, display_order, is_active)
       VALUES 
       ($1, $2, $3, $4, $5, $6),
       ($7, $8, $9, $10, $11, $12),
       ($13, $14, $15, $16, $17, $18),
       ($19, $20, $21, $22, $23, $24)`,
      [
        "WhatsApp", "https://wa.me/242123456789", "whatsapp", "whatsapp", 1, true,
        "Facebook", "https://facebook.com/emploiplus", "facebook", "facebook", 2, true,
        "LinkedIn", "https://linkedin.com/company/emploiplus", "linkedin", "linkedin", 3, true,
        "Journal de l'emploi", "https://journal.emploiplus.cg", "external", "newspaper", 4, true
      ]
    );
    console.log("✅ Canaux de communication créés\n");

    // Réalisations de test
    await pool.query(
      `INSERT INTO portfolios (title, description, image_url, project_url, service_category, featured)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ["Site Web E-commerce", "Plateforme de vente en ligne développée avec React et Node.js", "/images/portfolio1.jpg", "https://example.com", "web-development", true]
    );
    console.log("✅ Portfolio créé\n");

    console.log("🎉 Base de données initialisée avec succès!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation:", error);
    process.exit(1);
  }
}

initDatabase();
