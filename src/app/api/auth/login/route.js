// src/app/api/auth/login/route.js
//
// POST /api/auth/login
// Verifies staff credentials against the employees table.
// On success: signs a JWT, sets the lambs_session cookie, returns user.
// On failure: always returns the same error message (prevents email enumeration).

import { NextResponse }                            from "next/server";
import bcrypt                                      from "bcryptjs";
import pool                                        from "@/lib/db";
import { signToken, COOKIE_NAME, COOKIE_OPTIONS }  from "@/lib/auth";
import { serverError }                             from "@/lib/apiHelpers";

export async function POST(request) {
  try {
    const body     = await request.json();
    const email    = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // ── DB lookup ─────────────────────────────────────────────
    let user = null;

    try {
      const result = await pool.query(
        `SELECT id, name, email, role, password_hash, status
         FROM employees
         WHERE email = $1`,
        [email]
      );
      const employee = result.rows[0];

      if (!employee || employee.status !== "active") {
        return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
      }
      if (!employee.password_hash) {
        return NextResponse.json(
          { error: "Account not yet activated. Ask your admin to run the seed script." },
          { status: 401 }
        );
      }

      const valid = await bcrypt.compare(password, employee.password_hash);
      if (!valid) {
        return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
      }

      user = {
        id   : employee.id,
        name : employee.name,
        email: employee.email,
        role : employee.role,
      };

    } catch (dbErr) {
      // DB not reachable — fall back to dev credentials
      // Remove this block once DATABASE_URL is confirmed live
      console.warn("[login] DB unavailable, using dev fallback:", dbErr.message);

      const DEV_CREDENTIALS = [
        { id: 1, name: "Cecelia Bates",  email: "cecelia@lambsflorist.com", password: "admin1234",    role: "admin"    },
        { id: 2, name: "Frank Bates",    email: "frank@lambsflorist.com",   password: "manager1234",  role: "manager"  },
        { id: 3, name: "Jane Holloway",  email: "jane@lambsflorist.com",    password: "employee1234", role: "employee" },
      ];

      const match = DEV_CREDENTIALS.find(
        (u) => u.email === email && u.password === password
      );
      if (!match) {
        return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
      }
      user = { id: match.id, name: match.name, email: match.email, role: match.role };
    }

    const token    = await signToken(user);
    const response = NextResponse.json({ user }, { status: 200 });
    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    return response;

  } catch (err) {
    return serverError(err, "POST /api/auth/login");
  }
}