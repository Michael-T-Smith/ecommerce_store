
"use client";
 
import { useState, useEffect, useCallback } from "react";
import Link                                  from "next/link";
import { useDashboardSession }               from "@/app/dashboard/SessionContext";
import StatCard                              from "@/app/components/dashboard/StatCard/StatCard";
import StatusBadge                           from "@/app/components/dashboard/StatusBadge/StatusBadge";
import { fetchInventory, fetchOrders }       from "@/lib/dashboardApi";
import { B }                                 from "@/lib/brand";
 
const ORDER_STATUS_COLORS = {
  pending         : "#F59E0B",
  confirmed       : "#3B82F6",
  preparing       : "#8B5CF6",
  out_for_delivery: "#D4511A",
  delivered       : "#22C55E",
  cancelled       : "#EF4444",
};
 
export default function DashboardOverview() {
  const { user } = useDashboardSession();
 
  const [invStats,      setInvStats     ] = useState(null);
  const [recentOrders,  setRecentOrders ] = useState([]);
  const [orderStats,    setOrderStats   ] = useState(null);
  const [loading,       setLoading      ] = useState(true);
 
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };
 
  const load = useCallback(async () => {
    try {
      const [invRes, orderRes] = await Promise.all([
        fetchInventory(),
        fetchOrders(),
      ]);
 
      const items  = invRes.data  ?? [];
      const orders = orderRes.data ?? [];
 
      // Inventory stats
      const total      = items.length;
      const inStock    = items.filter((i) => i.in_stock).length;
      const outOfStock = total - inStock;
      const lowStock   = items.filter(
        (i) => i.in_stock && i.stock_count <= i.low_stock_threshold
      ).length;
      const totalValue = items.reduce(
        (sum, i) => sum + Number(i.price) * i.stock_count, 0
      );
      const categories = [...new Set(items.map((i) => i.category))].length;
      setInvStats({ total, inStock, outOfStock, lowStock, totalValue, categories, items });
 
      // Order stats
      const pending   = orders.filter((o) => o.status === "pending").length;
      const today     = new Date().toISOString().split("T")[0];
      const todayOrds = orders.filter((o) => o.delivery_date === today).length;
      const revenue   = orders
        .filter((o) => o.status !== "cancelled")
        .reduce((s, o) => s + Number(o.total), 0);
      setOrderStats({ total: orders.length, pending, todayOrds, revenue });
      setRecentOrders(orders.slice(0, 8));
    } catch (err) {
      console.error("Dashboard overview load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => { load(); }, [load]);
 
  return (
    <div className="flex flex-col gap-8">
 
      <div>
        <h1 className="font-serif font-black text-brand-black text-[28px] sm:text-[32px] tracking-[-1px] leading-none mb-1">
          {greeting()}, {user.name.split(" ")[0]}.
        </h1>
        <p className="font-sans text-brand-smoke text-[13px]">
          Here&apos;s what&apos;s happening at Lamb&apos;s Florist today.
        </p>
      </div>
 
      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[110px] bg-gray-100 animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Items"
            value={String(invStats?.total ?? 0)}
            sub={`across ${invStats?.categories ?? 0} categories`}
            accent={B.orange}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>}
          />
          <StatCard
            label="In Stock"
            value={String(invStats?.inStock ?? 0)}
            sub={`${invStats?.outOfStock ?? 0} out of stock`}
            accent="#22C55E"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
            trend={invStats?.lowStock > 0 ? { direction: "down", label: `${invStats.lowStock} running low` } : null}
          />
          <StatCard
            label="Pending Orders"
            value={String(orderStats?.pending ?? 0)}
            sub={`${orderStats?.todayOrds ?? 0} delivering today`}
            accent={B.gold}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
          />
          <StatCard
            label="Total Revenue"
            value={`$${(orderStats?.revenue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            sub="all non-cancelled orders"
            accent={B.bark}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
          />
        </div>
      )}
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="font-sans font-extrabold text-[11px] tracking-[2px] uppercase text-brand-smoke">
              Recent Orders
            </div>
            <Link href="/dashboard/orders"
              className="font-sans font-extrabold text-[10px] tracking-[1.5px] uppercase text-brand-orange hover:text-brand-black no-underline transition-colors">
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="p-5 flex flex-col gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="px-5 py-12 text-center font-sans text-brand-smoke text-[13px]">
              No orders yet — they&apos;ll appear here once customers start ordering.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    {["Order #", "Customer", "Total", "Zone", "Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase text-brand-smoke">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}
                      className="border-b border-gray-50 last:border-b-0 hover:bg-orange-50/30 transition-colors">
                      <td className="px-4 py-2.5">
                        <span className="font-sans font-extrabold text-[11px] text-brand-black">
                          {o.order_number}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="font-sans text-[12px] text-brand-black truncate max-w-[140px]">
                          {o.customer_name}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="font-sans font-black text-[13px] text-brand-orange">
                          ${Number(o.total).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="font-sans text-[10px] uppercase tracking-[1px] font-extrabold text-brand-smoke">
                          {o.delivery_zone}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge
                          label={o.status?.replace(/_/g, " ")}
                          color={ORDER_STATUS_COLORS[o.status] ?? B.smoke}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
 
        {/* Needs Attention — low / out of stock */}
        <div className="bg-white border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="font-sans font-extrabold text-[11px] tracking-[2px] uppercase text-brand-smoke">
              ⚠ Needs Attention
            </div>
            <Link href="/dashboard/inventory"
              className="font-sans font-extrabold text-[10px] tracking-[1.5px] uppercase text-brand-orange hover:text-brand-black no-underline transition-colors">
              Inventory →
            </Link>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 animate-pulse" />
              ))
            ) : !invStats || invStats.items.filter(
                  (i) => !i.in_stock || i.stock_count <= i.low_stock_threshold
                ).length === 0 ? (
              <div className="font-sans text-[13px] text-brand-smoke/60 text-center py-8">
                All items well stocked ✓
              </div>
            ) : (
              invStats.items
                .filter((i) => !i.in_stock || i.stock_count <= i.low_stock_threshold)
                .slice(0, 7)
                .map((item) => (
                  <div key={item.id}
                    className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-b-0">
                    <div className="w-8 h-8 bg-brand-cream border border-brand-black/10 flex items-center justify-center flex-shrink-0 text-[18px]">
                      {item.emoji ?? "🌸"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-sans font-extrabold text-[12px] text-brand-black truncate">
                        {item.name}
                      </div>
                      <div className="font-sans text-[10px] text-brand-smoke">{item.sku}</div>
                    </div>
                    <span className={`font-sans font-extrabold text-[9px] tracking-[1px] uppercase px-2 py-1 flex-shrink-0 ${
                      !item.in_stock
                        ? "text-red-500 bg-red-50 border border-red-200"
                        : "text-amber-600 bg-amber-50 border border-amber-200"
                    }`}>
                      {!item.in_stock ? "Out" : `Low (${item.stock_count})`}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}