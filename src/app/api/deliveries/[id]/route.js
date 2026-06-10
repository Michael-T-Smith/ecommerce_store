import pool                        from "@/lib/db";
import { getServerUser }           from "@/lib/getRequestUser";
import { canDo }                   from "@/lib/permissions";
import { ok, badRequest, forbidden, notFound, serverError } from "@/lib/apiHelpers";

export async function PATCH(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                   return forbidden("Not authenticated.");
    if (!canDo(user.role, "delivery", "update")) return forbidden();

    const { id }   = await params;
    const body = await request.json();

    const ALLOWED      = ["status", "driver_id", "delivery_notes", "delivered_at"];
    const camelToSnake = { driverId:"driver_id", deliveryNotes:"delivery_notes",
                           deliveredAt:"delivered_at" };
    const sets = [], values = [];
    let   p    = 1;

    for (const [key, val] of Object.entries(body)) {
      const col = camelToSnake[key] ?? key;
      if (ALLOWED.includes(col)) { sets.push(`${col} = $${p++}`); values.push(val); }
    }

    if (!sets.length) return badRequest("No valid fields provided for update.");

    values.push(id);
    const result = await pool.query(
      `UPDATE deliveries SET ${sets.join(", ")} WHERE id = $${p} RETURNING *`,
      values
    );

    if (result.rowCount === 0) return notFound("Delivery not found.");
    return ok(result.rows[0]);
  } catch (err) {
    return serverError(err, "PATCH /api/deliveries/[id]");
  }
}