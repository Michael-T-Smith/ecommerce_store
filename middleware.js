// middleware.js  (project root)
//
// Edge runtime — runs before every matched request.
//
// ROLES:
//   /dashboard(.*)  — redirect to login if bitybird_session cookie is absent.
//                     The (shell)/layout.js does full JWT verification server-side.
//   /api(.*)        — if bitybird_session is present and valid, stamp x-user-*
//                     request headers so API route handlers can call getRequestUser().
//   /account(.*)    — redirect to login if lambs_customer cookie is absent.
//
// IMPORTANT — matcher uses (.*) not :path*
// :path* in Next.js path-to-regexp requires at least one path segment after
// the base, so /dashboard (no trailing path) would not be matched and
// middleware would be skipped entirely. (.*) matches zero or more characters.

import { NextResponse } from "next/server";
import { jwtVerify }    from "jose";

// Global API rate limiter — runs in the Edge runtime before any handler.
// Backstop only: 200 req / 60 s per IP. Tight per-route limits are in the handlers.
const _globalStore = new Map();
function globalApiLimit(ip) {
  const LIMIT = 200, WINDOW = 60_000;
  const now = Date.now();
  let e = _globalStore.get(ip);
  if (!e || now - e.windowStart > WINDOW) {
    e = { count: 0, windowStart: now };
    _globalStore.set(ip, e);
  }
  e.count += 1;
  if (e.count > LIMIT) return Math.ceil((e.windowStart + WINDOW - now) / 1000);
  return null;
}

const STAFF_COOKIE    = "bitybird_session";
const CUSTOMER_COOKIE = "bitybird_customer";

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not defined in .env.local");
  return new TextEncoder().encode(s);
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ── Always allow login pages through ────────────────────────────
  if (
    pathname.startsWith("/dashboard/login") ||
    pathname.startsWith("/account/login")
  ) {
    return NextResponse.next();
  }

  // ── /api/* — global rate limit, then stamp x-user-* headers ───
  // No hard redirect — API routes that require a logged-in staff member
  // use canDo() and return 403 themselves. Public API routes work for all.
  if (pathname.startsWith("/api/")) {
    const ip       = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const secsLeft = globalApiLimit(ip);
    if (secsLeft !== null) {
      return new NextResponse(
        JSON.stringify({ error: `Too many requests. Try again in ${secsLeft} seconds.` }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(secsLeft) } }
      );
    }

    const token = request.cookies.get(STAFF_COOKIE)?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, getSecret());
        const headers = new Headers(request.headers);
        headers.set("x-user-id",    String(payload.id));
        headers.set("x-user-role",  String(payload.role));
        headers.set("x-user-name",  String(payload.name));
        headers.set("x-user-email", String(payload.email));
        return NextResponse.next({ request: { headers } });
      } catch {
        // Expired or tampered token — clear it, proceed without headers
        const res = NextResponse.next();
        res.cookies.delete(STAFF_COOKIE);
        return res;
      }
    }
    return NextResponse.next();
  }

  // ── /dashboard/* — cookie presence check ────────────────────────
  // Full JWT verification happens in (shell)/layout.js via getSession().
  // Middleware just gates on cookie existence so unauthenticated browsers
  // are redirected immediately without hitting server components.
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get(STAFF_COOKIE)?.value;
    if (!token) {
      const url = new URL("/dashboard/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    // Cookie exists — let the request through.
    // getSession() in the layout will verify the JWT and redirect if invalid.
    return NextResponse.next();
  }

  // ── /account/* — cookie presence check ──────────────────────────
  if (pathname.startsWith("/account")) {
    const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
    if (!token) {
      const url = new URL("/account/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard(.*)",
    "/account(.*)",
    "/api(.*)",
  ],
};