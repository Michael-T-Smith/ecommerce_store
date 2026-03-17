import pool                        from "@/lib/db";
import { getServerUser }           from "@/lib/getRequestUser";
import { canDo }                   from "@/lib/permissions";
import { ok, badRequest, forbidden, notFound, serverError } from "@/lib/apiHelpers";

export async function GET(_request, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                  return forbidden("Not authenticated.");
    if (!canDo(user.role, "inventory", "read")) return forbidden();

    const result = await pool.query(
      `SELECT id, sku, name, description, price, cost_price, category, tag,
              emoji, sizes, supplier, stock_count, low_stock_threshold,
              in_stock, is_featured, featured_accent,
              created_at, updated_at
       FROM inventory WHERE id = $1`,
      [parseInt(params.id)]
    );

    if (result.rowCount === 0) return notFound("Inventory item not found.");
    return ok(result.rows[0]);
  } catch (err) {
    return serverError(err, "GET /api/inventory/[id]");
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                    return forbidden("Not authenticated.");
    if (!canDo(user.role, "inventory", "update")) return forbidden();

    const { id }   = await params;
    const body = await request.json();

    const ALLOWED      = ["name","description","price","cost_price","category",
                          "tag","emoji","sizes","supplier","stock_count",
                          "low_stock_threshold","in_stock",
                          "is_featured","featured_accent"];
    const camelToSnake = {
      costPrice        : "cost_price",
      stockCount       : "stock_count",
      lowStockThreshold: "low_stock_threshold",
      inStock          : "in_stock",
      isFeatured       : "is_featured",
      featuredAccent   : "featured_accent",
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
    return ok(result.rows[0]);
  } catch (err) {
    return serverError(err, "PATCH /api/inventory/[id]");
  }
}

export async function DELETE(_request, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                    return forbidden("Not authenticated.");
    if (!canDo(user.role, "inventory", "delete")) return forbidden();

    const result = await pool.query(
      "DELETE FROM inventory WHERE id = $1 RETURNING id, name",
      [parseInt(params.id)]
    );

    if (result.rowCount === 0) return notFound("Inventory item not found.");
    return ok({ deleted: true, id: result.rows[0].id, name: result.rows[0].name });
  } catch (err) {
    return serverError(err, "DELETE /api/inventory/[id]");
  }
}