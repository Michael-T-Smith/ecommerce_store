import { getSession } from "@/lib/auth";

/**
 * getServerUser() → { id, name, email, role } | null
 *
 * Reads and verifies the lambs_session JWT cookie directly.
 * Returns null if the cookie is absent, expired, or invalid.
 * Must be awaited. Only usable in Server Components and Route Handlers.
 */
export async function getServerUser() {
  const session = await getSession();
  if (!session?.id || !session?.role) return null;
  return {
    id   : String(session.id),
    name : session.name  ?? null,
    email: session.email ?? null,
    role : session.role,
  };
}

/**
 * getRequestUser(request) — legacy sync version, reads middleware headers.
 * Kept for any code not yet migrated. New code should use getServerUser().
 */
export function getRequestUser(request) {
  return {
    id   : request.headers.get("x-user-id")    ?? null,
    name : request.headers.get("x-user-name")  ?? null,
    email: request.headers.get("x-user-email") ?? null,
    role : request.headers.get("x-user-role")  ?? "guest",
  };
}