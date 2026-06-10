// Public endpoint — no auth required.
// Accepts ?order_number=LF-XXX&email=customer@example.com
// Returns limited order status info gated by knowing both values.
import pool from "@/lib/db";
import { ok, badRequest, notFound, serverError } from "@/lib/apiHelpers";
import { checkLimit } from "@/lib/rateLimit";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const ip      = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const limited = checkLimit(ip, "orders:lookup", 20, 10 * 60 * 1000);
    if (limited) return NextResponse.json({ error: limited.message }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });

    const { searchParams } = new URL(request.url);
    const orderNumber = (searchParams.get("order_number") ?? "").trim().toUpperCase();
    const email       = (searchParams.get("email")        ?? "").trim().toLowerCase();

    if (!orderNumber) return badRequest("order_number is required.");
    if (!email)       return badRequest("email is required.");

    const result = await pool.query(
      `SELECT order_number, customer_name, status,
              fulfillment_type, delivery_date, delivery_window,
              pickup_time, pickup_location, delivery_address,
              items, subtotal, delivery_fee, total, created_at
       FROM orders
       WHERE order_number = $1
         AND LOWER(customer_email) = $2`,
      [orderNumber, email]
    );

    if (result.rowCount === 0) return notFound("No order found matching that order number and email.");
    return ok(result.rows[0]);
  } catch (err) {
    return serverError(err, "GET /api/orders/lookup");
  }
}
