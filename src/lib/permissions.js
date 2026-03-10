
// Single source of truth for role-based access control.
// Used by every dashboard page and component that has a protected action.
// Also used by API route handlers via getRequestUser().
//
// canDo(role, resource, action) → boolean
// ROLE_META[role] → { label, color }  (used for badges and UI)

// ── Permission matrix ─────────────────────────────────────────────
// true  = allowed
// false = denied (or key absent = denied)

const PERMISSIONS = {
  admin: {
    inventory : { create: true, read: true, update: true, delete: true },
    orders    : { create: true, read: true, update: true, delete: true },
    delivery  : { create: true, read: true, update: true, delete: true },
    employees : { create: true, read: true, update: true, delete: true },
    payments  : { create: true, read: true, update: true, delete: true },
    reports   : { read: true },
  },
  manager: {
    inventory : { create: true, read: true, update: true, delete: true },
    orders    : { create: true, read: true, update: true, delete: false },
    delivery  : { create: true, read: true, update: true, delete: false },
    employees : { create: false, read: true, update: false, delete: false },
    payments  : { read: true },
    reports   : { read: true },
  },
  employee: {
    inventory : { read: true },
    orders    : { read: true },
    delivery  : { read: true },
    employees : {},
    payments  : {},
    reports   : {},
  },
};

/**
 * canDo(role, resource, action) → boolean
 * @param {string} role     - "admin" | "manager" | "employee"
 * @param {string} resource - "inventory" | "orders" | "delivery" | "employees" | "payments" | "reports"
 * @param {string} action   - "create" | "read" | "update" | "delete"
 */
export function canDo(role, resource, action) {
  return PERMISSIONS[role]?.[resource]?.[action] === true;
}

// ── Role display metadata ─────────────────────────────────────────
// Used by DashboardTopbar, EmployeeModal, employees/page.js for
// colored badges and role selector UI.

export const ROLE_META = {
  admin: {
    label: "Admin",
    color: "#D4511A",   // brand orange
  },
  manager: {
    label: "Manager",
    color: "#C9A84C",   // brand gold
  },
  employee: {
    label: "Employee",
    color: "#7A6A58",   // brand smoke
  },
};
