// src/app/account/CustomerContext.js
//
// Provides customer session state to all account portal components.
//
// DESIGN: initialCustomer comes from (portal)/layout.js which reads the
// JWT cookie directly via getCustomerSession(). By the time this context
// mounts, initialCustomer is ALWAYS a real customer — never Guest — because
// the layout redirects to /account/login if the session is absent/invalid.
//
// There is NO auto-fetch on mount. The initialCustomer from the server is
// the source of truth for id/name/email. refreshCustomer() exists purely
// to pull extra fields (phone, addresses) after a profile update.

"use client";

import { createContext, useContext, useState } from "react";

const CustomerContext = createContext(null);

export function CustomerProvider({ initialCustomer, children }) {
  const [customer, setCustomer] = useState(initialCustomer ?? null);

  const logout = async () => {
    await fetch("/api/customers/logout", { method: "POST" });
    window.location.href = "/account/login";
  };

  /**
   * refreshCustomer()
   * Fetches the latest full profile from the DB.
   * Call this after any PATCH /api/customers/me to keep state in sync.
   * Non-fatal — if it fails, the existing customer state is preserved.
   */
  const refreshCustomer = async () => {
    try {
      const res  = await fetch("/api/customers/me");
      const json = await res.json();
      if (res.ok && json.data) {
        setCustomer((prev) => ({ ...prev, ...json.data }));
      }
    } catch {
      // Non-fatal — keep existing state
    }
  };

  return (
    <CustomerContext.Provider value={{ customer, setCustomer, logout, refreshCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomer must be used inside CustomerProvider");
  return ctx;
}