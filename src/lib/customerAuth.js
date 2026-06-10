
import { SignJWT, jwtVerify } from "jose";
import { cookies }            from "next/headers";

export const CUSTOMER_COOKIE_NAME = "bitybird_customer";

export const CUSTOMER_COOKIE_OPTIONS = {
  httpOnly : true,
  secure   : process.env.NODE_ENV === "production",
  sameSite : "lax",
  path     : "/",   // Must be "/" — browser only sends cookie to paths that match.
                     // "/account" would block cookie from reaching /api/customers/*
                     // routes, causing middleware to see no token and return 401.
                     // httpOnly keeps it unreadable by JS regardless of path scope.
  maxAge   : 60 * 60 * 24 * 30, // 30 days
};

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in .env.local");
  return new TextEncoder().encode(secret);
}

/**
 * signCustomerToken(payload) → string
 * Payload shape: { id, name, email }
 */
export async function signCustomerToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

/**
 * verifyCustomerToken(token) → payload | null
 * Returns null on any failure — never throws to the caller.
 */
export async function verifyCustomerToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

/**
 * getCustomerSession() → payload | null
 * Server-side helper for route handlers and server components.
 * Reads the lambs_customer cookie from the current request.
 */
export async function getCustomerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

// Non-HttpOnly hint cookie — lets the Navbar read auth state without a network fetch.
// Contains the customer's display name (URI-encoded). Security: this cookie never
// grants access; all protected routes verify the HttpOnly JWT independently.
export const CUSTOMER_HINT_COOKIE_NAME = "bitybird_sess";

export const CUSTOMER_HINT_COOKIE_OPTIONS = {
  httpOnly: false,
  secure  : process.env.NODE_ENV === "production",
  sameSite: "lax",
  path    : "/",
  maxAge  : 60 * 60 * 24 * 30,
};