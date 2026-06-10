// src/lib/rateLimit.js
//
// Simple in-memory rate limiter for login endpoints.
// Tracks failed attempts per IP. On success the counter resets.
//
// Usage:
//   import { checkRateLimit, recordFailure, resetLimit } from "@/lib/rateLimit";
//
//   const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
//   const blocked = checkRateLimit(ip);
//   if (blocked) return NextResponse.json({ error: blocked.message }, { status: 429 });
//   // ... attempt login ...
//   if (failed) { recordFailure(ip); }
//   else        { resetLimit(ip);   }

const MAX_ATTEMPTS  = 5;        // failures before lock
const WINDOW_MS     = 10 * 60 * 1000;  // 10 minutes — rolling window
const LOCKOUT_MS    = 15 * 60 * 1000;  // 15 minutes — lockout duration

// Map<ip, { attempts: number, windowStart: number, lockedUntil: number | null }>
const store = new Map();

function getEntry(ip) {
  if (!store.has(ip)) store.set(ip, { attempts: 0, windowStart: Date.now(), lockedUntil: null });
  return store.get(ip);
}

export function checkRateLimit(ip) {
  const entry = getEntry(ip);
  const now   = Date.now();

  if (entry.lockedUntil && now < entry.lockedUntil) {
    const secsLeft = Math.ceil((entry.lockedUntil - now) / 1000);
    return {
      message: `Too many failed attempts. Try again in ${secsLeft} seconds.`,
      retryAfter: secsLeft,
    };
  }

  // Reset stale window
  if (now - entry.windowStart > WINDOW_MS) {
    entry.attempts    = 0;
    entry.windowStart = now;
    entry.lockedUntil = null;
  }

  return null; // not blocked
}

export function recordFailure(ip) {
  const entry = getEntry(ip);
  const now   = Date.now();

  // Reset window if expired
  if (now - entry.windowStart > WINDOW_MS) {
    entry.attempts    = 0;
    entry.windowStart = now;
    entry.lockedUntil = null;
  }

  entry.attempts += 1;

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
  }
}

export function resetLimit(ip) {
  store.delete(ip);
}

// ── General request-rate limiter ──────────────────────────────────────────────
// Counts ALL requests (not just failures) per IP + route key.
// Map<`${ip}:${key}`, { count: number, windowStart: number }>
const reqStore = new Map();

/**
 * Returns a 429 payload if the IP has exceeded `limit` requests within
 * `windowMs` ms for the given route `key`, otherwise returns null.
 */
export function checkLimit(ip, key, limit, windowMs) {
  const storeKey = `${ip}:${key}`;
  const now      = Date.now();
  let   entry    = reqStore.get(storeKey);

  if (!entry || now - entry.windowStart > windowMs) {
    entry = { count: 0, windowStart: now };
    reqStore.set(storeKey, entry);
  }

  entry.count += 1;

  if (entry.count > limit) {
    const secsLeft = Math.ceil((entry.windowStart + windowMs - now) / 1000);
    return {
      message:    `Too many requests. Try again in ${secsLeft} seconds.`,
      retryAfter: secsLeft,
    };
  }

  return null;
}
