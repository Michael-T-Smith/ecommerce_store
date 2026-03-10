import { NextResponse }          from "next/server";
import bcrypt                    from "bcryptjs";
import pool                      from "@/lib/db";
import { getCustomerSession }    from "@/lib/customerAuth";
import { ok, badRequest, serverError } from "@/lib/apiHelpers";

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const [profileRes, addressRes] = await Promise.all([
      pool.query(
        "SELECT id, name, email, phone, created_at FROM customers WHERE id = $1",
        [session.id]
      ),
      pool.query(
        `SELECT id, label, address_line, city, state, zip, zone, is_default
         FROM customer_addresses
         WHERE customer_id = $1
         ORDER BY is_default DESC, created_at ASC`,
        [session.id]
      ),
    ]);

    if (profileRes.rowCount === 0) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    return ok({ ...profileRes.rows[0], addresses: addressRes.rows });
  } catch (err) {
    return serverError(err, "GET /api/customers/me");
  }
}

export async function PATCH(request) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const body   = await request.json();
    const sets   = [];
    const values = [];
    let   p      = 1;

    if (body.name !== undefined) {
      if (!body.name.trim()) return badRequest("Name cannot be empty.");
      sets.push(`name = $${p++}`);
      values.push(body.name.trim());
    }

    if (body.phone !== undefined) {
      sets.push(`phone = $${p++}`);
      values.push(body.phone || null);
    }

    if (body.email !== undefined) {
      const newEmail = body.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        return badRequest("A valid email address is required.");
      }
      const existing = await pool.query(
        "SELECT id FROM customers WHERE email = $1 AND id != $2",
        [newEmail, session.id]
      );
      if (existing.rowCount > 0) return badRequest("That email address is already in use.");
      sets.push(`email = $${p++}`);
      values.push(newEmail);
    }

    if (body.newPassword !== undefined) {
      if (!body.currentPassword) {
        return badRequest("Current password is required to set a new password.");
      }
      if (body.newPassword.length < 8) {
        return badRequest("New password must be at least 8 characters.");
      }
      const current = await pool.query(
        "SELECT password_hash FROM customers WHERE id = $1",
        [session.id]
      );
      const valid = await bcrypt.compare(
        body.currentPassword,
        current.rows[0]?.password_hash || ""
      );
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
      }
      const hash = await bcrypt.hash(body.newPassword, 12);
      sets.push(`password_hash = $${p++}`);
      values.push(hash);
    }

    if (sets.length === 0) return badRequest("No valid fields to update.");

    values.push(session.id);
    const result = await pool.query(
      `UPDATE customers SET ${sets.join(", ")}
       WHERE id = $${p}
       RETURNING id, name, email, phone, created_at`,
      values
    );

    return ok(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return badRequest("That email address is already in use.");
    return serverError(err, "PATCH /api/customers/me");
  }
}