// src/lib/db.js
//
// Database access via @neondatabase/serverless (HTTP transport).
// Each query is a lightweight HTTP request to Neon — no persistent TCP
// connections, no pool exhaustion on the hobby tier.
//
// pool  — default export; drop-in for all existing pool.query() callers.
// sql   — named export; raw NeonQueryFunction for sql.transaction() in routes
//         that need multi-statement atomicity.
//
// Prerequisites:
//   DATABASE_URL set in .env.local / Vercel environment variables

import { neon } from "@neondatabase/serverless";

// fullResults: true → returns { rows, rowCount, fields } like pg, instead of a raw Row[] array.
export const sql = neon(process.env.DATABASE_URL, { fullResults: true });

// sql.query() returns a pg-compatible { rows, rowCount, fields } result natively.
const pool = {
  query: (text, values) => sql.query(text, values ?? []),
};

export default pool;
