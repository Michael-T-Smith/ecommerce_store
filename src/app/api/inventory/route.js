import pool                from "@/lib/db";
import { getServerUser }   from "@/lib/getRequestUser";
import { canDo }           from "@/lib/permissions";
import {
  okList, created, badRequest, forbidden, serverError,
} from "@/lib/apiHelpers";

export async function GET(request) {
  try {
    const user = await getServerUser();
    if (!user)                                  return forbidden("Not authenticated.");
    if (!canDo(user.role, "inventory", "read")) return forbidden();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const inStock  = searchParams.get("inStock");
    const search   = searchParams.get("search");

    const conditions = [];
    const params     = [];
    let   p          = 1;

    if (category) { conditions.push(`category = $${p++}`);  params.push(category); }
    if (inStock === "true")  conditions.push("in_stock = true");
    if (inStock === "false") conditions.push("in_stock = false");
    if (search) {
      conditions.push(`(name ILIKE $${p} OR sku ILIKE $${p} OR supplier ILIKE $${p})`);
      params.push(`%${search}%`);
      p++;
    }

    const where  = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT inv.id, inv.sku, inv.name, inv.description, inv.prices, inv.cost_prices,
              inv.category, inv.tag, inv.sizes, inv.supplier,
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
       ${where} GROUP BY inv.id ORDER BY inv.category, inv.name`,
      params
    );

    // Map images from json_agg result
    const rows = result.rows.map((row) => ({
      ...row,
      images: Array.isArray(row.images) ? row.images : [],
    }));
    return okList(rows, result.rowCount);
  } catch (err) {
    return serverError(err, "GET /api/inventory");
  }
}

export async function POST(request) {
  try {
    const user = await getServerUser();
    if (!user)                                    return forbidden("Not authenticated.");
    if (!canDo(user.role, "inventory", "create")) return forbidden();

    const body = await request.json();
    const {
      sku, name, description, prices, costPrices,
      category, tag, sizes, supplier,
      stockCount, lowStockThreshold, inStock,
      isFeatured, featuredAccent,
    } = body;

    if (!sku || !name || !category)
      return badRequest("sku, name, and category are required.");
    if (!Array.isArray(prices) || prices.length === 0)
      return badRequest("prices must be a non-empty array.");
    if (!Array.isArray(sizes) || sizes.length === 0)
      return badRequest("sizes must be a non-empty array.");
    if (prices.length !== sizes.length)
      return badRequest(`prices (${prices.length}) and sizes (${sizes.length}) must be the same length.`);
    if (prices.some((p) => !Number.isInteger(p) || p < 0))
      return badRequest("All prices must be non-negative integers.");

    const result = await pool.query(
      `INSERT INTO inventory
         (sku, name, description, prices, cost_prices, category, tag,
          sizes, supplier, stock_count, low_stock_threshold, in_stock,
          is_featured, featured_accent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        sku.trim().toUpperCase(),
        name.trim(),
        description?.trim() || null,
        prices.map(Number),
        Array.isArray(costPrices) ? costPrices.map(Number) : prices.map(() => 0),
        category,
        tag    || null,
        sizes,
        supplier?.trim() || null,
        Number(stockCount        ?? 0),
        Number(lowStockThreshold ?? 2),
        inStock       ?? true,
        isFeatured    ?? false,
        featuredAccent ?? "#D4511A",
      ]
    );

    return created(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return badRequest("An item with that SKU already exists.");
    return serverError(err, "POST /api/inventory");
  }
}