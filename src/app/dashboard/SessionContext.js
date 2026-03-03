"use client";

import { createContext, useContext, useState } from "react";
import { MOCK_USERS, DEFAULT_MOCK_USER }       from "@/lib/mockSession";

const SessionContext = createContext(null);

export function MockSessionProvider({ children }) {
  const [activeUser, setActiveUser] = useState(DEFAULT_MOCK_USER);

  return (
    <SessionContext.Provider value={{ user: activeUser, setUser: setActiveUser, allUsers: MOCK_USERS }}>
      {children}
    </SessionContext.Provider>
  );
}

// Hook — import this in any dashboard component that needs role
export function useDashboardSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useDashboardSession must be used inside MockSessionProvider");
  return ctx;
}
