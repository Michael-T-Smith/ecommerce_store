import pool                        from "@/lib/db";
import { getServerUser }           from "@/lib/getRequestUser";
import { canDo }                   from "@/lib/permissions";
import {
  ok, badRequest, forbidden, notFound, serverError,
} from "@/lib/apiHelpers";

// ── PATCH /api/notes/[id] ─────────────────────────────────────────
export async function PATCH(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                return forbidden("Not authenticated.");
    if (!canDo(user.role, "notes", "update")) return forbidden();

    const id     = parseInt(params.id, 10);
    const fields = await request.json();

    const setClauses = [];
    const values     = [];
    let   p          = 1;

    if (fields.title !== undefined) { setClauses.push(`title = $${p++}`);        values.push(fields.title.trim()); }
    if (fields.body  !== undefined) { setClauses.push(`body = $${p++}`);         values.push(fields.body.trim());  }
    if (fields.excerpt !== undefined) { setClauses.push(`excerpt = $${p++}`);    values.push(fields.excerpt);      }

    if (fields.status !== undefined) {
      const newStatus = fields.status === "published" ? "published" : "draft";
      setClauses.push(`status = $${p++}`);
      values.push(newStatus);
      // Set published_at only on first publish — preserved on subsequent edits
      if (newStatus === "published") {
        setClauses.push(`published_at = COALESCE(published_at, $${p++})`);
        values.push(new Date().toISOString());
      }
    }

    if (setClauses.length === 0) return badRequest("No fields to update.");

    values.push(id);
    const result = await pool.query(
      `UPDATE notes SET ${setClauses.join(", ")} WHERE id = $${p} RETURNING *`,
      values
    );
    if (result.rowCount === 0) return notFound("Note not found.");
    return ok(result.rows[0]);
  } catch (err) {
    return serverError(err, `PATCH /api/notes/${params.id}`);
  }
}

// ── DELETE /api/notes/[id] ────────────────────────────────────────
export async function DELETE(_, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                return forbidden("Not authenticated.");
    if (!canDo(user.role, "notes", "delete")) return forbidden();

    const id     = parseInt(params.id, 10);
    const result = await pool.query("DELETE FROM notes WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) return notFound("Note not found.");
    return ok({ id });
  } catch (err) {
    return serverError(err, `DELETE /api/notes/${params.id}`);
  }
}
