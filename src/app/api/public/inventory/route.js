import pool                   from "@/lib/db";
import { okList, serverError } from "@/lib/apiHelpers";

// Public — no auth. Returns in-stock items with only storefront-safe fields.
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT inv.id, inv.name, inv.description, inv.prices, inv.sizes,
              inv.category, inv.tag, inv.collection_ids,
              inv.is_customizable, inv.customization_type,
              COALESCE(
                json_agg(
                  json_build_object('id', ii.id, 'path', ii.path)
                  ORDER BY ii.display_order ASC
                ) FILTER (WHERE ii.id IS NOT NULL), '[]'
              ) AS images
       FROM inventory inv
       LEFT JOIN inventory_images ii ON ii.inventory_id = inv.id
       WHERE inv.in_stock = true
       GROUP BY inv.id
       ORDER BY inv.category, inv.name`
    );

    const rows = result.rows.map((r) => ({
      id               : r.id,
      name             : r.name,
      description      : r.description,
      prices           : Array.isArray(r.prices)         ? r.prices.map(Number)  : [0],
      sizes            : r.sizes        ?? [],
      category         : r.category,
      tag              : r.tag,
      inStock          : true,
      collectionIds    : Array.isArray(r.collection_ids) ? r.collection_ids      : [],
      images           : Array.isArray(r.images)         ? r.images              : [],
      isCustomizable   : r.is_customizable   ?? false,
      customizationType: r.customization_type ?? "engraved",
    }));

    return okList(rows, result.rowCount);
  } catch (err) {
    return serverError(err, "GET /api/public/inventory");
  }
}

