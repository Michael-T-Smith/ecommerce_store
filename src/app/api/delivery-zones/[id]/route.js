
import pool                from "@/lib/db";
import { getServerUser }   from "@/lib/getRequestUser";
import { canDo }           from "@/lib/permissions";
import {
  ok, badRequest, forbidden, notFound, serverError,
} from "@/lib/apiHelpers";
 
export async function PATCH(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                   return forbidden("Not authenticated.");
    if (!canDo(user.role, "delivery", "update")) return forbidden();
 
    const { id }   = await params;
    const body = await request.json();
 
    const ALLOWED      = ["label", "fee", "active", "sort_order"];
    const camelToSnake = { sortOrder: "sort_order" };
    const sets = [], values = [];
    let   p    = 1;
 
    for (const [key, val] of Object.entries(body)) {
      const col = camelToSnake[key] ?? key;
      if (ALLOWED.includes(col)) { sets.push(`${col} = $${p++}`); values.push(val); }
    }
 
    if (!sets.length) return badRequest("No valid fields to update.");
    
    values.push(id);
    const result = await pool.query(
      `UPDATE delivery_zones SET ${sets.join(", ")} WHERE id = $${p} RETURNING *`,
      values
    );
 
    if (result.rowCount === 0) return notFound("Zone not found.");
    return ok(result.rows[0]);
  } catch (err) {
    return serverError(err, "PATCH /api/delivery-zones/[id]");
  }
}
 
export async function DELETE(_request, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                   return forbidden("Not authenticated.");
    if (!canDo(user.role, "delivery", "delete")) return forbidden();
 
    const result = await pool.query(
      "DELETE FROM delivery_zones WHERE id = $1 RETURNING id, value, label",
      [parseInt(params.id)]
    );
 
    if (result.rowCount === 0) return notFound("Zone not found.");
    return ok({ deleted: true, ...result.rows[0] });
  } catch (err) {
    return serverError(err, "DELETE /api/delivery-zones/[id]");
  }
}