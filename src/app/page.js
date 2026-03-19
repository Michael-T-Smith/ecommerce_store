import pool           from "@/lib/db";
import HomePageClient from "./HomePageClient";

export const metadata = {
  title      : "Lamb's Florist — Piedmont, Alabama",
  description: "Fresh arrangements, plants, and gifts. Handcrafted at our Piedmont studio. Delivery to Piedmont, Anniston, and Centre.",
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
    emoji         : row.emoji         ?? "🌸",
    sizes         : Array.isArray(row.sizes) ? row.sizes : [],
    inStock       : Boolean(row.in_stock),
    stockCount    : Number(row.stock_count  ?? 0),
    featuredAccent: row.featured_accent     ?? "#D4511A",
  };
}

const ITEM_COLS = `
  id, sku, name, description, prices, category, tag,
  emoji, sizes, stock_count, in_stock, featured_accent
`;

export default async function HomePage() {
  let featuredItems = [];
  let catalogItems  = [];

  try {
    // Both queries run in parallel — no sequential waterfall
    const [featuredResult, catalogResult] = await Promise.all([
      pool.query(
        `SELECT ${ITEM_COLS}
         FROM inventory
         WHERE is_featured = TRUE AND in_stock = TRUE
         ORDER BY updated_at DESC
         LIMIT 3`
      ),
      pool.query(
        // In-stock items first, then out-of-stock — matches the old mock order.
        // Limit 8 for the homepage preview strip.
        `SELECT ${ITEM_COLS}
         FROM inventory
         ORDER BY in_stock DESC, category ASC, name ASC
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