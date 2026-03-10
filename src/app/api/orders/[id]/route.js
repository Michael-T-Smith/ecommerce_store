// src/app/api/orders/[id]/route.js
//
// GET   /api/orders/[id] — full order detail with delivery + driver
// PATCH /api/orders/[id] — advance status, update staff_notes, or cancel
//
// Status transitions are strictly validated against VALID_TRANSITIONS.
// Cancellation requires delete permission (admin only).

import pool               from "@/lib/db";
import { getRequestUser } from "@/lib/getRequestUser";
import { canDo }          from "@/lib/permissions";
import {
  ok, badRequest, forbidden, notFound, serverError,
} from "@/lib/apiHelpers";

const VALID_TRANSITIONS = {
  pending         : ["confirmed", "cancelled"],
  confirmed       : ["preparing", "cancelled"],
  preparing       : ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered       : [],
  cancelled       : [],
};

export async function GET(request, { params }) {
  try {
    const id     = parseInt(params.id);
    const result = await pool.query(
      `SELECT o.*,
              d.id          AS delivery_id,
              d.status      AS delivery_status,
              d.driver_id,
              e.name        AS driver_name
       FROM   orders o
       LEFT JOIN deliveries d ON d.order_id = o.id
       LEFT JOIN employees  e ON e.id = d.driver_id
       WHERE  o.id = $1`,
      [id]
    );
    if (result.rowCount === 0) return notFound("Order not found.");
    return ok(result.rows[0]);
  } catch (err) {
    return serverError(err, "GET /api/orders/[id]");
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = getRequestUser(request);
    if (!canDo(user.role, "orders", "update")) return forbidden();

    const id   = parseInt(params.id);
    const body = await request.json();

    // Validate status transition
    if (body.status) {
      const current = await pool.query(
        "SELECT status FROM orders WHERE id = $1",
        [id]
      );
      if (current.rowCount === 0) return notFound("Order not found.");

      const currentStatus = current.rows[0].status;
      const allowed       = VALID_TRANSITIONS[currentStatus] ?? [];

      if (!allowed.includes(body.status)) {
        return badRequest(
          `Cannot transition from '${currentStatus}' to '${body.status}'.`
        );
      }

      if (body.status === "cancelled" && !canDo(user.role, "orders", "delete")) {
        return forbidden("Only admins can cancel orders.");
      }
    }

    const ALLOWED = ["status", "staff_notes", "stripe_payment_id"];
    const sets    = [];
    const values  = [];
    let   p       = 1;

    for (const [key, val] of Object.entries(body)) {
      const col = key === "staffNotes"       ? "staff_notes"
                : key === "stripePaymentId"  ? "stripe_payment_id"
                : key;
      if (ALLOWED.includes(col)) {
        sets.push(`${col} = $${p++}`);
        values.push(val);
      }
    }

    if (sets.length === 0) return badRequest("No valid fields to update.");

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