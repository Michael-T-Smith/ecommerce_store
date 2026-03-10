import { NextResponse }          from "next/server";
import pool                      from "@/lib/db";
import { getCustomerSession }    from "@/lib/customerAuth";
import { okList, serverError }   from "@/lib/apiHelpers";

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT id, order_number, customer_name, items, subtotal,
              delivery_fee, total, status, delivery_address,
              delivery_zone, delivery_date, delivery_window,
              note_message, stripe_payment_id, created_at
       FROM   orders
       WHERE  customer_id = $1
          OR  (customer_id IS NULL AND customer_email = $2)
       ORDER  BY created_at DESC`,
      [session.id, session.email]
    );

    return okList(result.rows, result.rowCount);
  } catch (err) {
    return serverError(err, "GET /api/customers/orders");
  }
}
