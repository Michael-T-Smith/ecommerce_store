
import { NextResponse } from "next/server";

/** 200 — single resource response */
export function ok(data, status = 200) {
  return NextResponse.json({ data }, { status });
}

/** 200 — list response with count */
export function okList(data, count) {
  return NextResponse.json({ data, count: count ?? data.length }, { status: 200 });
}

/** 201 — resource created */
export function created(data) {
  return NextResponse.json({ data }, { status: 201 });
}

/** 400 — bad request (validation failure, missing fields, etc.) */
export function badRequest(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/** 403 — authenticated but not authorized */
export function forbidden(message = "Insufficient permissions.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

/** 404 — resource not found */
export function notFound(message = "Resource not found.") {
  return NextResponse.json({ error: message }, { status: 404 });
}

/**
 * 500 — unexpected server error.
 * Logs full error server-side, returns a safe generic message to the client.
 * @param {Error}  err   — the caught error object
 * @param {string} label — route label for log identification, e.g. "GET /api/orders"
 */
export function serverError(err, label = "API") {
  console.error(`[${label}]`, err);
  return NextResponse.json(
    { error: "An unexpected error occurred. Please try again." },
    { status: 500 }
  );
}