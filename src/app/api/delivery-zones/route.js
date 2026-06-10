
import pool                from "@/lib/db";
import { getServerUser }   from "@/lib/getRequestUser";
import { canDo }           from "@/lib/permissions";
import {
  okList, created, badRequest, forbidden, serverError,
} from "@/lib/apiHelpers";
import { checkLimit }      from "@/lib/rateLimit";
import { NextResponse }    from "next/server";

export async function GET(request) {
  try {
    const ip      = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const limited = checkLimit(ip, "delivery-zones:get", 60, 10 * 60 * 1000);
    if (limited) return NextResponse.json({ error: limited.message }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });

    // ?all=true returns inactive zones too (dashboard use)
    const showAll = new URL(request.url).searchParams.get("all") === "true";
    const where   = showAll ? "" : "WHERE active = TRUE";
    const result  = await pool.query(
      `SELECT id, value, label, fee, active, sort_order
       FROM delivery_zones
       ${where}
       ORDER BY sort_order ASC, label ASC`
    );
    return okList(result.rows.map((r) => ({
      id        : r.id,
      value     : r.value,
      label     : r.label,
      fee       : Number(r.fee),
      active    : r.active,
      sort_order: r.sort_order,
    })), result.rowCount);
  } catch (err) {
    return serverError(err, "GET /api/delivery-zones");
  }
}
 
export async function POST(request) {
  try {
    const user = await getServerUser();
    if (!user)                                   return forbidden("Not authenticated.");
    if (!canDo(user.role, "delivery", "create")) return forbidden();
 
    const body = await request.json();
    const { value, label, fee, sortOrder } = body;
 
    if (!value?.trim()) return badRequest("value is required.");
    if (!label?.trim()) return badRequest("label is required.");
    if (fee == null || isNaN(fee) || Number(fee) < 0)
      return badRequest("fee must be a non-negative integer.");
 
    const result = await pool.query(
      `INSERT INTO delivery_zones (value, label, fee, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        value.trim().toLowerCase().replace(/\s+/g, "_"),
        label.trim(),
        Math.round(Number(fee)),
        Number(sortOrder ?? 99),
      ]
    );
 
    return created(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return badRequest("A zone with that value already exists.");
    return serverError(err, "POST /api/delivery-zones");
  }
}