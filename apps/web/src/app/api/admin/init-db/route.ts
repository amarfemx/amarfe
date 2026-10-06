import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import pg from "pg";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const authHeader = request.headers.get("authorization");

    // Optional admin key protection
    const adminKey = process.env.ADMIN_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (adminKey && authHeader !== `Bearer ${adminKey}` && body.secret !== adminKey) {
      // In development or when no admin secret is set, allow with warning
      if (process.env.NODE_ENV === "production" && process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const connectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.SUPABASE_DB_URL;

    if (!connectionString) {
      return NextResponse.json(
        { error: "No DATABASE_URL or POSTGRES_URL environment variable configured." },
        { status: 500 }
      );
    }

    const client = new pg.Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });

    await client.connect();

    const rootDir = process.cwd();
    const migrationsDir = path.join(rootDir, "supabase", "migrations");
    const executedMigrations = [];

    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
      for (const file of files) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
        await client.query(sql);
        executedMigrations.push(file);
      }
    }

    // Seed data
    const seedPath = path.join(rootDir, "supabase", "seed.sql");
    let seedApplied = false;
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, "utf-8");
      await client.query(seedSql);
      seedApplied = true;
    }

    await client.end();

    return NextResponse.json({
      success: true,
      message: "Database schema and seed data initialized successfully.",
      migrations: executedMigrations,
      seedApplied,
    });
  } catch (error: any) {
    console.error("[Init DB Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize database." },
      { status: 500 }
    );
  }
}
