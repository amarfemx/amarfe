#!/usr/bin/env node

/**
 * AMar Fe / ToLove Faith - Database Auto-Provisioner & Migration Runner
 * 
 * Automatically checks and initializes the Supabase PostgreSQL database
 * during deployment / build (e.g. on Netlify, Docker, or Vercel).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load .env or .env.local if present
function loadEnv() {
  const envFiles = [".env.local", ".env", ".env.production"];
  for (const file of envFiles) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.substring(0, eqIdx).trim();
          const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

function getConnectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.POSTGRES_URL) return process.env.POSTGRES_URL;
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL;

  // Derive from Supabase URL & Password if provided
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.env.POSTGRES_PASSWORD;

  if (supabaseUrl && dbPassword) {
    try {
      const urlObj = new URL(supabaseUrl);
      const projectRef = urlObj.hostname.split(".")[0];
      return `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`;
    } catch {
      // Ignore URL parse error
    }
  }

  return null;
}

async function runInitDb() {
  console.log("=================================================");
  console.log("🌹 AMar Fe - Supabase Database Initialization");
  console.log("=================================================");

  const connectionString = getConnectionString();

  if (!connectionString) {
    console.log("⚠️ No DATABASE_URL, POSTGRES_URL or SUPABASE_DB_PASSWORD detected.");
    console.log("ℹ️ Skipping auto-migration during build. You can provide DATABASE_URL in Netlify Environment Variables.");
    return;
  }

  const client = new pg.Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log("🔄 Connecting to Supabase PostgreSQL database...");
    await client.connect();
    console.log("✅ Connected successfully to Supabase database.");

    // Check if tables already exist
    const checkTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'countries';
    `);

    const tableExists = checkTable.rows.length > 0;

    if (tableExists && !process.env.FORCE_MIGRATIONS) {
      console.log("ℹ️ Core tables (public.countries) already exist. Database is up to date.");
      await client.end();
      return;
    }

    console.log("🚀 Initializing database schema from migrations...");

    const migrationsDir = path.join(rootDir, "supabase", "migrations");
    if (fs.existsSync(migrationsDir)) {
      const migrationFiles = fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith(".sql"))
        .sort();

      for (const file of migrationFiles) {
        console.log(`📄 Executing migration: ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
        await client.query(sql);
        console.log(`   ✓ Applied ${file}`);
      }
    } else {
      console.log("⚠️ Migrations directory not found at:", migrationsDir);
    }

    // Run seed data if present
    const seedFile = path.join(rootDir, "supabase", "seed.sql");
    if (fs.existsSync(seedFile)) {
      console.log("🌱 Executing seed data: seed.sql...");
      const seedSql = fs.readFileSync(seedFile, "utf-8");
      await client.query(seedSql);
      console.log("   ✓ Seed data populated successfully.");
    }

    console.log("🎉 AMar Fe database schema and seed data successfully initialized!");
    await client.end();
  } catch (err) {
    console.error("⚠️ Database auto-migration notice:", err.message);
    console.log("ℹ️ Build will continue uninterrupted.");
    try {
      await client.end();
    } catch {
      // Ignore disconnect error
    }
  }
}

runInitDb();
