// Seeds bcrypt-hashed passwords for the three dev employees.
//
// Prerequisites:
//   1. docker compose up -d          (container running)
//   2. npm install bcryptjs pg dotenv (if not already installed)
//
// Run:
//   node scripts/seed-dev.js
//
// Use seed-admin.js --reset email@company.com to change a single password.

import bcrypt from "bcryptjs";
import pg     from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const DEV_USERS = [
  { email: "admin@email.com", password: "CaptainAdmin1234",    label: "Administrator  (admin)"    }
];

async function main() {
  console.log("\n── Seed Dev Password To Database System ───────────────\n");

  for (const user of DEV_USERS) {
    const hash   = await bcrypt.hash(user.password, 12);
    const result = await pool.query(
      "UPDATE employees SET password_hash = $1 WHERE email = $2 RETURNING name, email, role",
      [hash, user.email]
    );

    if (result.rowCount > 0) {
      const row = result.rows[0];
      console.log(`✓  ${user.label}`);
      console.log(`   email: ${row.email}`);
      console.log(`   password: ${user.password}`);
      console.log();
    } else {
      console.log(`✗  Not found: ${user.email}`);
      console.log(`   Make sure docker compose up -d has run and init.sql seeded.\n`);
    }
  }

  console.log("──────────────────────────────────────────────────────");
  console.log("Done. Sign in at: http://localhost:3000/dashboard/login");
  console.log("Remember to change all passwords before go-live.\n");

  await pool.end();
}

main().catch((err) => {
  console.error("\nSeed error:", err.message);
  console.error("Is DATABASE_URL set in .env.local?");
  console.error("Is the Docker container running? (docker compose up -d)\n");
  process.exit(1);
});