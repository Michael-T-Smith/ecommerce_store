// src/app/api/auth/login/route.js
//
// POST /api/auth/login
// Verifies staff credentials against the employees table.
// On success: signs a JWT, sets the bity_session cookie, returns user.
// On failure: always returns the same error (prevents email enumeration).
//
// There is no dev credential fallback. If the DB is unreachable, login
// fails cleanly with a 503. Run seed-admin.js to create the first account.

import { NextResponse }                           from "next/server";
import bcrypt                                     from "bcryptjs";
import pool                                       from "@/lib/db";
import { signToken, COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";
import { serverError }                            from "@/lib/apiHelpers";
import { checkRateLimit, recordFailure, resetLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const ip      = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const blocked = checkRateLimit(ip);
    if (blocked) {
      return NextResponse.json({ error: blocked.message }, {
        status : 429,
        headers: { "Retry-After": String(blocked.retryAfter) },
      });
    }

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
      recordFailure(ip);
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    if (!employee.password_hash) {
      recordFailure(ip);
      return NextResponse.json(
        { error: "Account not yet activated. Ask an admin to run the seed script." },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, employee.password_hash);
    if (!valid) {
      recordFailure(ip);
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    resetLimit(ip);

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