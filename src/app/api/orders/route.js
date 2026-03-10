// src/app/api/orders/route.js
//
// GET  /api/orders — list orders with optional filters
// POST /api/orders — create order + delivery row in one transaction

import pool               from "@/lib/db";
import { getRequestUser } from "@/lib/getRequestUser";
import { canDo }          from "@/lib/permissions";
import {
  okList, created, badRequest, forbidden, serverError,
} from "@/lib/apiHelpers";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const zone   = searchParams.get("zone");
    const search = searchParams.get("search");
    const date   = searchParams.get("date");

    const conditions = [];
    const params     = [];
    let   p          = 1;

    if (status && status !== "all") {
      conditions.push(`o.status = $${p++}`);
      params.push(status);
    }
    if (zone) {
      conditions.push(`o.delivery_zone = $${p++}`);
      params.push(zone);
    }
    if (date) {
      conditions.push(`o.delivery_date = $${p++}`);
      params.push(date);
    }
    if (search) {
      conditions.push(`(o.order_number ILIKE $${p} OR o.customer_name ILIKE $${p})`);
      params.push(`%${search}%`);
      p++;
    }

    const where  = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT o.id, o.order_number, o.customer_name, o.customer_email,
              o.customer_phone, o.items, o.subtotal, o.delivery_fee, o.total,
              o.status, o.delivery_address, o.delivery_zone, o.delivery_date,
              o.delivery_window, o.note_message, o.staff_notes,
              o.stripe_payment_id, o.created_at, o.updated_at
       FROM orders o
       ${where}
       ORDER BY o.created_at DESC`,
      params
    );

    return okList(result.rows, result.rowCount);
  } catch (err) {
    return serverError(err, "GET /api/orders");
  }
}

export async function POST(request) {
  try {
    const user = getRequestUser(request);
    if (!canDo(user.role, "orders", "create")) return forbidden();

    const body = await request.json();
    const {
      customerName, customerEmail, customerPhone,
      items, subtotal, deliveryFee, total,
      deliveryAddress, deliveryZone, deliveryDate,
      deliveryWindow, noteMessage,
    } = body;

    if (!customerName || !items?.length || !deliveryAddress || !deliveryZone || !deliveryDate) {
      return badRequest("customerName, items, deliveryAddress, deliveryZone, and deliveryDate are required.");
    }

    // Generate order number: LF-YYYY-XXXX
    const year        = new Date().getFullYear();
    const countResult = await pool.query("SELECT COUNT(*) FROM orders");
    const count       = parseInt(countResult.rows[0].count) + 1;
    const orderNumber = `LF-${year}-${String(count).padStart(4, "0")}`;

    // Transaction: insert order + delivery atomically
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const orderResult = await client.query(
        `INSERT INTO orders
           (order_number, customer_name, customer_email, customer_phone,
            items, subtotal, delivery_fee, total, delivery_address,
            delivery_zone, delivery_date, delivery_window, note_message)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING *`,
        [
          orderNumber,
          customerName,
          customerEmail  || null,
          customerPhone  || null,
          JSON.stringify(items),
          Number(subtotal),
          Number(deliveryFee) || 0,
          Number(total),
          deliveryAddress,
          deliveryZone,
          deliveryDate,
          deliveryWindow || "afternoon",
          noteMessage    || null,
        ]
      );

      const order = orderResult.rows[0];

      // Delivery row created immediately — status: 'scheduled'
      await client.query(
        `INSERT INTO deliveries
           (order_id, zone, address, scheduled_date, scheduled_window)
         VALUES ($1,$2,$3,$4,$5)`,
        [order.id, deliveryZone, deliveryAddress, deliveryDate, deliveryWindow || "afternoon"]
      );

      await client.query("COMMIT");
      return created(order);

    } catch (txErr) {
      await client.query("ROLLBACK");
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err) {
    return serverError(err, "POST /api/orders");
  }
}