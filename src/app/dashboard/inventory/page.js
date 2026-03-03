
"use client";

import { useState, useMemo }    from "react";
import { useDashboardSession }  from "@/app/dashboard/SessionContext";
import { canDo }                from "@/lib/permissions";
import InventoryTable           from "@/app/components/dashboard/InventoryTable/InventoryTable";
import InventoryModal           from "@/app/components/dashboard/InventoryModal/InventoryModal";
import StatCard                 from "@/app/components/dashboard/StatCard/StatCard";
import { INVENTORY_MOCK, INVENTORY_CATEGORIES } from "@/lib/inventoryData";
import { B }                    from "@/lib/brand";

export default function InventoryPage() {
  const { user }  = useDashboardSession();

  // ── Local data state (replace with API calls when DB is live) ──
  const [items,        setItems      ] = useState(INVENTORY_MOCK);

  // ── Filter / search state ──────────────────────────────────────
  const [search,       setSearch     ] = useState("");
  const [filterCat,    setFilterCat  ] = useState("All");
  const [filterStock,  setFilterStock] = useState("all");   // all | in | out | low

  // ── Modal state ───────────────────────────────────────────────
  const [modalMode,    setModalMode  ] = useState(null);    // null | "add" | "edit"
  const [editItem,     setEditItem   ] = useState(null);

  // ── Delete confirmation state ─────────────────────────────────
  const [confirmDelete, setConfirmDelete] = useState(null); // null | item id

  // ── Permission flags ──────────────────────────────────────────
  const canCreate = canDo(user.role, "inventory", "create");

  // ── Derived: filtered items ───────────────────────────────────
  const filteredItems = useMemo(() => {
    let result = [...items];
    if (filterCat !== "All") {
      result = result.filter((i) => i.category === filterCat);
    }
    if (filterStock === "in")  result = result.filter((i) => i.inStock && i.stockCount > i.lowStockThreshold);
    if (filterStock === "out") result = result.filter((i) => !i.inStock);
    if (filterStock === "low") result = result.filter((i) => i.inStock && i.stockCount <= i.lowStockThreshold);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) =>
        i.name.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q)  ||
        i.supplier.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, filterCat, filterStock, search]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleSave = (formData) => {
    if (modalMode === "add") {
      const newItem = {
        ...formData,
        id: Math.max(...items.map((i) => i.id)) + 1,
      };
      setItems((prev) => [...prev, newItem]);
    } else if (modalMode === "edit" && editItem) {
      setItems((prev) =>
        prev.map((i) => (i.id === editItem.id ? { ...i, ...formData } : i))
      );
    }
    setModalMode(null);
    setEditItem(null);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setModalMode("edit");
  };

  const handleDelete = (id) => setConfirmDelete(id);

  const confirmDeleteAction = () => {
    setItems((prev) => prev.filter((i) => i.id !== confirmDelete));
    setConfirmDelete(null);
  };

  const handleToggleStock = (id) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, inStock: !i.inStock, stockCount: !i.inStock ? 1 : 0 } : i
      )
    );
  };

  // Quick stat counts
  const inStockCount  = items.filter((i) => i.inStock).length;
  const outCount      = items.filter((i) => !i.inStock).length;
  const lowCount      = items.filter((i) => i.inStock && i.stockCount <= i.lowStockThreshold).length;

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-brand-black text-[26px] sm:text-[30px] tracking-[-1px] leading-none mb-1">
            Inventory
          </h1>
          <p className="font-sans text-brand-smoke text-[13px]">
            {items.length} total items · manage stock, pricing, and availability
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setModalMode("add")}
            className="font-sans font-extrabold text-[12px] tracking-[1.5px] uppercase bg-brand-orange text-brand-cream border-2 border-brand-black px-6 py-3 cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all self-start sm:self-auto flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Item
          </button>
        )}
      </div>

      {/* Mini stat row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "In Stock",   value: inStockCount, accent: "#22C55E" },
          { label: "Out of Stock", value: outCount,   accent: "#EF4444" },
          { label: "Low Stock",  value: lowCount,     accent: "#F59E0B" },
        ].map((s) => (
          <div key={s.label}
            className="bg-white border border-gray-200 px-4 py-3 flex items-center gap-3"
            style={{ borderLeft: `4px solid ${s.accent}` }}
          >
            <span className="font-serif font-black text-[24px] text-brand-black leading-none">{s.value}</span>
            <span className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase text-brand-smoke leading-tight">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-200 px-4 py-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">

        {/* Search */}
        <div className="relative max-w-[300px] w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="#7A6A58" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="22" y2="22" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, SKU, supplier..."
            className="w-full border border-gray-200 pl-8 pr-3 py-2 font-sans text-[12px] text-brand-black placeholder:text-brand-smoke/60 focus:outline-none focus:border-brand-orange transition-colors"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Category filter */}
          {["All", ...INVENTORY_CATEGORIES].map((cat) => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-3 py-2 border cursor-pointer transition-colors ${
                filterCat === cat
                  ? "bg-brand-orange text-brand-cream border-brand-orange"
                  : "bg-white text-brand-smoke border-gray-200 hover:border-brand-orange hover:text-brand-orange"
              }`}
            >{cat}</button>
          ))}

          {/* Stock filter */}
          <div className="w-px bg-gray-200 mx-1" />
          {[
            { key: "all", label: "All Stock" },
            { key: "in",  label: "In Stock"  },
            { key: "low", label: "Low"        },
            { key: "out", label: "Out"        },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilterStock(f.key)}
              className={`font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-3 py-2 border cursor-pointer transition-colors ${
                filterStock === f.key
                  ? "bg-brand-black text-brand-cream border-brand-black"
                  : "bg-white text-brand-smoke border-gray-200 hover:border-brand-black hover:text-brand-black"
              }`}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <InventoryTable
        items={filteredItems}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStock={handleToggleStock}
        userRole={user.role}
      />

      {/* Add / Edit modal */}
      {modalMode && (
        <InventoryModal
          mode={modalMode}
          item={editItem}
          onSave={handleSave}
          onClose={() => { setModalMode(null); setEditItem(null); }}
        />
      )}

      {/* Delete confirmation dialog */}
      {confirmDelete !== null && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(17,17,17,0.6)" }}
        >
          <div className="bg-white border-[3px] border-brand-black p-8 max-w-[400px] w-full shadow-retro-lg">
            <div className="text-[40px] mb-4">⚠️</div>
            <h3 className="font-serif font-black text-brand-black text-[22px] tracking-[-0.5px] mb-2">
              Delete this item?
            </h3>
            <p className="font-sans text-brand-smoke text-[13px] leading-relaxed mb-6">
              This will permanently remove the item from inventory.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 font-sans font-extrabold text-[12px] tracking-[1px] uppercase py-3 border-2 border-gray-300 text-brand-smoke bg-white cursor-pointer hover:border-brand-black hover:text-brand-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAction}
                className="flex-1 font-sans font-extrabold text-[12px] tracking-[1px] uppercase py-3 bg-red-500 text-white border-2 border-red-600 cursor-pointer hover:bg-red-600 transition-colors shadow-retro-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}