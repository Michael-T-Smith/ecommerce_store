import pool                from "@/lib/db";
import { getServerUser }   from "@/lib/getRequestUser";
import { canDo }           from "@/lib/permissions";
import {
  okList, created, badRequest, forbidden, serverError,
} from "@/lib/apiHelpers";

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user)                                    return forbidden("Not authenticated.");
    if (!canDo(user.role, "collections", "read")) return forbidden();

    const result = await pool.query(
      `SELECT c.*,
         (SELECT COUNT(*)::int FROM inventory WHERE c.slug = ANY(collection_ids)) AS assigned_count
       FROM collections c
       ORDER BY c.sort_order, c.created_at`
    );
    return okList(result.rows, result.rowCount);
  } catch (err) {
    return serverError(err, "GET /api/collections");
  }
}

export async function POST(request) {
  try {
    const user = await getServerUser();
    if (!user)                                       return forbidden("Not authenticated.");
    if (!canDo(user.role, "collections", "create"))  return forbidden();

    const countRes = await pool.query("SELECT COUNT(*)::int AS n FROM collections");
    if (countRes.rows[0].n >= 12)
      return badRequest("Maximum of 12 collections reached. Deactivate or remove one first.");

    const body = await request.json();
    const { label, emoji, accentColor, lightText, headline, subheadline, bodyCopy, tags, active, sortOrder } = body;
    if (!label?.trim()) return badRequest("Label is required.");

    // Auto-generate unique slug from label
    const base = slugify(label);
    let slug = base;
    let suffix = 2;
    while (true) {
      const exists = await pool.query("SELECT 1 FROM collections WHERE slug = $1", [slug]);
      if (exists.rowCount === 0) break;
      slug = `${base}-${suffix++}`;
    }

    const result = await pool.query(
      `INSERT INTO collections
         (slug, label, emoji, accent_color, light_text, headline, subheadline, body_copy, tags, active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        slug,
        label.trim(),
        emoji       || "",
        accentColor || "#C08FA3",
        lightText   ?? false,
        headline    || "",
        subheadline || "",
        bodyCopy    || "",
        Array.isArray(tags) ? tags : [],
        active      ?? true,
        sortOrder   ?? countRes.rows[0].n,
      ]
    );
    return created(result.rows[0]);
  } catch (err) {
    return serverError(err, "POST /api/collections");
  }
}

