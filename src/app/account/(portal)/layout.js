// src/app/account/(portal)/layout.js
//
// Async SERVER component — no "use client".
//
// READS THE COOKIE DIRECTLY via getCustomerSession() — does NOT rely on
// middleware to stamp x-customer-* request headers and does NOT use headers().
//
// Why: The middleware → NextResponse.next({ request: { headers } }) →
// headers() chain has too many failure points (caching, version behaviour,
// propagation order). getCustomerSession() reads cookies() which is always
// available in any Server Component or Route Handler and is the documented
// Next.js pattern for reading auth state server-side.
//
// Middleware (/account/*) still runs and fast-redirects unauthenticated
// requests before this layout ever executes — that is its only job now.
// This layout is a second verification layer and the actual data source.

import { redirect }            from "next/navigation";
import { getCustomerSession }  from "@/lib/customerAuth";
import AccountShell            from "@/app/components/account/AccountShell/AccountShell";

export const metadata = {
  title: "My Account — Lamb's Florist",
};

export default async function PortalLayout({ children }) {
  // Read the lambs_customer cookie and verify the JWT in one call.
  // Returns null if cookie is absent, expired, or tampered.
  const session = await getCustomerSession();

  if (!session) {
    // Middleware should have caught this first, but guard here too.
    redirect("/account/login");
  }

  const initialCustomer = {
    id   : session.id,
    name : session.name,
    email: session.email,
  };

  return (
    <AccountShell initialCustomer={initialCustomer}>
      {children}
    </AccountShell>
  );
}