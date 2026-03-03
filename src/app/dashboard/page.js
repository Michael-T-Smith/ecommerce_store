
"use client";

import { useMemo }               from "react";
import { useDashboardSession }   from "@/app/dashboard/SessionContext";
import StatCard                  from "@/app/components/dashboard/StatCard/StatCard";
import { INVENTORY_MOCK }        from "@/lib/inventoryData";
import { B }                     from "@/lib/brand";

export default function DashboardOverview() {
  const { user } = useDashboardSession();

  // Derived stat counts from mock inventory
  const stats = useMemo(() => {
    const total      = INVENTORY_MOCK.length;
    const inStock    = INVENTORY_MOCK.filter((i) => i.inStock).length;
    const outOfStock = total - inStock;
    const lowStock   = INVENTORY_MOCK.filter((i) => i.inStock && i.stockCount <= i.lowStockThreshold).length;
    const categories = [...new Set(INVENTORY_MOCK.map((i) => i.category))].length;
    const totalValue = INVENTORY_MOCK.reduce((sum, i) => sum + i.price * i.stockCount, 0);
    return { total, inStock, outOfStock, lowStock, categories, totalValue };
  }, []);

  return (
    <div className="flex flex-col gap-8">

      {/* Page title */}
      <div>
        <h1 className="font-serif font-black text-brand-black text-[28px] sm:text-[32px] tracking-[-1px] leading-none mb-1">
          Good morning, {user.name.split(" ")[0]}.
        </h1>
        <p className="font-sans text-brand-smoke text-[13px]">
          Here&apos;s what&apos;s happening at Lamb&apos;s Florist today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Items"
          value={String(stats.total)}
          sub={`across ${stats.categories} categories`}
          accent={B.orange}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          }
          trend={{ direction: "up", label: "+2 this month" }}
        />
        <StatCard
          label="In Stock"
          value={String(stats.inStock)}
          sub="available to order"
          accent="#22C55E"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        />
        <StatCard
          label="Low / Out of Stock"
          value={String(stats.lowStock + stats.outOfStock)}
          sub={`${stats.outOfStock} out · ${stats.lowStock} low`}
          accent="#EF4444"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
          trend={stats.outOfStock > 0 ? { direction: "down", label: "needs attention" } : null}
        />
        <StatCard
          label="Inventory Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          sub="at sale price"
          accent={B.gold}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
      </div>

      {/* Analytics placeholder panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue chart placeholder — large */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1">
                Revenue Over Time
              </div>
              <div className="font-serif font-black text-brand-black text-[22px] tracking-[-0.5px]">
                $0.00
              </div>
            </div>
            <span className="font-sans font-extrabold text-[9px] tracking-[2px] uppercase text-brand-smoke bg-gray-100 border border-gray-200 px-3 py-1.5">
              Coming Soon
            </span>
          </div>
          {/* Chart placeholder grid */}
          <div className="h-[180px] flex items-end gap-2 border-b border-l border-gray-200 px-2 pb-2 relative">
            <div className="absolute bottom-2 left-3 font-sans text-[10px] text-brand-smoke/40 tracking-[1px]">
              Wire Stripe Connect to populate
            </div>
            {[40,65,45,80,55,90,70,85,60,75,50,95].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm opacity-20"
                style={{ height: `${h}%`, background: B.orange }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => (
              <span key={m} className="font-sans text-[9px] text-brand-smoke/50 flex-1 text-center">{m}</span>
            ))}
          </div>
        </div>

        {/* Low stock alerts — right column */}
        <div className="bg-white border border-gray-200 p-6">
          <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-4">
            ⚠ Needs Attention
          </div>
          <div className="flex flex-col gap-3">
            {INVENTORY_MOCK.filter(
              (i) => !i.inStock || i.stockCount <= i.lowStockThreshold
            ).slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-[20px] leading-none flex-shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-sans font-extrabold text-[12px] text-brand-black truncate">{item.name}</div>
                  <div className="font-sans text-[10px] text-brand-smoke">{item.sku}</div>
                </div>
                <span className={`font-sans font-extrabold text-[9px] tracking-[1px] uppercase px-2 py-1 flex-shrink-0 ${
                  !item.inStock
                    ? "text-red-500 bg-red-50 border border-red-200"
                    : "text-amber-600 bg-amber-50 border border-amber-200"
                }`}>
                  {!item.inStock ? "Out" : `Low (${item.stockCount})`}
                </span>
              </div>
            ))}
            {INVENTORY_MOCK.filter((i) => !i.inStock || i.stockCount <= i.lowStockThreshold).length === 0 && (
              <div className="font-sans text-[13px] text-brand-smoke/60 text-center py-8">
                All items well stocked ✓
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders placeholder */}
      <div className="bg-white border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke">
            Recent Orders
          </div>
          <span className="font-sans font-extrabold text-[9px] tracking-[2px] uppercase text-brand-smoke bg-gray-100 border border-gray-200 px-3 py-1.5">
            Coming Soon
          </span>
        </div>
        <p className="font-sans text-[13px] text-brand-smoke/60 mt-3">
          Orders will appear here once the Orders section is built and the payment system is wired.
        </p>
      </div>
    </div>
  );
}
