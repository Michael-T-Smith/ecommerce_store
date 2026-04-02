import pool                        from "@/lib/db";
import { getServerUser }           from "@/lib/getRequestUser";
import { canDo }                   from "@/lib/permissions";
import { ok, okList, created, badRequest, forbidden, serverError } from "@/lib/apiHelpers";

export async function GET(request) {
  try {
    const user = await getServerUser();
    if (!user)                               return forbidden("Not authenticated.");
    if (!canDo(user.role, "orders", "read")) return forbidden();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const from   = searchParams.get("from");
    const to     = searchParams.get("to");
    const type   = searchParams.get("type"); // 'delivery' | 'pickup'

    const conditions = [];
    const params     = [];
    let   p          = 1;

    if (status) { conditions.push(`status = $${p++}`);                    params.push(status); }
    if (from)   { conditions.push(`delivery_date >= $${p++}`);            params.push(from);   }
    if (to)     { conditions.push(`delivery_date <= $${p++}`);            params.push(to);     }
    if (type)   { conditions.push(`fulfillment_type = $${p++}`);          params.push(type);   }

    const where  = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT id, order_number, customer_name, customer_email, customer_phone,
              items, subtotal, delivery_fee, processing_fee, total,
              fulfillment_type, delivery_address, delivery_zone,
              delivery_date, delivery_window, pickup_time, pickup_location,
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
  // Public endpoint for checkout; also accepts authenticated staff orders (no Stripe ID required).
  try {
    const user = await getServerUser();
    const body = await request.json();
    const {
      customerName, customerEmail, customerPhone,
      items, subtotal, deliveryFee, processingFee, total,
      fulfillmentType,
      // delivery fields
      deliveryAddress, deliveryZone, deliveryDate, deliveryWindow,
      // pickup fields
      pickupDate, pickupTime, pickupLocation,
      // shared
      noteMessage, customerId, stripePaymentId,
    } = body;

    // ── Shared validation ────────────────────────────────────────────
    if (!customerName?.trim())
      return badRequest("customerName is required.");
    if (!customerEmail?.trim())
      return badRequest("customerEmail is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
      return badRequest("Invalid email address.");
    if (!items?.length)
      return badRequest("Order must contain at least one item.");
    if (!stripePaymentId && !user)
      return badRequest("stripePaymentId is required — payment must complete before order creation.");

    const type = fulfillmentType === "pickup" ? "pickup" : "delivery";

    // ── Delivery-specific validation ─────────────────────────────────
    if (type === "delivery") {
      if (!deliveryAddress?.trim())
        return badRequest("deliveryAddress is required for delivery orders.");
      if (!deliveryDate)
        return badRequest("deliveryDate is required for delivery orders.");
    }

    // ── Pickup-specific validation ───────────────────────────────────
    if (type === "pickup") {
      if (!pickupDate)
        return badRequest("pickupDate is required for pickup orders.");
      if (!pickupTime)
        return badRequest("pickupTime is required for pickup orders.");
    }

    // ── Generate order number ────────────────────────────────────────
    const year   = new Date().getFullYear();
    const seqRes = await pool.query(
      "SELECT COUNT(*) FROM orders WHERE EXTRACT(YEAR FROM created_at) = $1", [year]
    );
    const orderNumber = `LF-${year}-${String(parseInt(seqRes.rows[0].count) + 1).padStart(4, "0")}`;

    // ── Insert order + delivery row in one transaction ───────────────
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const resolvedPickupLocation = type === "pickup" ? (pickupLocation === "centre" ? "centre" : "piedmont") : null;
      const pickupAddress =
        resolvedPickupLocation === "centre"
          ? "In-Store Pickup — 1470 W Main St, Ste H, Centre, AL 35960"
          : "In-Store Pickup — 211 Memorial Dr, Piedmont, AL 36272";

      const orderRes = await client.query(
        `INSERT INTO orders
           (order_number, customer_name, customer_email, customer_phone,
            items, subtotal, delivery_fee, processing_fee, total,
            fulfillment_type,
            delivery_address, delivery_zone, delivery_date, delivery_window,
            pickup_time, pickup_location, note_message, customer_id, stripe_payment_id,
            status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
         RETURNING *`,
        [
          orderNumber,
          customerName.trim(),
          customerEmail.trim().toLowerCase(),
          customerPhone?.trim() || null,
          JSON.stringify(items),
          Number(subtotal      ?? 0),
          Number(deliveryFee   ?? 0),
          Number(processingFee ?? 0),
          Number(total         ?? 0),
          type,
          // delivery cols — null/default for pickup
          type === "delivery" ? deliveryAddress.trim() : pickupAddress,
          type === "delivery" ? (deliveryZone ?? null) : null,
          type === "delivery" ? deliveryDate  : pickupDate,
          type === "delivery" ? (deliveryWindow || "afternoon") : "afternoon",
          // pickup cols — null for delivery
          type === "pickup"   ? pickupTime         : null,
          type === "pickup"   ? resolvedPickupLocation : null,
          noteMessage?.trim() || null,
          customerId          || null,
          stripePaymentId || "MANUAL",
          "confirmed", // payment already completed — skip 'pending'
        ]
      );

      const order = orderRes.rows[0];

      // Only create a delivery row for delivery orders
      if (type === "delivery") {
        await client.query(
          `INSERT INTO deliveries
             (order_id, zone, address, scheduled_date, scheduled_window)
           VALUES ($1,$2,$3,$4,$5)`,
          [
            order.id,
            deliveryZone,
            deliveryAddress.trim(),
            deliveryDate,
            deliveryWindow || null,
          ]
        );
      }

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