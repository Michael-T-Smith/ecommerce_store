import pool                from "@/lib/db";
import { getServerUser }   from "@/lib/getRequestUser";
import { canDo }           from "@/lib/permissions";
import {
  ok, badRequest, forbidden, notFound, serverError,
} from "@/lib/apiHelpers";

export async function PATCH(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                       return forbidden("Not authenticated.");
    if (!canDo(user.role, "collections", "update"))  return forbidden();

    const { id } = await params;
    const body   = await request.json();

    // slug is intentionally excluded — immutable after creation
    const ALLOWED      = ["label", "emoji", "accent_color", "light_text", "headline", "subheadline", "body_copy", "tags", "active", "sort_order"];
    const camelToSnake = {
      accentColor : "accent_color",
      lightText   : "light_text",
      bodyCopy    : "body_copy",
      sortOrder   : "sort_order",
    };

    const sets = [], values = [];
    let p = 1;
    for (const [key, val] of Object.entries(body)) {
      const col = camelToSnake[key] ?? key;
      if (ALLOWED.includes(col)) { sets.push(`${col} = $${p++}`); values.push(val); }
    }
    if (!sets.length) return badRequest("No valid fields provided.");

    sets.push("updated_at = now()");
    values.push(id);
    const result = await pool.query(
      `UPDATE collections SET ${sets.join(", ")} WHERE id = $${p} RETURNING *`,
      values
    );
    if (result.rowCount === 0) return notFound("Collection not found.");
    return ok(result.rows[0]);
  } catch (err) {
    return serverError(err, "PATCH /api/collections/[id]");
  }
}

export async function DELETE(_request, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                       return forbidden("Not authenticated.");
    if (!canDo(user.role, "collections", "delete"))  return forbidden();

    const { id } = await params;

    const colRes = await pool.query("SELECT slug, label FROM collections WHERE id = $1", [id]);
    if (colRes.rowCount === 0) return notFound("Collection not found.");
    const { slug, label } = colRes.rows[0];

    const assigned = await pool.query(
      "SELECT COUNT(*)::int AS n FROM inventory WHERE $1 = ANY(collection_ids)",
      [slug]
    );
    const n = assigned.rows[0].n;
    if (n > 0)
      return badRequest(`${n} item${n !== 1 ? "s are" : " is"} still assigned to "${label}". Remove them from inventory first.`);

    await pool.query("DELETE FROM collections WHERE id = $1", [id]);
    return ok({ deleted: true, id: Number(id) });
  } catch (err) {
    return serverError(err, "DELETE /api/collections/[id]");
  }
}
