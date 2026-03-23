
import { NextResponse }          from "next/server";
import pool                      from "@/lib/db";
import { getCustomerSession }    from "@/lib/customerAuth";
import { ok, badRequest, notFound, serverError } from "@/lib/apiHelpers";

export async function PATCH(request, { params }) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    let n = await params;
    const id   = parseInt(n.id);
    const body = await request.json();
    console.log('/customers/addresses/[id]/', id);
    const owns = await pool.query(
      "SELECT id FROM customer_addresses WHERE id = $1 AND customer_id = $2",
      [id, session.id]
    );
    if (owns.rowCount === 0) return notFound("Address not found.");

    const ALLOWED_MAP = {
      label      : "label",
      addressLine: "address_line",
      city       : "city",
      state      : "state",
      zip        : "zip",
      zone       : "zone",
      isDefault  : "is_default",
    };

    const sets   = [];
    const values = [];
    let   p      = 1;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      if (body.isDefault) {
        await client.query(
          "UPDATE customer_addresses SET is_default = FALSE WHERE customer_id = $1",
          [session.id]
        );
      }

      for (const [key, val] of Object.entries(body)) {
        const col = ALLOWED_MAP[key];
        if (col) { sets.push(`${col} = $${p++}`); values.push(val); }
      }

      if (sets.length === 0) return badRequest("No valid fields to update.");

      values.push(id);
      const result = await client.query(
        `UPDATE customer_addresses SET ${sets.join(", ")} WHERE id = $${p} RETURNING *`,
        values
      );
      await client.query("COMMIT");
      return ok(result.rows[0]);
    } catch (txErr) {
      await client.query("ROLLBACK");
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err) {
    return serverError(err, "PATCH /api/customers/addresses/[id]");
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { id } = await params;
    const result = await pool.query(
      "DELETE FROM customer_addresses WHERE id = $1 AND customer_id = $2 RETURNING id",
      [id, session.id]
    );
    if (result.rowCount === 0) return notFound("Address not found.");
    return ok({ deleted: true, id });
  } catch (err) {
    return serverError(err, "DELETE /api/customers/addresses/[id]");
  }
}