import pool                        from "@/lib/db";
import { getServerUser }           from "@/lib/getRequestUser";
import { canDo }                   from "@/lib/permissions";
import { okList, created, forbidden, serverError } from "@/lib/apiHelpers";

export async function GET(request) {
  try {
    const user = await getServerUser();
    if (!user)                                return forbidden("Not authenticated.");
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

    const where  = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT d.id, d.order_id, d.zone, d.address,
              d.scheduled_date, d.scheduled_window,
              d.status, d.delivery_notes, d.delivered_at,
              d.created_at, d.updated_at,
              o.order_number, o.customer_name,
              e.name AS driver_name
       FROM deliveries d
       LEFT JOIN orders    o ON o.id = d.order_id
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

export async function POST(request) {
  try {
    const user = await getServerUser();
    if (!user)                                  return forbidden("Not authenticated.");
    if (!canDo(user.role, "delivery", "create")) return forbidden();

    const body = await request.json();
    const { orderId, zone, address, scheduledDate, scheduledWindow, deliveryNotes } = body;

    const result = await pool.query(
      `INSERT INTO deliveries (order_id, zone, address, scheduled_date, scheduled_window, delivery_notes)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [orderId, zone, address, scheduledDate, scheduledWindow || null, deliveryNotes || null]
    );

    return created(result.rows[0]);
  } catch (err) {
    return serverError(err, "POST /api/deliveries");
  }
}