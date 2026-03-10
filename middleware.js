// middleware.js  (PROJECT ROOT)
//
// Auth guard for protected routes. Runs at the Edge (jose only — no jsonwebtoken).
//
// WHAT THIS DOES:
//   - /dashboard/*  → verifies "lambs_session" cookie → stamps x-user-* REQUEST
//                     headers for staff server components and API route handlers
//   - /account/*    → verifies "lambs_customer" cookie → redirects to login if absent
//
// WHAT THIS DOES NOT DO:
//   - /api/customers/* routes read identity via getCustomerSession() directly
//     from the cookie — they do NOT depend on x-customer-* headers from here.
//     This is simpler and more reliable than header propagation.
//
// Public bypasses (never intercepted):
//   /dashboard/login
//   /account/login
//
// Dev bypass:
//   SKIP_AUTH=true in .env.local — injects fake staff headers, skips customer guard.
//   Set to false before go-live.

import { NextResponse } from "next/server";
import { jwtVerify }    from "jose";

const STAFF_COOKIE    = "lambs_session";
const CUSTOMER_COOKIE = "lambs_customer";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  return new TextEncoder().encode(secret);
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ── Public bypasses ───────────────────────────────────────────
  if (
    pathname.startsWith("/dashboard/login") ||
    pathname.startsWith("/account/login")
  ) {
    return NextResponse.next();
  }

  // ── Dev bypass ────────────────────────────────────────────────
  if (process.env.SKIP_AUTH === "true") {
    const requestHeaders = new Headers(request.headers);
    if (pathname.startsWith("/dashboard")) {
      requestHeaders.set("x-user-id",    "1");
      requestHeaders.set("x-user-role",  "admin");
      requestHeaders.set("x-user-name",  "Dev Admin");
      requestHeaders.set("x-user-email", "cecelia@lambsflorist.com");
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ── Dashboard auth ────────────────────────────────────────────
  // Stamps x-user-* onto the REQUEST so dashboard server components
  // and route handlers can read role/identity from headers().
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get(STAFF_COOKIE)?.value;

    if (!token) {
      const url = new URL("/dashboard/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    try {
      const { payload }    = await jwtVerify(token, getSecret());
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id",    String(payload.id));
      requestHeaders.set("x-user-role",  String(payload.role));
      requestHeaders.set("x-user-name",  String(payload.name));
      requestHeaders.set("x-user-email", String(payload.email));
      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      const url = new URL("/dashboard/login", request.url);
      url.searchParams.set("reason", "session_expired");
      const res = NextResponse.redirect(url);
      res.cookies.delete(STAFF_COOKIE);
      return res;
    }
  }

  // ── Customer account guard ────────────────────────────────────
  // Fast-path redirect for unauthenticated users hitting /account/*.
  // The portal layout (portal)/layout.js ALSO verifies the session
  // directly via getCustomerSession() — this guard just saves a round
  // trip for users who have no cookie at all.
  if (pathname.startsWith("/account")) {
    const token = request.cookies.get(CUSTOMER_COOKIE)?.value;

    if (!token) {
      const url = new URL("/account/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    try {
      await jwtVerify(token, getSecret());
      return NextResponse.next();
    } catch {
      const url = new URL("/account/login", request.url);
      url.searchParams.set("reason", "session_expired");
      const res = NextResponse.redirect(url);
      res.cookies.delete(CUSTOMER_COOKIE);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/account/:path*",
  ],
};