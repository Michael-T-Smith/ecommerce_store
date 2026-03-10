
// ================================================================
//  FILE: src/app/api/auth/session/route.js  (NEW)
//  GET /api/auth/session
//  Returns the current user from the JWT cookie.
//  Called by SessionContext on the client to hydrate session state.
//  Returns 401 if no valid session — client falls back to mock.
// ================================================================

import { NextResponse } from "next/server";
import { getSession }   from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No active session." }, { status: 401 });
    }
    // Return only safe fields — never forward the full JWT payload
    return NextResponse.json({
      user: {
        id    : session.id,
        name  : session.name,
        email : session.email,
        role  : session.role,
      },
    }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Session error." }, { status: 401 });
  }
}
