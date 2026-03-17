import pool           from "@/lib/db";
import HomePageClient from "./HomePageClient";

export const metadata = {
  title      : "Lamb's Florist — Piedmont, Alabama",
  description: "Fresh arrangements, plants, and gifts. Handcrafted at our Piedmont studio. Delivery to Piedmont, Anniston, and Centre.",
};

export const revalidate = 60;

function dbRowToFeaturedItem(row) {
  return {
    id            : row.id,
    sku           : row.sku,
    name          : row.name,
    description   : row.description   ?? "",
    price         : Number(row.price),
    category      : row.category,
    tag           : row.tag           ?? null,
    emoji         : row.emoji         ?? "🌸",
    sizes         : Array.isArray(row.sizes) ? row.sizes : [],
    inStock       : Boolean(row.in_stock),
    stockCount    : Number(row.stock_count ?? 0),
    featuredAccent: row.featured_accent ?? "#D4511A",
  };
}

export default async function HomePage() {
  let featuredItems = [];

  try {
    const result = await pool.query(
      `SELECT id, sku, name, description, price, category, tag,
              emoji, sizes, stock_count, in_stock, featured_accent
       FROM inventory
       WHERE is_featured = TRUE AND in_stock = TRUE
       ORDER BY updated_at DESC
       LIMIT 3`
    );
    featuredItems = result.rows.map(dbRowToFeaturedItem);
  } catch (err) {
    // DB error — homepage still renders, featured section shows fallback
    console.error("[HomePage] Failed to load featured items:", err.message);
  }

  return <HomePageClient featuredItems={featuredItems} />;
}