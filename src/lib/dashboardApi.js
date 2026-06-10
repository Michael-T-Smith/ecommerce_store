
// Usage:
//   import { fetchInventory, updateInventoryItem } from "@/lib/dashboardApi";
//   const { data } = await fetchInventory({ category: "Bouquets" });

const BASE = "/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json;
}

function qs(params = {}) {
  const str = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ""))
  ).toString();
  return str ? `?${str}` : "";
}

// ── Inventory ─────────────────────────────────────────────────────
export const fetchInventory = (params = {}) =>
  apiFetch(`/inventory${qs(params)}`);

export const createInventoryItem = (data) =>
  apiFetch("/inventory", { method: "POST", body: JSON.stringify(data) });

export const updateInventoryItem = (id, data) =>
  apiFetch(`/inventory/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteInventoryItem = (id) =>
  apiFetch(`/inventory/${id}`, { method: "DELETE" });

// ── Orders ────────────────────────────────────────────────────────
export const fetchOrders = (params = {}) =>
  apiFetch(`/orders${qs(params)}`);

export const fetchOrder = (id) =>
  apiFetch(`/orders/${id}`);

export const createOrder = (data) =>
  apiFetch("/orders", { method: "POST", body: JSON.stringify(data) });

export const updateOrder = (id, data) =>
  apiFetch(`/orders/${id}`, { method: "PATCH", body: JSON.stringify(data) });

// ── Deliveries ────────────────────────────────────────────────────
export const fetchDeliveries = (params = {}) =>
  apiFetch(`/deliveries${qs(params)}`);

export const updateDelivery = (id, data) =>
  apiFetch(`/deliveries/${id}`, { method: "PATCH", body: JSON.stringify(data) });

// ── Employees ─────────────────────────────────────────────────────
export const fetchEmployees = (params = {}) =>
  apiFetch(`/employees${qs(params)}`);

export const createEmployee = (data) =>
  apiFetch("/employees", { method: "POST", body: JSON.stringify(data) });

export const updateEmployee = (id, data) =>
  apiFetch(`/employees/${id}`, { method: "PATCH", body: JSON.stringify(data) });

// ── Notes ─────────────────────────────────────────────────────────
export const fetchNotes = (params = {}) =>
  apiFetch(`/notes${qs(params)}`);

export const createNote = (data) =>
  apiFetch("/notes", { method: "POST", body: JSON.stringify(data) });

export const updateNote = (id, data) =>
  apiFetch(`/notes/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteNote = (id) =>
  apiFetch(`/notes/${id}`, { method: "DELETE" });

// ── Giving Back ───────────────────────────────────────────────────
export const fetchGivingBack = (params = {}) =>
  apiFetch(`/givingback${qs(params)}`);

export const createGivingBackItem = (data) =>
  apiFetch("/givingback", { method: "POST", body: JSON.stringify(data) });

export const updateGivingBackItem = (id, data) =>
  apiFetch(`/givingback/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteGivingBackItem = (id) =>
  apiFetch(`/givingback/${id}`, { method: "DELETE" });

// ── Collections ───────────────────────────────────────────────────
export const fetchCollections  = (params = {}) =>
  apiFetch(`/collections${qs(params)}`);

export const createCollection  = (data) =>
  apiFetch("/collections", { method: "POST", body: JSON.stringify(data) });

export const updateCollection  = (id, data) =>
  apiFetch(`/collections/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteCollection  = (id) =>
  apiFetch(`/collections/${id}`, { method: "DELETE" });