import pool           from "@/lib/db";
import HomePageClient from "./HomePageClient";

export const metadata = {
  title      : "BityBird Co — Handcrafted & Refurbished Finds",
  description: "Handcrafted goods and lovingly refurbished finds. Shop unique, one-of-a-kind pieces — curated and shipped online.",
};

export const revalidate = 60;

// Snake_case DB row → camelCase frontend item
// Used for both featured and catalog items — same shape either way.
function dbRowToItem(row) {
  return {
    id            : row.id,
    sku           : row.sku,
    name          : row.name,
    description   : row.description   ?? "",
    prices        : Array.isArray(row.prices) ? row.prices.map(Number) : [0],
    category      : row.category,
    tag           : row.tag           ?? null,
    images        : Array.isArray(row.images) ? row.images : [],
    sizes         : Array.isArray(row.sizes) ? row.sizes : [],
    inStock       : Boolean(row.in_stock),
    stockCount    : Number(row.stock_count  ?? 0),
    featuredAccent: row.featured_accent     ?? "#C08FA3",
  };
}

const ITEM_COLS = `
  inv.id, inv.sku, inv.name, inv.description, inv.prices, inv.category, inv.tag,
  inv.sizes, inv.stock_count, inv.in_stock, inv.featured_accent,
  COALESCE(
    json_agg(json_build_object('id', ii.id, 'path', ii.path)
      ORDER BY ii.display_order ASC)
    FILTER (WHERE ii.id IS NOT NULL), '[]'
  ) AS images
`;

export default async function HomePage() {
  let featuredItems = [];
  let catalogItems  = [];

  try {
    // Both queries run in parallel — no sequential waterfall
    const [featuredResult, catalogResult] = await Promise.all([
      pool.query(
        `SELECT ${ITEM_COLS}
         FROM inventory inv
         LEFT JOIN inventory_images ii ON ii.inventory_id = inv.id
         WHERE inv.is_featured = TRUE AND inv.in_stock = TRUE
         GROUP BY inv.id
         ORDER BY inv.updated_at DESC
         LIMIT 3`
      ),
      pool.query(
        // In-stock items first, then out-of-stock — matches the old mock order.
        // Limit 8 for the homepage preview strip.
        `SELECT ${ITEM_COLS}
         FROM inventory inv
         LEFT JOIN inventory_images ii ON ii.inventory_id = inv.id
         GROUP BY inv.id
         ORDER BY inv.in_stock DESC, inv.category ASC, inv.name ASC
         LIMIT 8`
      ),
    ]);

    featuredItems = featuredResult.rows.map(dbRowToItem);
    catalogItems  = catalogResult.rows.map(dbRowToItem);
  } catch (err) {
    // DB unreachable — homepage renders with empty sections rather than crashing
    console.error("[HomePage] DB error:", err.message);
  }

  return (
    <HomePageClient
      featuredItems={featuredItems}
      catalogItems={catalogItems}
    />
  );
}