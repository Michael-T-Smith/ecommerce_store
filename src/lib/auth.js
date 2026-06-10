// src/lib/auth.js
//
// JWT utilities for staff dashboard auth using jose (Edge-runtime compatible).
// jsonwebtoken is NOT used — it cannot run in Next.js middleware.
//
// Token payload shape: { id, name, email, role }
// Role is read from the employees table at login time and encoded into
// the token. If a role changes in the DB, the user must re-login.
//
// Staff cookie: "bitybird_session"  path: "/"  expiry: 8h
// Customer cookie lives in src/lib/customerAuth.js — separate file.

import { SignJWT, jwtVerify } from "jose";
import { cookies }            from "next/headers";

export const COOKIE_NAME = "bitybird_session";

export const COOKIE_OPTIONS = {
  httpOnly : true,
  secure   : process.env.NODE_ENV === "production",
  sameSite : "lax",
  path     : "/",
  maxAge   : 60 * 60 * 8,  // 8 hours — one work day
};

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in .env.local");
  return new TextEncoder().encode(secret);
}

/**
 * signToken(payload) → string
 * Signs a JWT with the employee payload. Called after successful login.
 */
export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRY || "8h")
    .sign(getSecret());
}

/**
 * verifyToken(token) → payload | null
 * Verifies a JWT string. Returns null on any failure — never throws
 * to the caller, so middleware can handle it gracefully.
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

/**
 * getSession() → payload | null
 * Server-side helper. Reads the lambs_session cookie from the current
 * request and returns the decoded payload.
 * Use in Server Components and Route Handlers.
 * Not usable in middleware — use verifyToken directly there.
 */
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}