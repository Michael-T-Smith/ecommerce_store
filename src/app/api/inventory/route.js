import pool                        from "@/lib/db";
import { getServerUser }           from "@/lib/getRequestUser";
import { canDo }                   from "@/lib/permissions";
import { okList, created, badRequest, forbidden, serverError } from "@/lib/apiHelpers";

export async function GET(request) {
  try {
    const user = await getServerUser();
    if (!user)                                          return forbidden("Not authenticated.");
    if (!canDo(user.role, "inventory", "read"))         return forbidden();

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
      `SELECT id, sku, name, description, price, cost_price, category, tag,
              emoji, sizes, supplier, stock_count, low_stock_threshold,
              in_stock, created_at, updated_at
       FROM inventory ${where} ORDER BY category, name`,
      params
    );

    return okList(result.rows, result.rowCount);
  } catch (err) {
    return serverError(err, "GET /api/inventory");
  }
}

export async function POST(request) {
  try {
    const user = await getServerUser();
    if (!user)                                         return forbidden("Not authenticated.");
    if (!canDo(user.role, "inventory", "create"))      return forbidden();

    const body = await request.json();
    const { sku, name, description, price, costPrice,
            category, tag, emoji, sizes, supplier,
            stockCount, lowStockThreshold, inStock } = body;

    if (!sku || !name || !price || !category)
      return badRequest("sku, name, price, and category are required.");

    const result = await pool.query(
      `INSERT INTO inventory
         (sku, name, description, price, cost_price, category, tag, emoji,
          sizes, supplier, stock_count, low_stock_threshold, in_stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        sku.trim().toUpperCase(), name.trim(),
        description?.trim() || null, Number(price), Number(costPrice ?? 0),
        category, tag || null, emoji || null, sizes ?? [],
        supplier?.trim() || null, Number(stockCount ?? 0),
        Number(lowStockThreshold ?? 2), inStock ?? true,
      ]
    );

    return created(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return badRequest("An item with that SKU already exists.");
    return serverError(err, "POST /api/inventory");
  }
}