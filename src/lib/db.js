// src/lib/db.js
//
// PostgreSQL connection pool using node-postgres (pg).
// Singleton pattern — one pool shared across all API route handlers.
//
// Next.js hot-reload in development creates multiple module instances,
// which would exhaust the connection limit without the globalThis guard.
//
// Prerequisites:
//   npm install pg
//   DATABASE_URL set in .env.local
//   docker compose up -d

import { Pool } from "pg";

const globalForPg = globalThis;

const pool =
  globalForPg._pgPool ??
  new Pool({
    connectionString       : process.env.DATABASE_URL,
    max                    : 10,   // conservative for a small machine
    idleTimeoutMillis      : 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg._pgPool = pool;
}

export default pool;