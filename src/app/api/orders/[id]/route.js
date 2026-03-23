import pool                        from "@/lib/db";
import { getServerUser }           from "@/lib/getRequestUser";
import { canDo }                   from "@/lib/permissions";
import { ok, badRequest, forbidden, notFound, serverError } from "@/lib/apiHelpers";

export async function GET(_request, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                               return forbidden("Not authenticated.");
    if (!canDo(user.role, "orders", "read")) return forbidden();

    const result = await pool.query(
      `SELECT order_number, customer_name, customer_email, customer_phone,
              items, subtotal, delivery_fee, total,
              delivery_address, delivery_zone, delivery_date, delivery_window,
              note_message, status, staff_notes, stripe_payment_id,
              customer_id, created_at, updated_at
       FROM orders WHERE order_number = $1`,
      [params.id]
    );

    if (result.rowCount === 0) return notFound("Order not found.");
    return ok(result.rows[0]);
  } catch (err) {
    return serverError(err, "GET /api/orders/[id]");
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getServerUser();
    const { id } = await params;
    if (!user)                                 return forbidden("Not authenticated.");
    if (!canDo(user.role, "orders", "update")) return forbidden();

    const body = await request.json();
    const isElevated   = user.role === "admin" || user.role === "manager";
    const ALLOWED      = isElevated
      ? ["status", "staff_notes", "stripe_payment_id", "delivery_date", "delivery_window", "delivery_address", "pickup_location"]
      : ["status", "staff_notes", "stripe_payment_id"];
    const camelToSnake = {
      staffNotes      : "staff_notes",
      stripePaymentId : "stripe_payment_id",
      deliveryDate    : "delivery_date",
      deliveryWindow  : "delivery_window",
      deliveryAddress : "delivery_address",
      pickupLocation  : "pickup_location",
    };

    const sets = [], values = [];
    let   p    = 1;

    for (const [key, val] of Object.entries(body)) {
      const col = camelToSnake[key] ?? key;
      if (ALLOWED.includes(col)) { sets.push(`${col} = $${p++}`); values.push(val); }
    }

    if (!sets.length) return badRequest("No valid fields provided for update.");
    
    values.push(id);
    const result = await pool.query(
      `UPDATE orders SET ${sets.join(", ")} WHERE id = $${p} RETURNING *`,
      values
    );

    if (result.rowCount === 0) return notFound("Order not found.");
    return ok(result.rows[0]);
  } catch (err) {
    return serverError(err, "PATCH /api/orders/[id]");
  }
}