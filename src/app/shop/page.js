import pool          from "@/lib/db";
import ShopPageClient from "./ShopPageClient";

// Map a DB row (snake_case, pg types) to the frontend item shape
// (camelCase) that ShopGrid and ProductCardActions already expect.
function dbRowToItem(row) {
  return {
    id         : row.id,
    sku        : row.sku,
    name       : row.name,
    description: row.description ?? "",
    prices     : Array.isArray(row.prices) ? row.prices.map(Number) : [0],
    category   : row.category,
    tag        : row.tag     ?? null,
    emoji      : row.emoji   ?? "🌸",
    sizes      : Array.isArray(row.sizes) ? row.sizes : [],
    supplier   : row.supplier ?? null,
    stockCount : Number(row.stock_count  ?? 0),
    inStock    : Boolean(row.in_stock),
  };
}

export const metadata = {
  title      : "Shop — Lamb's Florist",
  description: "Fresh arrangements, plants, and gifts — handcrafted daily in Piedmont, AL.",
};

// Revalidate every 60 s so the page stays fresh without a full rebuild.
// Inventory changes made in the dashboard appear within a minute.
export const revalidate = 60;

export default async function ShopPage() {
  let items      = [];
  let categories = ["All"];
  let dbError    = false;

  try {
    const result = await pool.query(
      `SELECT id, sku, name, description, prices, category, tag,
              emoji, sizes, supplier, stock_count, in_stock
       FROM inventory
       ORDER BY category ASC, name ASC`
    );

    items = result.rows.map(dbRowToItem);

    // Derive category list from actual DB data — stays in sync automatically.
    const seen = new Set();
    for (const item of items) {
      if (item.category && !seen.has(item.category)) {
        seen.add(item.category);
        categories.push(item.category);
      }
    }
  } catch (err) {
    console.error("[ShopPage] DB error:", err.message);
    dbError = true;
  }

  return (
    <ShopPageClient
      initialItems={items}
      categories={categories}
      dbError={dbError}
    />
  );
}