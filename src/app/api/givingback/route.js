import pool                        from "@/lib/db";
import { getServerUser }           from "@/lib/getRequestUser";
import { canDo }                   from "@/lib/permissions";
import { GIVING_BACK_MOCK }        from "@/lib/givingBackData";
import {
  ok, okList, created, badRequest, forbidden, serverError,
} from "@/lib/apiHelpers";

// ── GET /api/givingback ───────────────────────────────────────────
// Dashboard (authed): returns all items ordered by sort_order.
// Public pages query pool directly with active=true filter.
export async function GET() {
  try {
    const user = await getServerUser();
    if (!user)                                   return forbidden("Not authenticated.");
    if (!canDo(user.role, "givingback", "read")) return forbidden();

    const result = await pool.query(
      `SELECT id, title, description, impact_statement,
              emoji, active, sort_order, created_at, updated_at
       FROM giving_back
       ORDER BY sort_order ASC, created_at ASC`
    );
    return okList(result.rows, result.rowCount);
  } catch {
    return okList(GIVING_BACK_MOCK, GIVING_BACK_MOCK.length);
  }
}

// ── POST /api/givingback ──────────────────────────────────────────
export async function POST(request) {
  try {
    const user = await getServerUser();
    if (!user)                                     return forbidden("Not authenticated.");
    if (!canDo(user.role, "givingback", "create")) return forbidden();

    const { title, description, impact_statement, emoji, active, sort_order } = await request.json();

    if (!title?.trim())       return badRequest("Title is required.");
    if (!description?.trim()) return badRequest("Description is required.");

    const result = await pool.query(
      `INSERT INTO giving_back
         (title, description, impact_statement, emoji, active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        title.trim(),
        description.trim(),
        impact_statement?.trim() || null,
        emoji?.trim() || "🌱",
        active !== false,
        sort_order ?? 0,
      ]
    );
    return created(result.rows[0]);
  } catch (err) {
    return serverError(err, "POST /api/givingback");
  }
}
