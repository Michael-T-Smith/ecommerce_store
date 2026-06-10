import { NextResponse }   from "next/server";
import bcrypt             from "bcryptjs";
import pool               from "@/lib/db";
import {
  signCustomerToken,
  CUSTOMER_COOKIE_NAME,
  CUSTOMER_COOKIE_OPTIONS,
  CUSTOMER_HINT_COOKIE_NAME,
  CUSTOMER_HINT_COOKIE_OPTIONS,
} from "@/lib/customerAuth";
import { badRequest, serverError } from "@/lib/apiHelpers";
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
      return badRequest("Email and password are required.");
    }

    const result = await pool.query(
      "SELECT id, name, email, phone, password_hash FROM customers WHERE email = $1",
      [email]
    );
    const customer = result.rows[0];

    if (!customer) {
      recordFailure(ip);
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, customer.password_hash);
    if (!valid) {
      recordFailure(ip);
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    resetLimit(ip);

    const token    = await signCustomerToken({
      id   : customer.id,
      name : customer.name,
      email: customer.email,
    });
    const response = NextResponse.json(
      { customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone } },
      { status: 200 }
    );
    response.cookies.set(CUSTOMER_COOKIE_NAME, token, CUSTOMER_COOKIE_OPTIONS);
    response.cookies.set(CUSTOMER_HINT_COOKIE_NAME, encodeURIComponent(customer.name), CUSTOMER_HINT_COOKIE_OPTIONS);
    return response;

  } catch (err) {
    return serverError(err, "POST /api/customers/login");
  }
}