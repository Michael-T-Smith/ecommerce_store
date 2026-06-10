import pool                   from "@/lib/db";
import { okList, serverError } from "@/lib/apiHelpers";

// Public — no auth. Returns active collections only.
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, slug, label, emoji, accent_color, light_text,
              headline, subheadline, body_copy, tags
       FROM collections
       WHERE active = true
       ORDER BY sort_order, created_at`
    );
    return okList(result.rows, result.rowCount);
  } catch (err) {
    return serverError(err, "GET /api/public/collections");
  }
}

