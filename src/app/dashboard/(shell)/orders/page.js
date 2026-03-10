
"use client";

import { useState, useMemo }   from "react";
import { useDashboardSession } from "@/app/dashboard/SessionContext";
import { canDo }               from "@/lib/permissions";
import StatusBadge             from "@/app/components/dashboard/StatusBadge/StatusBadge";
import OrderModal              from "@/app/components/dashboard/OrderModal/OrderModal";
import { ORDERS_MOCK, ORDER_STATUSES, STATUS_NEXT } from "@/lib/ordersData";
import { B }                   from "@/lib/brand";

export default function OrdersPage() {
  const { user } = useDashboardSession();

  const [orders,       setOrders     ] = useState(ORDERS_MOCK);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search,       setSearch     ] = useState("");
  const [selected,     setSelected   ] = useState(null);

  const canUpdate = canDo(user.role, "orders", "update");

  // Advance order status
  const handleAdvance = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Cancel order
  const handleCancel = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
    );
  };

  const filtered = useMemo(() => {
    let result = [...orders];
    if (filterStatus !== "all") result = result.filter((o) => o.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.deliveryZone.toLowerCase().includes(q)
      );
    }
    // Most recent first
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return result;
  }, [orders, filterStatus, search]);

  // Stat counts per status
  const counts = useMemo(() => {
    const map = { all: orders.length };
    ORDER_STATUSES.forEach((s) => {
      map[s.key] = orders.filter((o) => o.status === s.key).length;
    });
    return map;
  }, [orders]);

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div>
        <h1 className="font-serif font-black text-brand-black text-[26px] sm:text-[30px] tracking-[-1px] leading-none mb-1">
          Orders
        </h1>
        <p className="font-sans text-brand-smoke text-[13px]">
          {orders.length} total orders · click any row to view details and advance status
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {[
          { key: "all", label: "All", color: B.bark },
          ...ORDER_STATUSES,
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilterStatus(s.key)}
            className={`flex items-center gap-2 font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-4 py-2.5 border-2 cursor-pointer transition-colors whitespace-nowrap flex-shrink-0 ${
              filterStatus === s.key
                ? "border-brand-black text-brand-black bg-white shadow-retro-sm"
                : "border-gray-200 text-brand-smoke bg-white hover:border-gray-400"
            }`}
          >
            {filterStatus === s.key && (
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            )}
            {s.label}
            <span
              className="font-sans font-extrabold text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
              style={{
                background: `${s.color}18`,
                color: s.color,
              }}
            >
              {counts[s.key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-[340px]">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="#7A6A58" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="22" y2="22" />
        </svg>
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order #, customer, zone..."
          className="w-full border border-gray-200 pl-8 pr-3 py-2.5 font-sans text-[12px] text-brand-black placeholder:text-brand-smoke/60 focus:outline-none focus:border-brand-orange transition-colors bg-white"
        />
      </div>

      {/* Orders table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["Order #", "Customer", "Items", "Total", "Zone", "Delivery Date", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-sans font-extrabold text-[10px] tracking-[1.5px] uppercase text-brand-smoke whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="font-sans text-brand-smoke text-[13px]">No orders match your filters.</div>
                  </td>
                </tr>
              ) : filtered.map((order, i) => {
                const statusMeta  = ORDER_STATUSES.find((s) => s.key === order.status);
                const nextStatus  = STATUS_NEXT[order.status];
                const nextMeta    = nextStatus ? ORDER_STATUSES.find((s) => s.key === nextStatus) : null;

                return (
                  <tr
                    key={order.id}
                    onClick={() => setSelected(order)}
                    className={`border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-orange-50/40 transition-colors ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-sans font-extrabold text-[12px] text-brand-black tracking-[0.5px]">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-sans font-extrabold text-[13px] text-brand-black">{order.customerName}</div>
                      <div className="font-sans text-[11px] text-brand-smoke">{order.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-sans text-[12px] text-brand-smoke">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-sans font-black text-[14px] text-brand-black">${order.total}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-2 py-1 border"
                        style={{ color: B.orange, borderColor: `${B.orange}40`, background: `${B.orange}10` }}
                      >
                        {order.deliveryZone}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-sans text-[12px] text-brand-black">
                        {new Date(order.deliveryDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div className="font-sans text-[11px] text-brand-smoke capitalize">{order.deliveryWindow}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={statusMeta?.label}
                        color={statusMeta?.color}
                        dot={order.status === "out_for_delivery"}
                      />
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {canUpdate && nextMeta && (
                        <button
                          onClick={() => handleAdvance(order.id, nextStatus)}
                          className="font-sans font-extrabold text-[9px] tracking-[1px] uppercase px-3 py-1.5 border-2 border-brand-black bg-transparent cursor-pointer hover:text-brand-cream transition-colors whitespace-nowrap"
                          style={{ '--hover-bg': nextMeta.color }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = nextMeta.color;
                            e.currentTarget.style.color = "#F5F0E8";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#111111";
                          }}
                        >
                          → {nextMeta.label}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      {selected && (
        <OrderModal
          order={selected}
          onClose={() => setSelected(null)}
          onAdvance={handleAdvance}
          onCancel={handleCancel}
          userRole={user.role}
        />
      )}
    </div>
  );
}