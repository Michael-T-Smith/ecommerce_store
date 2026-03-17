import { notFound } from "next/navigation";
import pool         from "@/lib/db";
import ProductDetail from "./ProductDetail";

export async function generateMetadata({ params }) {
  const { id } = await params
  if (isNaN(id)) return { title: "Product Not Found — Lamb's Florist" };

  try {
    const { rows } = await pool.query(
      "SELECT name, description FROM inventory WHERE id = $1 LIMIT 1",
      [id]
    );
    if (!rows[0]) return { title: "Product Not Found — Lamb's Florist" };
    return {
      title      : `${rows[0].name} — Lamb's Florist`,
      description: rows[0].description ?? undefined,
    };
  } catch {
    return { title: "Lamb's Florist" };
  }
}

export default async function ShopProductPage({ params }) {
  const { id } = await params;
  if (isNaN(id)) notFound();

  // Run main + related queries in parallel
  const [mainResult, relatedResult] = await Promise.all([
    pool.query(
      `SELECT id, sku, name, description,
              price, category, tag, emoji,
              sizes, supplier, image_path,
              stock_count, in_stock
       FROM inventory
       WHERE id = $1
       LIMIT 1`,
      [id]
    ),
    // Related runs against a subquery so we can reference the category
    // of the main row without waiting for it to resolve first.
    // We pass id twice: once to exclude the current product, once to
    // find its category via a correlated lookup.
    pool.query(
      `SELECT i.id, i.name, image_path, i.price, i.emoji,
              i.category, i.tag, i.sizes, i.in_stock
       FROM inventory i
       WHERE i.category = (
         SELECT category FROM inventory WHERE id = $1
       )
         AND i.id     != $1
         AND i.in_stock = true
       ORDER BY RANDOM()
       LIMIT 3`,
      [id]
    ),
  ]);

  const row = mainResult.rows[0];
  if (!row) notFound();

  // Shape passed to the client component — all values serialisable.
  // cost_price is intentionally excluded (internal business data).
  const product = {
    id        : row.id,
    sku       : row.sku,
    name      : row.name,
    description: row.description ?? null,
    price     : Number(row.price),
    category  : row.category,
    tag       : row.tag ?? null,
    emoji     : row.emoji ?? "💐",
    image_path : row.image_path ?? null,
    sizes     : row.sizes,                   // TEXT[] — already a JS array via pg
    supplier  : row.supplier ?? null,
    stockCount: row.stock_count,
    inStock   : row.in_stock,
  };

  const related = relatedResult.rows.map((r) => ({
    id      : r.id,
    name    : r.name,
    price   : Number(r.price),
    emoji   : r.emoji ?? "💐",
    image_path   : r.image_path ?? null,
    category: r.category,
    tag     : r.tag ?? null,
    sizes   : r.sizes,
    inStock : r.in_stock,
  }));

  return <ProductDetail product={product} related={related} />;
}