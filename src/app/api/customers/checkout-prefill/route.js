import { NextResponse }         from "next/server";
import pool                     from "@/lib/db";
import { getCustomerSession }   from "@/lib/customerAuth";
import { checkLimit }           from "@/lib/rateLimit";

// Single endpoint that replaces the /session + /me double-fetch on the checkout page.
// Returns { customer: null } for guests so the caller never needs to branch on status codes.
export async function GET(request) {
  try {
    const ip      = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const limited = checkLimit(ip, "checkout-prefill:get", 30, 10 * 60 * 1000);
    if (limited) return NextResponse.json({ error: limited.message }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });

    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ customer: null });
    }

    const [profileRes, addressRes] = await Promise.all([
      pool.query(
        "SELECT id, name, email, phone FROM customers WHERE id = $1",
        [session.id]
      ),
      pool.query(
        `SELECT id, label, address_line, city, state, zip, is_default
         FROM customer_addresses
         WHERE customer_id = $1
         ORDER BY is_default DESC, created_at ASC`,
        [session.id]
      ),
    ]);

    if (profileRes.rowCount === 0) {
      return NextResponse.json({ customer: null });
    }

    return NextResponse.json({
      customer: { ...profileRes.rows[0], addresses: addressRes.rows },
    });
  } catch {
    return NextResponse.json({ customer: null });
  }
}
