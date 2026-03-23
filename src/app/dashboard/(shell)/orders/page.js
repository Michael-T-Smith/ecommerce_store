"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useDashboardSession }  from "@/app/dashboard/SessionContext";
import { canDo }                from "@/lib/permissions";
import StatusBadge              from "@/app/components/dashboard/StatusBadge/StatusBadge";
import OrderModal               from "@/app/components/dashboard/OrderModal/OrderModal";
import { fetchOrders, updateOrder } from "@/lib/dashboardApi";
import { ORDER_STATUSES, STATUS_NEXT, STATUS_PREV } from "@/lib/ordersData";
import { B }                    from "@/lib/brand";
import { PageSpinner, PageError } from "../employees/page";

const SORT_HEADERS = [
  { label: "Order #",       key: "orderNumber"  },
  { label: "Customer",      key: "customerName" },
  { label: "Items",         key: "itemCount"    },
  { label: "Total",         key: "total"        },
  { label: "Zone",          key: "deliveryZone" },
  { label: "Delivery Date", key: "deliveryDate" },
  { label: "Status",        key: "status"       },
  { label: "",              key: null           },
];

// Returns color tier for delivery deadline badge, null if not applicable
function deadlineTier(dateStr, status) {
  if (!dateStr || status === "delivered" || status === "cancelled") return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.slice(0, 10).split("-");
  const due  = new Date(Number(y), Number(m) - 1, Number(d));
  const diff = Math.floor((due - today) / 86400000);
  if (diff <= 0) return { bg: "#FEF2F2", color: "#DC2626", label: diff === 0 ? "Today" : "Overdue" };
  if (diff === 1) return { bg: "#FFFBEB", color: "#D97706", label: "Tomorrow" };
  return { bg: "#F0FDF4", color: "#16A34A", label: null };
}

// snake_case DB row → camelCase for components
function remapOrder(row) {
  return {
    id              : row.id,
    orderNumber     : row.order_number,
    customerName    : row.customer_name,
    customerEmail   : row.customer_email,
    customerPhone   : row.customer_phone,
    items           : typeof row.items === "string" ? JSON.parse(row.items) : row.items,
    subtotal        : Number(row.subtotal),
    deliveryFee     : Number(row.delivery_fee),
    total           : Number(row.total),
    status          : row.status,
    deliveryAddress : row.delivery_address,
    deliveryZone    : row.delivery_zone,
    deliveryDate    : row.delivery_date,
    deliveryWindow  : row.delivery_window,
    pickupTime      : row.pickup_time,
    pickupLocation  : row.pickup_location,
    noteMessage     : row.note_message,
    staffNotes      : row.staff_notes,
    stripePaymentId : row.stripe_payment_id,
    createdAt       : row.created_at,
  };
}

export default function OrdersPage() {
  const { user } = useDashboardSession();

  const [orders,       setOrders      ] = useState([]);
  const [loading,      setLoading     ] = useState(true);
  const [apiError,     setApiError    ] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search,       setSearch      ] = useState("");
  const [selected,     setSelected    ] = useState(null);
  const [sortCol,      setSortCol     ] = useState("deliveryDate");
  const [sortDir,      setSortDir     ] = useState("asc");
  const [hideArchived, setHideArchived] = useState(true);

  const canUpdate    = canDo(user.role, "orders", "update");
  const canBackpedal = user.role === "admin" || user.role === "manager";

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);
      const res = await fetchOrders();
      setOrders(res.data.map(remapOrder));
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdvance = async (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    try {
      await updateOrder(orderId, { status: newStatus });
    } catch (err) {
      load();
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleBackpedal = async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const prevStatus = STATUS_PREV[order.status];
    if (!prevStatus) return;

    setOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, status: prevStatus } : o)
    );
    try {
      await updateOrder(orderId, { status: prevStatus });
    } catch (err) {
      load();
      alert(`Status revert failed: ${err.message}`);
    }
  };

  const handleCancel = async (orderId) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
    );
    try {
      await updateOrder(orderId, { status: "cancelled" });
    } catch (err) {
      load();
      alert(`Cancel failed: ${err.message}`);
    }
  };

  // Called by OrderModal when edit form is saved
  const handleSave = (updatedOrder) => {
    setOrders((prev) => prev.map((o) => o.id === updatedOrder.id ? updatedOrder : o));
    setSelected(updatedOrder);
  };

  const handleSort = (key) => {
    if (!key) return;
    setSortDir((prev) => sortCol === key ? (prev === "asc" ? "desc" : "asc") : "asc");
    setSortCol(key);
  };

  const filtered = useMemo(() => {
    let result = [...orders];
    if (hideArchived && filterStatus === "all") result = result.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
    if (filterStatus !== "all") result = result.filter((o) => o.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        (o.deliveryAddress || "").toLowerCase().includes(q)
      );
    }
    if (sortCol) {
      result.sort((a, b) => {
        let av = sortCol === "itemCount" ? (a.items?.length ?? 0) : a[sortCol];
        let bv = sortCol === "itemCount" ? (b.items?.length ?? 0) : b[sortCol];
        if (sortCol === "deliveryDate") {
          av = av ? new Date(av.slice(0, 10)) : new Date(0);
          bv = bv ? new Date(bv.slice(0, 10)) : new Date(0);
        }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [orders, filterStatus, search, sortCol, sortDir, hideArchived]);

  const counts = useMemo(() => {
    const map = { all: orders.length };
    ORDER_STATUSES.forEach((s) => {
      map[s.key] = orders.filter((o) => o.status === s.key).length;
    });
    return map;
  }, [orders]);

  if (loading) return <PageSpinner label="Loading Orders" />;
  if (apiError) return <PageError message={apiError} onRetry={load} />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif font-black text-brand-black text-[26px] sm:text-[30px] tracking-[-1px] leading-none mb-1">
          Orders
        </h1>
        <p className="font-sans text-brand-smoke text-[13px]">
          {filtered.length} {hideArchived ? "active" : "total"} orders · click any row to view details
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {[{ key: "all", label: "All", color: B.bark }, ...ORDER_STATUSES].map((s) => (
          <button key={s.key} onClick={() => setFilterStatus(s.key)}
            className={`flex items-center gap-2 font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-4 py-2.5 border-2 cursor-pointer transition-colors whitespace-nowrap flex-shrink-0 ${
              filterStatus === s.key
                ? "border-brand-black text-brand-black bg-white shadow-retro-sm"
                : "border-gray-200 text-brand-smoke bg-white hover:border-gray-400"
            }`}>
            {filterStatus === s.key && (
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            )}
            {s.label}
            <span className="font-sans font-extrabold text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
              style={{ background: `${s.color}18`, color: s.color }}>
              {counts[s.key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search + archive toggle */}
      <div className="flex items-center gap-3 flex-wrap">
      <div className="relative max-w-[340px] flex-1">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="#7A6A58" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="22" y2="22" />
        </svg>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order #, customer, zone..."
          className="w-full border border-gray-200 pl-8 pr-3 py-2.5 font-sans text-[12px] text-brand-black placeholder:text-brand-smoke/60 focus:outline-none focus:border-brand-orange transition-colors bg-white" />
      </div>
        <button onClick={() => setHideArchived((v) => !v)}
          className={`font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-4 py-2.5 border-2 cursor-pointer transition-colors whitespace-nowrap ${
            hideArchived ? "border-gray-200 text-brand-smoke bg-white hover:border-gray-400" : "border-brand-black text-brand-black bg-white"
          }`}>
          {hideArchived ? "Show Archived" : "Hide Archived"}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {SORT_HEADERS.map((h) => (
                  <th key={h.label} onClick={() => handleSort(h.key)}
                    className={`text-left px-4 py-3 font-sans font-extrabold text-[10px] tracking-[1.5px] uppercase text-brand-smoke whitespace-nowrap ${h.key ? "cursor-pointer select-none hover:text-brand-black transition-colors" : ""}`}>
                    <span className="inline-flex items-center gap-1">
                      {h.label}
                      {h.key && sortCol === h.key && (
                        <span className="text-brand-orange">{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-16 text-center font-sans text-brand-smoke text-[13px]">
                  No orders match your filters.
                </td></tr>
              ) : filtered.map((order, i) => {
                const statusMeta = ORDER_STATUSES.find((s) => s.key === order.status);
                const nextStatus = STATUS_NEXT[order.status];
                const nextMeta   = nextStatus ? ORDER_STATUSES.find((s) => s.key === nextStatus) : null;
                const prevStatus = STATUS_PREV[order.status];
                const tier       = deadlineTier(order.deliveryDate, order.status);

                return (
                  <tr key={order.id} onClick={() => setSelected(order)}
                    className={`border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-orange-50/40 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                    <td className="px-4 py-3">
                      <span className="font-sans font-extrabold text-[12px] text-brand-black tracking-[0.5px]">{order.orderNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-sans font-extrabold text-[13px] text-brand-black">{order.customerName}</div>
                      <div className="font-sans text-[11px] text-brand-smoke">{order.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-sans text-[12px] text-brand-smoke">{order.items?.length ?? 0} item{order.items?.length !== 1 ? "s" : ""}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-sans font-black text-[14px] text-brand-black">${order.total}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-2 py-1 border"
                        style={{ color: B.orange, borderColor: `${B.orange}40`, background: `${B.orange}10` }}>
                        {order.deliveryZone}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {order.deliveryDate ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-sans font-extrabold text-[11px] px-2 py-0.5 rounded-sm inline-block"
                            style={tier ? { background: tier.bg, color: tier.color } : { color: "#374151" }}>
                            {(() => {
                              const [y, m, d] = order.deliveryDate.slice(0, 10).split("-");
                              return new Date(Number(y), Number(m) - 1, Number(d))
                                .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                            })()}
                            {tier?.label && <span className="ml-1">· {tier.label}</span>}
                          </span>
                          <span className="font-sans text-[10px] text-brand-smoke capitalize pl-2">{order.deliveryWindow}</span>
                        </div>
                      ) : (
                        <span className="font-sans text-[12px] text-brand-smoke/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={statusMeta?.label} color={statusMeta?.color}
                        dot={order.status === "out_for_delivery"} />
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1.5 items-center">
                        {canBackpedal && prevStatus && (
                          <button onClick={() => handleBackpedal(order.id)}
                            title="Revert to previous status"
                            className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-2.5 py-1.5 border-2 border-gray-300 text-brand-smoke bg-white cursor-pointer hover:bg-gray-100 transition-colors">
                            ←
                          </button>
                        )}
                        {canUpdate && nextMeta && (
                          <button onClick={() => handleAdvance(order.id, nextStatus)}
                            className="font-sans font-extrabold text-[9px] tracking-[1px] uppercase px-3 py-1.5 border-2 border-brand-black bg-transparent cursor-pointer whitespace-nowrap transition-colors"
                            onMouseEnter={(e) => { e.currentTarget.style.background = nextMeta.color; e.currentTarget.style.color = "#F5F0E8"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#111111"; }}>
                            → {nextMeta.label}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <OrderModal
          order={selected}
          onClose={() => setSelected(null)}
          onAdvance={handleAdvance}
          onBackpedal={handleBackpedal}
          onCancel={handleCancel}
          onSave={handleSave}
          userRole={user.role}
        />
      )}
    </div>
  );
}
