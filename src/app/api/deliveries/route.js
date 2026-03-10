// ================================================================
//  FILE: src/app/api/deliveries/route.js
//
//  GET /api/deliveries — list with optional status, date, zone filters
// ================================================================

import pool               from "@/lib/db";
import { getRequestUser } from "@/lib/getRequestUser";
import { canDo }          from "@/lib/permissions";
import { okList, forbidden, serverError } from "@/lib/apiHelpers";

export async function GET(request) {
  try {
    const user = getRequestUser(request);
    if (!canDo(user.role, "delivery", "read")) return forbidden();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const date   = searchParams.get("date");
    const zone   = searchParams.get("zone");

    const conditions = [];
    const params     = [];
    let   p          = 1;

    if (status) { conditions.push(`d.status = $${p++}`);          params.push(status); }
    if (date)   { conditions.push(`d.scheduled_date = $${p++}`);  params.push(date);   }
    if (zone)   { conditions.push(`d.zone = $${p++}`);            params.push(zone);   }

    const where  = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT d.id, d.order_id, d.zone, d.address,
              d.scheduled_date, d.scheduled_window,
              d.status, d.delivery_notes, d.delivered_at,
              d.created_at, d.updated_at,
              o.order_number, o.customer_name,
              d.driver_id, e.name AS driver_name
       FROM   deliveries d
       JOIN   orders     o ON o.id = d.order_id
       LEFT JOIN employees e ON e.id = d.driver_id
       ${where}
       ORDER BY d.scheduled_date ASC, d.scheduled_window ASC`,
      params
    );

    return okList(result.rows, result.rowCount);
  } catch (err) {
    return serverError(err, "GET /api/deliveries");
  }
}


// ================================================================
//  FILE: src/app/api/deliveries/[id]/route.js
//
//  PATCH /api/deliveries/[id] — advance status, assign driver,
//                               update delivery notes.
//  delivered_at is stamped automatically when status → delivered.
// ================================================================

import pool               from "@/lib/db";
import { getRequestUser } from "@/lib/getRequestUser";
import { canDo }          from "@/lib/permissions";
import {
  ok, badRequest, forbidden, notFound, serverError,
} from "@/lib/apiHelpers";

export async function PATCH(request, { params }) {
  try {
    const user = getRequestUser(request);
    if (!canDo(user.role, "delivery", "update")) return forbidden();

    const id   = parseInt(params.id);
    const body = await request.json();

    const sets   = [];
    const values = [];
    let   p      = 1;

    if (body.status !== undefined) {
      sets.push(`status = $${p++}`);
      values.push(body.status);
      if (body.status === "delivered") {
        sets.push(`delivered_at = NOW()`);
      }
    }
    if (body.driverId !== undefined) {
      sets.push(`driver_id = $${p++}`);
      values.push(body.driverId || null);
    }
    if (body.deliveryNotes !== undefined) {
      sets.push(`delivery_notes = $${p++}`);
      values.push(body.deliveryNotes || null);
    }

    if (sets.length === 0) return badRequest("No valid fields to update.");

    values.push(id);
    const result = await pool.query(
      `UPDATE deliveries SET ${sets.join(", ")}
       WHERE id = $${p}
       RETURNING *`,
      values
    );

    if (result.rowCount === 0) return notFound("Delivery not found.");
    return ok(result.rows[0]);
  } catch (err) {
    return serverError(err, "PATCH /api/deliveries/[id]");
  }
}