import pool                        from "@/lib/db";
import { getServerUser }           from "@/lib/getRequestUser";
import { canDo }                   from "@/lib/permissions";
import { ok, okList, created, badRequest, forbidden, serverError } from "@/lib/apiHelpers";

export async function GET(request) {
  try {
    const user = await getServerUser();
    if (!user)                              return forbidden("Not authenticated.");
    if (!canDo(user.role, "orders", "read")) return forbidden();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const zone   = searchParams.get("zone");
    const from   = searchParams.get("from");
    const to     = searchParams.get("to");

    const conditions = [];
    const params     = [];
    let   p          = 1;

    if (status) { conditions.push(`status = $${p++}`);          params.push(status); }
    if (zone)   { conditions.push(`delivery_zone = $${p++}`);   params.push(zone);   }
    if (from)   { conditions.push(`delivery_date >= $${p++}`);  params.push(from);   }
    if (to)     { conditions.push(`delivery_date <= $${p++}`);  params.push(to);     }

    const where  = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT order_number, customer_name, customer_email, customer_phone,
              items, subtotal, delivery_fee, total,
              delivery_address, delivery_zone, delivery_date, delivery_window,
              note_message, status, staff_notes, stripe_payment_id,
              customer_id, created_at, updated_at
       FROM orders ${where} ORDER BY created_at DESC`,
      params
    );

    return okList(result.rows, result.rowCount);
  } catch (err) {
    return serverError(err, "GET /api/orders");
  }
}

export async function POST(request) {
  // Public endpoint — no auth required. Used by checkout.
  try {
    const body = await request.json();
    const {
      customerName, customerEmail, customerPhone,
      items, subtotal, deliveryFee, total,
      deliveryAddress, deliveryZone, deliveryDate,
      deliveryWindow, noteMessage, customerId,
    } = body;

    if (!customerName || !customerEmail)
      return badRequest("customerName and customerEmail are required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
      return badRequest("Invalid email address.");
    if (!items?.length)
      return badRequest("Order must contain at least one item.");
    if (!deliveryAddress || !deliveryZone || !deliveryDate)
      return badRequest("deliveryAddress, deliveryZone, and deliveryDate are required.");

    const year   = new Date().getFullYear();
    const seqRes = await pool.query(
      "SELECT COUNT(*) FROM orders WHERE EXTRACT(YEAR FROM created_at) = $1", [year]
    );
    const seq         = parseInt(seqRes.rows[0].count) + 1;
    const orderNumber = `LF-${year}-${String(seq).padStart(4, "0")}`;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const orderRes = await client.query(
        `INSERT INTO orders
           (order_number, customer_name, customer_email, customer_phone,
            items, subtotal, delivery_fee, total,
            delivery_address, delivery_zone, delivery_date, delivery_window,
            note_message, customer_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         RETURNING *`,
        [
          orderNumber,
          customerName.trim(), customerEmail.trim().toLowerCase(),
          customerPhone || null,
          JSON.stringify(items),
          Number(subtotal ?? 0), Number(deliveryFee ?? 0), Number(total ?? 0),
          deliveryAddress.trim(), deliveryZone, deliveryDate,
          deliveryWindow || null, noteMessage || null,
          customerId || null,
        ]
      );

      const order = orderRes.rows[0];

      await client.query(
        `INSERT INTO deliveries (order_id, zone, address, scheduled_date, scheduled_window)
         VALUES ($1,$2,$3,$4,$5)`,
        [order.id, deliveryZone, deliveryAddress.trim(), deliveryDate, deliveryWindow || null]
      );

      await client.query("COMMIT");
      return created(order);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    return serverError(err, "POST /api/orders");
  }
}