import { NextResponse }   from "next/server";
import bcrypt             from "bcryptjs";
import pool               from "@/lib/db";
import {
  signCustomerToken,
  CUSTOMER_COOKIE_NAME,
  CUSTOMER_COOKIE_OPTIONS,
} from "@/lib/customerAuth";
import { badRequest, serverError } from "@/lib/apiHelpers";

export async function POST(request) {
  try {
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

    // Same error for wrong email or wrong password — never reveal which
    if (!customer) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, customer.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

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
    return response;

  } catch (err) {
    return serverError(err, "POST /api/customers/login");
  }
}