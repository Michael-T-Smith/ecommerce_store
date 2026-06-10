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
    images     : Array.isArray(row.images) ? row.images : [],
    sizes      : Array.isArray(row.sizes) ? row.sizes : [],
    supplier   : row.supplier ?? null,
    stockCount : Number(row.stock_count  ?? 0),
    inStock    : Boolean(row.in_stock),
  };
}

export const metadata = {
  title      : "Shop - BityBird Co",
  description: "Fresh handcrafted goods.",
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
`SELECT inv.id, inv.sku, inv.name, inv.description, inv.prices, inv.category, inv.tag,
              inv.sizes, inv.supplier, inv.stock_count, inv.in_stock,
              COALESCE(
                json_agg(json_build_object('id', ii.id, 'path', ii.path)
                  ORDER BY ii.display_order ASC)
                FILTER (WHERE ii.id IS NOT NULL), '[]'
              ) AS images
       FROM inventory inv
       LEFT JOIN inventory_images ii ON ii.inventory_id = inv.id
       GROUP BY inv.id
       ORDER BY inv.category ASC, inv.name ASC`
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