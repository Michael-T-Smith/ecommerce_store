"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useDashboardSession }  from "@/app/dashboard/SessionContext";
import { canDo }                from "@/lib/permissions";
import InventoryTable           from "@/app/components/dashboard/InventoryTable/InventoryTable";
import InventoryModal           from "@/app/components/dashboard/InventoryModal/InventoryModal";
import StatCard                 from "@/app/components/dashboard/StatCard/StatCard";
import { PageSpinner, PageError } from "@/app/components/dashboard/PageStates/PageStates";
import {
  fetchInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "@/lib/dashboardApi";
import { B } from "@/lib/brand";

const CATEGORIES = ["All", "Bouquets", "Arrangements", "Plants", "Seasonal", "Gifts"];
const LOCATIONS  = [
  { value: "all",       label: "All Locations" },
  { value: "piedmont",  label: "Piedmont"       },
  { value: "anniston",  label: "Anniston"       },
];

// Map snake_case DB row → camelCase for UI components
function remapItem(row) {
  return {
    id                : row.id,
    sku               : row.sku,
    name              : row.name,
    description       : row.description,
    price             : Number(row.price),
    costPrice         : Number(row.cost_price),
    category          : row.category,
    tag               : row.tag,
    emoji             : row.emoji,
    imagePath         : row.image_path,
    sizes             : row.sizes,
    supplier          : row.supplier,
    stockCount        : row.stock_count,
    lowStockThreshold : row.low_stock_threshold,
    inStock           : row.in_stock,
    isFeatured        : row.is_featured        ?? false,
    featuredAccent    : row.featured_accent     ?? "#D4511A",
    createdAt         : row.created_at,
  };
}

export default function InventoryPage() {
  const { user } = useDashboardSession();

  const [items,         setItems        ] = useState([]);
  const [loading,       setLoading      ] = useState(true);
  const [apiError,      setApiError     ] = useState(null);
  const [search,        setSearch       ] = useState("");
  const [filterCat,     setFilterCat    ] = useState("All");
  const [filterStock,   setFilterStock  ] = useState("all");
  const [filterLocation,setFilterLocation] = useState("all");
  const [modalMode,     setModalMode    ] = useState(null);
  const [editItem,      setEditItem     ] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const canCreate = canDo(user.role, "inventory", "create");
  const canEdit   = canDo(user.role, "inventory", "update");
  const canDelete = canDo(user.role, "inventory", "delete");
  
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);
      const params = {};
      if (filterCat !== "All") params.category = filterCat;
      if (filterStock === "in")  params.inStock = "true";
      if (filterStock === "out") params.inStock = "false";
      // Location filter is client-side (no location column on main inventory yet — uses variants)
      const res = await fetchInventory(params);
      setItems(res.data.map(remapItem));
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterCat, filterStock]);

  useEffect(() => { load(); }, [load]);

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (filterStock === "low") {
      result = result.filter((i) => i.inStock && i.stockCount <= i.lowStockThreshold);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) =>
        i.name.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q)  ||
        (i.supplier ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, filterStock, search]);

  const handleSave = async (formData) => {
    try {
      if (modalMode === "add") {
        const res = await createInventoryItem(formData);
        setItems((prev) => [...prev, remapItem(res.data)]);
      } else if (modalMode === "edit" && editItem) {
        const res = await updateInventoryItem(editItem.id, formData);
        setItems((prev) =>
          prev.map((i) => (i.id === editItem.id ? remapItem(res.data) : i))
        );
      }
      setModalMode(null);
      setEditItem(null);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleEdit   = (item) => { setEditItem(item); setModalMode("edit"); };
  const handleDelete = (id)   => setConfirmDelete(id);

  const confirmDeleteAction = async () => {
    try {
      await deleteInventoryItem(confirmDelete);
      setItems((prev) => prev.filter((i) => i.id !== confirmDelete));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleToggleStock = async (item) => {
    const newVal = !item.inStock;
    setItems((prev) =>
      prev.map((i) => i.id === item.id ? { ...i, inStock: newVal } : i)
    );
    try {
      await updateInventoryItem(item.id, { inStock: newVal });
    } catch (err) {
      load(); // Revert
      alert(`Update failed: ${err.message}`);
    }
  };

  const inStockCount = items.filter((i) => i.inStock).length;
  const outCount     = items.filter((i) => !i.inStock).length;
  const lowCount     = items.filter((i) => i.inStock && i.stockCount <= i.lowStockThreshold).length;

  if (loading) return <PageSpinner label="Loading Inventory" />;
  if (apiError) return <PageError message={apiError} onRetry={load} />;
  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-brand-black text-[26px] sm:text-[30px] tracking-[-1px] leading-none mb-1">
            Inventory
          </h1>
          <p className="font-sans text-brand-smoke text-[13px]">
            {items.length} products · {inStockCount} in stock
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => { setEditItem(null); setModalMode("add"); }}
            className="font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase px-5 py-3 bg-brand-black text-brand-cream border-[3px] border-brand-black cursor-pointer shadow-retro-sm hover:bg-brand-orange hover:border-brand-orange transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Item
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total" value={String(items.length)} sub="products" accent={B.orange}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>} />
        <StatCard label="In Stock" value={String(inStockCount)} sub="available" accent="#22C55E"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>} />
        <StatCard label="Out of Stock" value={String(outCount)} sub="unavailable" accent="#EF4444"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>} />
        <StatCard label="Running Low" value={String(lowCount)} sub="below threshold" accent={B.gold}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="#7A6A58" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="22" y2="22" />
          </svg>
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, SKU, supplier…"
            className="w-full border border-gray-200 pl-8 pr-3 py-2.5 font-sans text-[12px] placeholder:text-brand-smoke/60 focus:outline-none focus:border-brand-orange bg-white transition-colors"
          />
        </div>

        {/* Category */}
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="border border-gray-200 px-3 py-2.5 font-sans font-extrabold text-[11px] text-brand-smoke bg-white cursor-pointer focus:outline-none focus:border-brand-orange">
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>

        {/* Stock status */}
        <div className="flex gap-1">
          {[
            { key: "all", label: "All"   },
            { key: "in",  label: "In"    },
            { key: "out", label: "Out"   },
            { key: "low", label: "Low"   },
          ].map((s) => (
            <button key={s.key} onClick={() => setFilterStock(s.key)}
              className={`font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-3 py-2 border-2 cursor-pointer transition-colors ${
                filterStock === s.key
                  ? "border-brand-black bg-brand-black text-brand-cream"
                  : "border-gray-200 text-brand-smoke hover:border-gray-400"
              }`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Location filter */}
        <div className="flex gap-1 border-l border-gray-200 pl-3">
          <span className="font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase text-brand-smoke self-center mr-1">
            Location:
          </span>
          {LOCATIONS.map((loc) => (
            <button key={loc.value} onClick={() => setFilterLocation(loc.value)}
              className={`font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-3 py-2 border-2 cursor-pointer transition-colors ${
                filterLocation === loc.value
                  ? "border-brand-orange bg-brand-orange text-brand-cream"
                  : "border-gray-200 text-brand-smoke hover:border-gray-400"
              }`}>
              {loc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location notice when filtering — variant stock by location is in migration 003 */}
      {filterLocation !== "all" && (
        <div className="bg-amber-50 border border-amber-200 px-4 py-3 font-sans text-[12px] text-amber-800 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Showing all products — per-location stock counts are in{" "}
          <strong>inventory_stock</strong> table (migration 003). Location stock detail view coming in next update.
        </div>
      )}

      <InventoryTable
        items={filteredItems}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={canEdit ? handleEdit : null}
        onDelete={canDelete ? handleDelete : null}
        onToggleStock={canEdit ? handleToggleStock : null}
      />

      {/* Delete confirmation */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
          <div className="bg-white border-[3px] border-brand-black p-8 max-w-sm w-full shadow-retro-lg">
            <h3 className="font-serif font-black text-brand-black text-[22px] tracking-[-0.5px] mb-3">
              Delete Item?
            </h3>
            <p className="font-sans text-brand-smoke text-[13px] mb-6 leading-relaxed">
              This will permanently remove the item from the database. Orders that
              reference it will retain their snapshot. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase border-2 border-gray-200 text-brand-smoke cursor-pointer hover:border-gray-400 transition-colors bg-white">
                Cancel
              </button>
              <button onClick={confirmDeleteAction}
                className="flex-1 py-3 font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase border-2 border-red-500 bg-red-500 text-white cursor-pointer hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {modalMode && (
        <InventoryModal
          mode={modalMode}
          item={editItem}
          onSave={handleSave}
          onClose={() => { setModalMode(null); setEditItem(null); }}
        />
      )}
    </div>
  );
}