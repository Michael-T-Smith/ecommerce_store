import { NextResponse }   from "next/server";
import bcrypt             from "bcryptjs";
import pool               from "@/lib/db";
import {
  signCustomerToken,
  CUSTOMER_COOKIE_NAME,
  CUSTOMER_COOKIE_OPTIONS,
} from "@/lib/customerAuth";
import { created, badRequest, serverError } from "@/lib/apiHelpers";

export async function POST(request) {
  try {
    const body     = await request.json();
    const name     = body.name?.trim();
    const email    = body.email?.trim().toLowerCase();
    const phone    = body.phone?.trim() || null;
    const password = body.password;

    if (!name || !email || !password) {
      return badRequest("Name, email, and password are required.");
    }
    if (password.length < 8) {
      return badRequest("Password must be at least 8 characters.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest("A valid email address is required.");
    }

    const hash   = await bcrypt.hash(password, 12);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `INSERT INTO customers (name, email, phone, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, phone, created_at`,
        [name, email, phone, hash]
      );
      const customer = result.rows[0];

      // Claim guest orders placed with this email before account creation
      await client.query(
        `UPDATE orders
         SET customer_id = $1
         WHERE customer_email = $2
           AND customer_id IS NULL`,
        [customer.id, email]
      );

      await client.query("COMMIT");

      const token    = await signCustomerToken({
        id   : customer.id,
        name : customer.name,
        email: customer.email,
      });
      const response = NextResponse.json(
        { customer: { id: customer.id, name: customer.name, email: customer.email } },
        { status: 201 }
      );
      response.cookies.set(CUSTOMER_COOKIE_NAME, token, CUSTOMER_COOKIE_OPTIONS);
      return response;

    } catch (txErr) {
      await client.query("ROLLBACK");
      throw txErr;
    } finally {
      client.release();
    }

  } catch (err) {
    if (err.code === "23505") {
      return badRequest("An account with that email already exists. Please sign in.");
    }
    return serverError(err, "POST /api/customers/register");
  }
}