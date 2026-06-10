import pool                        from "@/lib/db";
import { getServerUser }           from "@/lib/getRequestUser";
import { canDo }                   from "@/lib/permissions";
import { NOTES_MOCK }              from "@/lib/notesData";
import {
  ok, okList, created, badRequest, forbidden, serverError,
} from "@/lib/apiHelpers";

function slugify(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ── GET /api/notes ────────────────────────────────────────────────
// Dashboard (authed): returns all notes ordered by created_at DESC.
// Public fallback not used here — public pages query pool directly.
export async function GET() {
  try {
    const user = await getServerUser();
    if (!user)                              return forbidden("Not authenticated.");
    if (!canDo(user.role, "notes", "read")) return forbidden();

    const result = await pool.query(
      `SELECT n.id, n.title, n.slug, n.body, n.excerpt,
              n.status, n.published_at, n.author_id,
              e.name AS author_name,
              n.created_at, n.updated_at
       FROM notes n
       LEFT JOIN employees e ON e.id = n.author_id
       ORDER BY n.created_at DESC`
    );
    return okList(result.rows, result.rowCount);
  } catch {
    return okList(NOTES_MOCK, NOTES_MOCK.length);
  }
}

// ── POST /api/notes ───────────────────────────────────────────────
export async function POST(request) {
  try {
    const user = await getServerUser();
    if (!user)                                return forbidden("Not authenticated.");
    if (!canDo(user.role, "notes", "create")) return forbidden();

    const { title, body, excerpt, status } = await request.json();

    if (!title?.trim()) return badRequest("Title is required.");
    if (!body?.trim())  return badRequest("Body is required.");

    const slug       = slugify(title);
    const noteStatus = status === "published" ? "published" : "draft";
    const pubAt      = noteStatus === "published" ? new Date().toISOString() : null;
    const autoExcerpt = excerpt?.trim() ||
      body.replace(/\n+/g, " ").slice(0, 160).trimEnd() + (body.length > 160 ? "…" : "");

    const result = await pool.query(
      `INSERT INTO notes (title, slug, body, excerpt, status, published_at, author_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title.trim(), slug, body.trim(), autoExcerpt, noteStatus, pubAt, user.id]
    );
    return created(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return badRequest("A note with that title already exists.");
    return serverError(err, "POST /api/notes");
  }
}
