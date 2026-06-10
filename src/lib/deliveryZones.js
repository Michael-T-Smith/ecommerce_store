import pool from "@/lib/db";

/**
 * fetchZonesServer() — server-only (uses pool directly, no HTTP).
 * Returns all active zones sorted by sort_order.
 * Call from Server Components and Route Handlers.
 */
export async function fetchZonesServer() {
  try {
    const result = await pool.query(
      `SELECT id, value, label, fee, active, sort_order
       FROM delivery_zones
       WHERE active = TRUE
       ORDER BY sort_order ASC, label ASC`
    );
    return result.rows.map((r) => ({
      id        : r.id,
      value     : r.value,
      label     : r.label,
      fee       : Number(r.fee),
      active    : r.active,
      sort_order: r.sort_order,
    }));
  } catch (err) {
    console.error("[fetchZonesServer]", err.message);
    return [];
  }
}

/**
 * getDeliveryFee(zones, zoneValue) → number
 * Look up the fee for a zone value from a fetched zones array.
 * Returns 0 if not found.
 */
export function getDeliveryFee(zones, zoneValue) {
  return zones.find((z) => z.value === zoneValue)?.fee ?? 0;
}