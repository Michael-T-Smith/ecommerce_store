import pool                        from "@/lib/db";
import { getServerUser }           from "@/lib/getRequestUser";
import { canDo }                   from "@/lib/permissions";
import {
  ok, badRequest, forbidden, notFound, serverError,
} from "@/lib/apiHelpers";

// ── PATCH /api/givingback/[id] ────────────────────────────────────
export async function PATCH(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                     return forbidden("Not authenticated.");
    if (!canDo(user.role, "givingback", "update")) return forbidden();

    const id     = parseInt(params.id, 10);
    const fields = await request.json();

    const setClauses = [];
    const values     = [];
    let   p          = 1;

    if (fields.title            !== undefined) { setClauses.push(`title = $${p++}`);            values.push(fields.title.trim());            }
    if (fields.description      !== undefined) { setClauses.push(`description = $${p++}`);      values.push(fields.description.trim());      }
    if (fields.impact_statement !== undefined) { setClauses.push(`impact_statement = $${p++}`); values.push(fields.impact_statement?.trim() || null); }
    if (fields.emoji            !== undefined) { setClauses.push(`emoji = $${p++}`);            values.push(fields.emoji.trim());            }
    if (fields.active           !== undefined) { setClauses.push(`active = $${p++}`);           values.push(Boolean(fields.active));         }
    if (fields.sort_order       !== undefined) { setClauses.push(`sort_order = $${p++}`);       values.push(parseInt(fields.sort_order, 10)); }

    if (setClauses.length === 0) return badRequest("No fields to update.");

    values.push(id);
    const result = await pool.query(
      `UPDATE giving_back SET ${setClauses.join(", ")} WHERE id = $${p} RETURNING *`,
      values
    );
    if (result.rowCount === 0) return notFound("Initiative not found.");
    return ok(result.rows[0]);
  } catch (err) {
    return serverError(err, `PATCH /api/givingback/${params.id}`);
  }
}

// ── DELETE /api/givingback/[id] ───────────────────────────────────
export async function DELETE(_, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                     return forbidden("Not authenticated.");
    if (!canDo(user.role, "givingback", "delete")) return forbidden();

    const id     = parseInt(params.id, 10);
    const result = await pool.query(
      "DELETE FROM giving_back WHERE id = $1 RETURNING id", [id]
    );
    if (result.rowCount === 0) return notFound("Initiative not found.");
    return ok({ id });
  } catch (err) {
    return serverError(err, `DELETE /api/givingback/${params.id}`);
  }
}
