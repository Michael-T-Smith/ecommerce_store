"use client";

import { createContext, useContext, useState } from "react";

const SessionContext = createContext(null);

// Dev-only role switcher accounts — UI only, no real auth effect
const DEV_USERS = [
  { id: "1", name: "Cecelia Bates",  email: "cecelia@lambsflorist.com", role: "admin"    },
  { id: "2", name: "Frank Bates",    email: "frank@lambsflorist.com",   role: "manager"  },
  { id: "3", name: "Jane Holloway",  email: "jane@lambsflorist.com",    role: "employee" },
];

export function DashboardSessionProvider({ initialUser, children }) {
  const [user, setUser] = useState(initialUser);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/dashboard/login";
  };

  const isDev = process.env.NODE_ENV === "development";

  return (
    <SessionContext.Provider value={{
      user,
      setUser,
      logout,
      isDev,
      devUsers: isDev ? DEV_USERS : [],
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useDashboardSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useDashboardSession must be used inside DashboardSessionProvider");
  return ctx;
}