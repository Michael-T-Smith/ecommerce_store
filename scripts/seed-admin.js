// scripts/seed-admin.js
// Interactive script to create the first admin or reset any password.
//
// Usage:
//   node scripts/seed-admin.js
//     → prompts for name, email, password → inserts as admin
//
//   node scripts/seed-admin.js --reset cecilia@lambsflorist.com
//     → prompts for new password → updates hash for that employee

import bcrypt   from "bcryptjs";
import pg       from "pg";
import readline from "readline";
import { config } from "dotenv";

config({ path: ".env.local" });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const rl  = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

const isReset    = process.argv.includes("--reset");
const resetEmail = isReset
  ? process.argv[process.argv.indexOf("--reset") + 1]
  : null;

async function main() {
  try {
    if (isReset) {
      // ── Reset password for existing employee ──────────────────
      if (!resetEmail) {
        console.error("\nUsage: node scripts/seed-admin.js --reset email@lambsflorist.com\n");
        process.exit(1);
      }

      console.log(`\n── Reset password for: ${resetEmail} ───────────────────\n`);
      const newPassword = await ask("New password (min 8 chars): ");

      if (newPassword.length < 8) {
        console.error("Password must be at least 8 characters.\n");
        process.exit(1);
      }

      const hash   = await bcrypt.hash(newPassword, 12);
      const result = await pool.query(
        "UPDATE employees SET password_hash = $1, updated_at = NOW() WHERE email = $2 RETURNING id, name, email, role",
        [hash, resetEmail.trim().toLowerCase()]
      );

      if (result.rowCount === 0) {
        console.error(`\nNo employee found with email: ${resetEmail}`);
        console.error("Check the email address and try again.\n");
        process.exit(1);
      }

      const emp = result.rows[0];
      console.log(`\n✓  Password updated`);
      console.log(`   Name:  ${emp.name}`);
      console.log(`   Email: ${emp.email}`);
      console.log(`   Role:  ${emp.role}\n`);

    } else {
      // ── Create a new admin employee ───────────────────────────
      console.log("\n── Lamb's Florist — Create Admin User ────────────────\n");

      const name     = await ask("Full name:          ");
      const email    = await ask("Email address:      ");
      const password = await ask("Password (min 8):   ");

      if (!name.trim() || !email.trim()) {
        console.error("Name and email are required.\n");
        process.exit(1);
      }
      if (password.length < 8) {
        console.error("Password must be at least 8 characters.\n");
        process.exit(1);
      }

      const hash   = await bcrypt.hash(password, 12);
      const result = await pool.query(
        `INSERT INTO employees (name, email, password_hash, role, status, hire_date)
         VALUES ($1, $2, $3, 'admin', 'active', CURRENT_DATE)
         ON CONFLICT (email) DO UPDATE
           SET password_hash = EXCLUDED.password_hash,
               role          = 'admin',
               status        = 'active',
               updated_at    = NOW()
         RETURNING id, name, email, role`,
        [name.trim(), email.trim().toLowerCase(), hash]
      );

      const emp = result.rows[0];
      console.log(`\n✓  Admin created (or updated)`);
      console.log(`   ID:    ${emp.id}`);
      console.log(`   Name:  ${emp.name}`);
      console.log(`   Email: ${emp.email}`);
      console.log(`   Role:  ${emp.role}`);
      console.log(`\nSign in at: http://localhost:3000/dashboard/login\n`);
    }

  } catch (err) {
    console.error("\nError:", err.message);
    console.error("Is DATABASE_URL set in .env.local?");
    console.error("Is the Docker container running? (docker compose up -d)\n");
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
  }
}

main();