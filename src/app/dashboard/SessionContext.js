"use client";

import { createContext, useContext } from "react";

const SessionContext = createContext(null);

export function DashboardSessionProvider({ initialUser, children }) {
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/dashboard/login";
  };

  return (
    <SessionContext.Provider value={{ user: initialUser, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useDashboardSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useDashboardSession must be inside DashboardSessionProvider");
  return ctx;
}