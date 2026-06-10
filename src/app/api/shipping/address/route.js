// POST /api/shipping/address
//
// Public — called from the checkout page to validate and standardize a shipping address.
// Non-fatal: if USPS is unavailable the checkout still proceeds.
//
// Body:   { streetAddress, secondaryAddress?, city, state, zip }
// 200 ok: { standardized: { streetAddress, city, state, zip, zipPlus4 } }
// 422:    { error: "Address not found." }

import { standardizeAddress } from "@/lib/shipping";
import { badRequest, serverError } from "@/lib/apiHelpers";
import { NextResponse } from "next/server";
import { checkLimit }   from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const ip      = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const limited = checkLimit(ip, "shipping:address", 15, 10 * 60 * 1000);
    if (limited) return NextResponse.json({ error: limited.message }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });

    const { streetAddress, secondaryAddress, city, state, zip } = await request.json();

    if (!streetAddress?.trim() || !city?.trim() || !state?.trim() || !zip?.trim()) {
      return badRequest("streetAddress, city, state, and zip are required.");
    }

    const addr = await standardizeAddress({ streetAddress, secondaryAddress, city, state, zip });

    return NextResponse.json({
      standardized: {
        streetAddress  : addr.streetAddress,
        secondaryAddress: addr.secondaryAddress ?? "",
        city           : addr.city,
        state          : addr.state,
        zip            : addr.ZIPCode,
        zipPlus4       : addr.ZIPPlus4 ?? "",
      },
    });
  } catch (err) {
    if (err.message?.toLowerCase().includes("not found") ||
        err.message?.toLowerCase().includes("invalid")) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    return serverError(err, "POST /api/shipping/address");
  }
}
