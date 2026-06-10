import pool                        from "@/lib/db";
import { getServerUser }           from "@/lib/getRequestUser";
import { canDo }                   from "@/lib/permissions";
import { sendOrderConfirmation }   from "@/lib/email";
import { ok, okList, created, badRequest, forbidden, serverError } from "@/lib/apiHelpers";
import { checkLimit }              from "@/lib/rateLimit";
import { NextResponse }            from "next/server";

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
    const ip      = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const limited = checkLimit(ip, "orders:post", 5, 15 * 60 * 1000);
    if (limited) return NextResponse.json({ error: limited.message }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });

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

    // ── Shipping validation ──────────────────────────────────────────
    if (!deliveryAddress?.trim())
      return badRequest("deliveryAddress is required.");

    // ── Generate order number ────────────────────────────────────────
    const year   = new Date().getFullYear();
    const seqRes = await pool.query(
      "SELECT COUNT(*) FROM orders WHERE EXTRACT(YEAR FROM created_at) = $1", [year]
    );
    const orderNumber = `BB-${year}-${String(parseInt(seqRes.rows[0].count) + 1).padStart(4, "0")}`;

    // ── Insert order ─────────────────────────────────────────────────
    const orderRes = await pool.query(
      `INSERT INTO orders
         (order_number, customer_name, customer_email, customer_phone,
          items, subtotal, delivery_fee, processing_fee, total,
          fulfillment_type, delivery_address, delivery_zone,
          delivery_date, delivery_window,
          note_message, customer_id, stripe_payment_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
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
        "delivery",
        deliveryAddress.trim(),
        null,
        null,
        "afternoon",
        noteMessage?.trim() || null,
        customerId          || null,
        stripePaymentId || "MANUAL",
        "confirmed",
      ]
    );
    const order = orderRes.rows[0];

    // Fire confirmation email — non-fatal, never blocks the order response
    sendOrderConfirmation(order).catch((e) =>
      console.error("[orders] email failed:", e.message)
    );

    return created(order);
  } catch (err) {
    return serverError(err, "POST /api/orders");
  }
}