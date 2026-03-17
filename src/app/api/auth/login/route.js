// src/app/api/auth/login/route.js
//
// POST /api/auth/login
// Verifies staff credentials against the employees table.
// On success: signs a JWT, sets the lambs_session cookie, returns user.
// On failure: always returns the same error (prevents email enumeration).
//
// There is no dev credential fallback. If the DB is unreachable, login
// fails cleanly with a 503. Run seed-admin.js to create the first account.

import { NextResponse }                           from "next/server";
import bcrypt                                     from "bcryptjs";
import pool                                       from "@/lib/db";
import { signToken, COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";
import { serverError }                            from "@/lib/apiHelpers";

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

    const result   = await pool.query(
      `SELECT id, name, email, role, password_hash, status
       FROM employees
       WHERE email = $1
       LIMIT 1`,
      [email]
    );

    const employee = result.rows[0];
    if (!employee || employee.status !== "active") {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    if (!employee.password_hash) {
      return NextResponse.json(
        { error: "Account not yet activated. Ask an admin to run the seed script." },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, employee.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const user = {
      id   : employee.id,
      name : employee.name,
      email: employee.email,
      role : employee.role,
    };

    const token    = await signToken(user);
    const response = NextResponse.json({ user }, { status: 200 });
    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    return response;

  } catch (err) {
    // DB not reachable
    if (err.code === "ECONNREFUSED" || err.message?.includes("connect")) {
      return NextResponse.json(
        { error: "Database unavailable. Please try again shortly." },
        { status: 503 }
      );
    }
    return serverError(err, "POST /api/auth/login");
  }
}