
import { NextResponse }          from "next/server";
import pool                      from "@/lib/db";
import { getCustomerSession }    from "@/lib/customerAuth";
import { okList, created, badRequest, serverError } from "@/lib/apiHelpers";

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT id, label, address_line, city, state, zip, is_default, created_at
       FROM customer_addresses
       WHERE customer_id = $1
       ORDER BY is_default DESC, created_at ASC`,
      [session.id]
    );
    return okList(result.rows, result.rowCount);
  } catch (err) {
    return serverError(err, "GET /api/customers/addresses");
  }
}

export async function POST(request) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const body = await request.json();
    const { label, addressLine, city, state, zip, zone, isDefault } = body;

    if (!addressLine || !city || !zip) {
      return badRequest("Address line, city, and zip are required.");
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      if (isDefault) {
        await client.query(
          "UPDATE customer_addresses SET is_default = FALSE WHERE customer_id = $1",
          [session.id]
        );
      }

      const result = await client.query(
        `INSERT INTO customer_addresses
           (customer_id, label, address_line, city, state, zip, is_default)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
        [session.id, label || "Home", addressLine, city, state || "AL", zip, isDefault || false]
      );

      await client.query("COMMIT");
      return created(result.rows[0]);
    } catch (txErr) {
      await client.query("ROLLBACK");
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err) {
    return serverError(err, "POST /api/customers/addresses");
  }
}