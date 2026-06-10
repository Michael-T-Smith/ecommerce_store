import { notFound } from "next/navigation";
import pool         from "@/lib/db";
import ProductDetail from "./ProductDetail";

export async function generateMetadata({ params }) {
  let { id } = await params;
  id = parseInt(id, 10);
  if (isNaN(id)) return { title: "Product Not Found — BityBird Co" };

  try {
    const { rows } = await pool.query(
      "SELECT name, description FROM inventory WHERE id = $1 LIMIT 1",
      [id]
    );
    if (!rows[0]) return { title: "Product Not Found — BityBird Co" };
    return {
      title      : `${rows[0].name} — BityBird Co`,
      description: rows[0].description ?? undefined,
    };
  } catch {
    return { title: "BityBird Co" };
  }
}

export default async function ShopProductPage({ params }) {
  let { id } = await params;
  id = parseInt(id, 10);
  if (isNaN(id)) notFound();

  // Run main + related queries in parallel
  const [mainResult, relatedResult] = await Promise.all([
    pool.query(
      `SELECT inv.id, inv.sku, inv.name, inv.description,
              inv.prices, inv.category, inv.tag,
              inv.sizes, inv.supplier, inv.stock_count, inv.in_stock,
              COALESCE(
                json_agg(json_build_object('id', ii.id, 'path', ii.path)
                  ORDER BY ii.display_order ASC)
                FILTER (WHERE ii.id IS NOT NULL), '[]'
              ) AS images
       FROM inventory inv
       LEFT JOIN inventory_images ii ON ii.inventory_id = inv.id
       WHERE inv.id = $1
       GROUP BY inv.id
       LIMIT 1`,
      [id]
    ),
    // Related runs against a subquery so we can reference the category
    // of the main row without waiting for it to resolve first.
    // We pass id twice: once to exclude the current product, once to
    // find its category via a correlated lookup.
    pool.query(
      `SELECT i.id, i.name,
              i.category, i.tag, i.sizes, i.in_stock, i.prices,
              COALESCE(
                json_agg(json_build_object('id', ii2.id, 'path', ii2.path)
                  ORDER BY ii2.display_order ASC)
                FILTER (WHERE ii2.id IS NOT NULL), '[]'
              ) AS images
       FROM inventory i
       LEFT JOIN inventory_images ii2 ON ii2.inventory_id = i.id
       WHERE i.category = (
         SELECT category FROM inventory WHERE id = $1
       )
         AND i.id     != $1
         AND i.in_stock = true
       GROUP BY i.id
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
    prices    : Array.isArray(row.prices) ? row.prices.map(Number) : [0],
    images    : Array.isArray(row.images) ? row.images : [],
    category  : row.category,
    tag       : row.tag ?? null,
    sizes     : row.sizes,                   // TEXT[] — already a JS array via pg
    supplier  : row.supplier ?? null,
    stockCount: row.stock_count,
    inStock   : row.in_stock,
  };

  const related = relatedResult.rows.map((r) => ({
    id      : r.id,
    name    : r.name,
    prices  : Array.isArray(r.prices) ? r.prices.map(Number) : [0],
    images  : Array.isArray(r.images) ? r.images : [],
    category: r.category,
    tag     : r.tag ?? null,
    sizes   : r.sizes,
    inStock : r.in_stock,
  }));

  return <ProductDetail product={product} related={related} />;
}