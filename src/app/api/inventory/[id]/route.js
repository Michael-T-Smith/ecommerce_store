import pool                from "@/lib/db";
import { getServerUser }   from "@/lib/getRequestUser";
import { canDo }           from "@/lib/permissions";
import {
  ok, badRequest, forbidden, notFound, serverError,
} from "@/lib/apiHelpers";

export async function GET(_request, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                  return forbidden("Not authenticated.");
    if (!canDo(user.role, "inventory", "read")) return forbidden();
    
    let { id } = await params;
    id = parseInt(id)

    const result = await pool.query(
      `SELECT inv.id, inv.sku, inv.name, inv.description, inv.prices, inv.cost_prices,
              inv.category, inv.tag, inv.sizes, inv.supplier, inv.location,
              inv.stock_count, inv.low_stock_threshold,
              inv.in_stock, inv.is_featured, inv.featured_accent,
              inv.created_at, inv.updated_at,
              COALESCE(
                json_agg(
                  json_build_object('id', ii.id, 'path', ii.path)
                  ORDER BY ii.display_order ASC
                ) FILTER (WHERE ii.id IS NOT NULL), '[]'
              ) AS images
       FROM inventory inv
       LEFT JOIN inventory_images ii ON ii.inventory_id = inv.id
       WHERE inv.id = $1
       GROUP BY inv.id`,
      [id]
    );

    if (result.rowCount === 0) return notFound("Inventory item not found.");
    const row = result.rows[0];
    return ok({ ...row, images: Array.isArray(row.images) ? row.images : [] });
  } catch (err) {
    return serverError(err, "GET /api/inventory/[id]");
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                    return forbidden("Not authenticated.");
    if (!canDo(user.role, "inventory", "update")) return forbidden();

    
    let { id } = await params;
    const body = await request.json();

    // Validate sizes/prices alignment if both are being updated
    if (
      (body.sizes || body.prices) &&
      body.sizes && body.prices &&
      body.sizes.length !== body.prices.length
    ) {
      return badRequest(
        `prices (${body.prices.length}) and sizes (${body.sizes.length}) must be the same length.`
      );
    }

    const ALLOWED      = [
      "name", "description", "prices", "cost_prices", "category",
      "tag", "sizes", "supplier", "location",
      "stock_count", "low_stock_threshold", "in_stock",
      "is_featured", "featured_accent",
    ];
    const camelToSnake = {
      costPrices        : "cost_prices",
      stockCount        : "stock_count",
      lowStockThreshold : "low_stock_threshold",
      inStock           : "in_stock",
      isFeatured        : "is_featured",
      featuredAccent    : "featured_accent",
    };

    const sets = [], values = [];
    let   p    = 1;

    for (const [key, val] of Object.entries(body)) {
      const col = camelToSnake[key] ?? key;
      if (ALLOWED.includes(col)) { sets.push(`${col} = $${p++}`); values.push(val); }
    }

    if (!sets.length) return badRequest("No valid fields provided for update.");

    values.push(id);
    const result = await pool.query(
      `UPDATE inventory SET ${sets.join(", ")} WHERE id = $${p} RETURNING *`,
      values
    );

    if (result.rowCount === 0) return notFound("Inventory item not found.");
    // Re-fetch with images so the response matches the GET shape
    const imgRes = await pool.query(
      `SELECT id, path, display_order FROM inventory_images
       WHERE inventory_id = $1 ORDER BY display_order ASC`,
      [id]
    );
    return ok({
      ...result.rows[0],
      images: imgRes.rows,
    });
  } catch (err) {
    return serverError(err, "PATCH /api/inventory/[id]");
  }
}

export async function DELETE(_request, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                    return forbidden("Not authenticated.");
    if (!canDo(user.role, "inventory", "delete")) return forbidden();
    
    let { id } = await params;
    id = parseInt(id)

    const result = await pool.query(
      "DELETE FROM inventory WHERE id = $1 RETURNING id, name",
      [id]
    );

    if (result.rowCount === 0) return notFound("Inventory item not found.");
    return ok({ deleted: true, id: result.rows[0].id, name: result.rows[0].name });
  } catch (err) {
    return serverError(err, "DELETE /api/inventory/[id]");
  }
}