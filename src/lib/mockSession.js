// ================================================================
//  FILE: src/lib/mockSession.js  (NEW)
//  Mock authentication session for development.
//  Replace this entire file with a real session when auth is wired.
//  The shape of the returned object is what the rest of the app
//  depends on — keep { user: { name, role, email } }.
// ================================================================

import { ROLES } from "@/lib/permissions";

export const MOCK_USERS = [
  { id: 1, name: "Cecilia Lamb", role: ROLES.ADMIN,    email: "cecilia@lambsflorist.com" },
  { id: 2, name: "Frank Lamb",   role: ROLES.MANAGER,  email: "frank@lambsflorist.com"   },
  { id: 3, name: "Jane Employee", role: ROLES.EMPLOYEE, email: "jane@lambsflorist.com"     },
];

// Default to admin for development
export const DEFAULT_MOCK_USER = MOCK_USERS[0];