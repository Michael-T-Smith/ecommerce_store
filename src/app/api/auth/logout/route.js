// ================================================================
//  FILE: src/app/api/auth/logout/route.js
//
//  POST /api/auth/logout
//  Clears the lambs_session cookie and ends the staff session.
// ================================================================

import { NextResponse } from "next/server";
import { COOKIE_NAME }  from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure  : process.env.NODE_ENV === "production",
    sameSite: "lax",
    path    : "/",
    maxAge  : 0,
  });
  return response;
}


// ================================================================
//  FILE: src/app/api/auth/session/route.js
//
//  GET /api/auth/session
//  Returns the current staff session payload from the cookie.
//  Used as a fallback reference — the (shell)/layout.js server
//  component reads headers directly and does not call this route.
//  Kept for debugging and any future client-side session checks.
// ================================================================

import { NextResponse } from "next/server";
import { getSession }   from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      id   : session.id,
      name : session.name,
      email: session.email,
      role : session.role,
    },
  });
}