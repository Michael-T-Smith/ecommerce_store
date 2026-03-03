
import { ROLES } from "@/lib/permissions";

export const MOCK_USERS = [
  { id: 1, name: "Cecelia Bates", role: ROLES.ADMIN,    email: "cecelia@lambsflorist.com" },
  { id: 2, name: "Frank Bates",   role: ROLES.ADMIN,  email: "frank@lambsflorist.com"   },
  { id: 3, name: "Brittany Smith", role: ROLES.MANAGER, email: "brittany@lambsflorist.com"     },
  { id: 4, name: "Assistant Role", role: ROLES.EMPLOYEE, email: "AssistantRole@lambsflorist.com"     },
];

// Default to admin for development
export const DEFAULT_MOCK_USER = MOCK_USERS[0];