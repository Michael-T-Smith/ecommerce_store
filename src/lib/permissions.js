//============================================================
//  FILE: src/lib/permissions.js  (NEW)
//  Single source of truth for all role-based access control.
//  Every dashboard component imports canDo() — nothing else.
//
//  When real auth is wired: replace getMockRole() with a real
//  session lookup. canDo() signature never changes, so every
//  component that uses it requires zero edits.
//
//  Roles:    admin | manager | employee
//  Resources: inventory | orders | delivery | employees | users
//  Actions:  create | read | update | delete
// ================================================================

export const ROLES = {
  ADMIN    : "admin",
  MANAGER  : "manager",
  EMPLOYEE : "employee",
};

// Permission matrix — mirrors the DB-control spec from the project outline
const PERMISSIONS = {
  inventory: {
    create : [ROLES.ADMIN, ROLES.MANAGER],
    read   : [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
    update : [ROLES.ADMIN, ROLES.MANAGER],
    delete : [ROLES.ADMIN, ROLES.MANAGER],
  },
  orders: {
    create : [ROLES.ADMIN, ROLES.MANAGER],
    read   : [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
    update : [ROLES.ADMIN, ROLES.MANAGER],
    delete : [ROLES.ADMIN],
  },
  delivery: {
    create : [ROLES.ADMIN, ROLES.MANAGER],
    read   : [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
    update : [ROLES.ADMIN, ROLES.MANAGER],
    delete : [ROLES.ADMIN],
  },
  employees: {
    create : [ROLES.ADMIN],
    read   : [ROLES.ADMIN, ROLES.MANAGER],
    update : [ROLES.ADMIN],
    delete : [ROLES.ADMIN],
  },
  reports: {
    create : [ROLES.ADMIN],
    read   : [ROLES.ADMIN],
    update : [ROLES.ADMIN],
    delete : [ROLES.ADMIN],
  },
  users: {
    create : [ROLES.ADMIN],
    read   : [ROLES.ADMIN],
    update : [ROLES.ADMIN],
    delete : [ROLES.ADMIN],
  },
};

/**
 * canDo(role, resource, action) → boolean
 * Use this everywhere in the dashboard.
 *
 * Example:
 *   canDo("manager", "inventory", "delete") → true
 *   canDo("employee", "inventory", "delete") → false
 */
export function canDo(role, resource, action) {
  if (!role || !resource || !action) return false;
  const allowed = PERMISSIONS[resource]?.[action];
  if (!allowed) return false;
  return allowed.includes(role);
}

// Role display metadata — labels and colors for UI badges
export const ROLE_META = {
  [ROLES.ADMIN]    : { label: "Admin",    color: "#D4511A" },
  [ROLES.MANAGER]  : { label: "Manager",  color: "#C9A84C" },
  [ROLES.EMPLOYEE] : { label: "Employee", color: "#7A6A58" },
};