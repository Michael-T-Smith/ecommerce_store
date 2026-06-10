// POST /api/shipping/label
//
// Staff-only. Creates a USPS shipping label for a given order.
// Returns the label as a base64 PDF — the client opens it in a new tab for printing.
//
// Body: { orderId, weightOz }
// Response: { labelImage, trackingNumber }

import pool                    from "@/lib/db";
import { getServerUser }       from "@/lib/getRequestUser";
import { canDo }               from "@/lib/permissions";
import { createShippingLabel } from "@/lib/shipping";
import { ok, badRequest, forbidden, notFound, serverError } from "@/lib/apiHelpers";

export async function POST(request) {
  try {
    const user = await getServerUser();
    if (!user)                                return forbidden("Not authenticated.");
    if (!canDo(user.role, "orders", "update")) return forbidden();

    const { orderId, weightOz = 16 } = await request.json();
    if (!orderId) return badRequest("orderId is required.");

    const { rows } = await pool.query(
      `SELECT order_number, customer_name, delivery_address
       FROM orders WHERE id = $1`,
      [orderId]
    );
    if (rows.length === 0) return notFound("Order not found.");

    const order = rows[0];

    // Parse delivery_address — stored as a single string e.g. "123 Main St, City, AL 35000"
    // Split on the last comma-space pair for city/state/zip vs street.
    const addressParts = (order.delivery_address ?? "").split(", ");
    const zip          = (addressParts.at(-1) ?? "").trim();
    const stateZip     = (addressParts.at(-2) ?? "").trim();
    const city         = stateZip.split(" ")[0] ?? "";
    const state        = stateZip.split(" ")[1] ?? "";
    const street       = addressParts.slice(0, -2).join(", ");

    const label = await createShippingLabel({
      recipientName  : order.customer_name,
      recipientStreet: street,
      recipientCity  : city,
      recipientState : state,
      recipientZip   : zip,
      weightOz       : Number(weightOz),
    });

    // Optionally persist tracking number back to the order
    if (label.trackingNumber) {
      await pool.query(
        "UPDATE orders SET staff_notes = CONCAT(COALESCE(staff_notes,''), $1) WHERE id = $2",
        [`\nTracking: ${label.trackingNumber}`, orderId]
      );
    }

    return ok({
      labelImage     : label.labelImage,
      trackingNumber : label.trackingNumber,
      orderNumber    : order.order_number,
    });
  } catch (err) {
    return serverError(err, "POST /api/shipping/label");
  }
}
