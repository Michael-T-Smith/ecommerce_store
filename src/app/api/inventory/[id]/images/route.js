// src/app/api/inventory/[id]/images/route.js
//
// GET    /api/inventory/[id]/images — list images for a product
// POST   /api/inventory/[id]/images — upload a new image (multipart/form-data)
// DELETE /api/inventory/[id]/images — delete one image by path, remove file from disk
// PATCH  /api/inventory/[id]/images — reorder images (body: { order: [id, id, ...] })
//
// Files are written to /public/inventory/{slug}-{n}.{ext}
// Path stored in DB is the URL-ready string: /inventory/{slug}-{n}.{ext}

import { NextResponse }  from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import path              from "path";
import pool              from "@/lib/db";
import { getServerUser } from "@/lib/getRequestUser";
import { canDo }         from "@/lib/permissions";
import { ok, okList, created, badRequest, forbidden, notFound, serverError } from "@/lib/apiHelpers";

// Slug helper — "Classic Red Roses" → "classic-red-roses"
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Absolute path to /public/inventory/
function publicInventoryDir() {
  return path.join(process.cwd(), "public", "inventory");
}

// ── GET — list images ─────────────────────────────────────────────────────────
export async function GET(_req, { params }) {
  try {
    
    let { id } = await params;
    id = parseInt(id)

    const result = await pool.query(
      `SELECT id, path, display_order
       FROM inventory_images
       WHERE inventory_id = $1
       ORDER BY display_order ASC`,
      [id]
    );
    return okList(result.rows, result.rowCount);
  } catch (err) {
    return serverError(err, "GET /api/inventory/[id]/images");
  }
}

// ── POST — upload new image ───────────────────────────────────────────────────
export async function POST(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                    return forbidden("Not authenticated.");
    if (!canDo(user.role, "inventory", "update")) return forbidden();

    let { id } = await params;
    id = parseInt(id)


    // Fetch product name for slug generation
    const prod = await pool.query(
      "SELECT name FROM inventory WHERE id = $1", [id]
    );
    if (prod.rowCount === 0) return notFound("Product not found.");
    const slug = slugify(prod.rows[0].name);

    const formData = await request.formData();
    const file     = formData.get("file");

    if (!file || typeof file === "string")
      return badRequest("No file provided.");

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["jpg", "jpeg", "png", "webp"].includes(ext))
      return badRequest("Only jpg, jpeg, png, and webp files are accepted.");

    // Determine next display_order
    const countRes = await pool.query(
      "SELECT COUNT(*) FROM inventory_images WHERE inventory_id = $1", [id]
    );
    const count = parseInt(countRes.rows[0].count);
    if (count >= 5) return badRequest("Maximum of 5 images per product.");

    // Build unique filename: {slug}-{n}.{ext}
    const filename  = `${slug}-${count + 1}.${ext}`;
    const dir       = publicInventoryDir();
    const filePath  = path.join(dir, filename);
    const urlPath   = `/inventory/${filename}`;

    // Write file to /public/inventory/
    await mkdir(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Insert DB record
    const row = await pool.query(
      `INSERT INTO inventory_images (inventory_id, path, display_order)
       VALUES ($1, $2, $3) RETURNING *`,
      [id, urlPath, count]
    );

    return created({ id: row.rows[0].id, path: urlPath, display_order: count });
  } catch (err) {
    return serverError(err, "POST /api/inventory/[id]/images");
  }
}

// ── DELETE — remove one image ─────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                    return forbidden("Not authenticated.");
    if (!canDo(user.role, "inventory", "update")) return forbidden();

    
    let { id } = await params;
    id = parseInt(id)

    const body = await request.json();
    const { imageId } = body;

    if (!imageId) return badRequest("imageId is required.");

    // Fetch the record first so we have the path to delete from disk
    const rec = await pool.query(
      "SELECT path FROM inventory_images WHERE id = $1 AND inventory_id = $2",
      [imageId, id]
    );
    if (rec.rowCount === 0) return notFound("Image not found.");

    const imgPath = rec.rows[0].path; // e.g. /inventory/classic-red-roses-1.png

    // Delete from DB
    await pool.query("DELETE FROM inventory_images WHERE id = $1", [imageId]);

    // Delete file from disk — non-fatal if already gone
    try {
      const filePath = path.join(process.cwd(), "public", imgPath);
      await unlink(filePath);
    } catch { /* file already gone — ignore */ }

    // Re-sequence display_order to stay gapless
    await pool.query(
      `UPDATE inventory_images
       SET display_order = sub.rn - 1
       FROM (
         SELECT id, ROW_NUMBER() OVER (ORDER BY display_order ASC) AS rn
         FROM inventory_images
         WHERE inventory_id = $1
       ) sub
       WHERE inventory_images.id = sub.id`,
      [id]
    );

    return ok({ deleted: true, path: imgPath });
  } catch (err) {
    return serverError(err, "DELETE /api/inventory/[id]/images");
  }
}

// ── PATCH — reorder images ────────────────────────────────────────────────────
export async function PATCH(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                    return forbidden("Not authenticated.");
    if (!canDo(user.role, "inventory", "update")) return forbidden();

    
    let { id } = await params;
    id = parseInt(id)

    const body   = await request.json();
    const { order } = body; // array of image IDs in desired order

    if (!Array.isArray(order)) return badRequest("order must be an array of image IDs.");

    // Update display_order for each image ID in the array
    for (let i = 0; i < order.length; i++) {
      await pool.query(
        "UPDATE inventory_images SET display_order = $1 WHERE id = $2 AND inventory_id = $3",
        [i, order[i], id]
      );
    }

    const result = await pool.query(
      `SELECT id, path, display_order FROM inventory_images
       WHERE inventory_id = $1 ORDER BY display_order ASC`,
      [id]
    );

    return ok(result.rows);
  } catch (err) {
    return serverError(err, "PATCH /api/inventory/[id]/images");
  }
}