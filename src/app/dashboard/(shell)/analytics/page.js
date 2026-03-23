// src/app/dashboard/(shell)/analytics/page.js
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchOrders }           from "@/lib/dashboardApi";
import { PageSpinner, PageError } from "@/app/components/dashboard/PageStates/PageStates";
import { B }                     from "@/lib/brand";

const STATUS_COLORS = {
  pending         : "#F59E0B",
  confirmed       : "#3B82F6",
  preparing       : "#8B5CF6",
  out_for_delivery: "#D4511A",
  delivered       : "#22C55E",
  cancelled       : "#EF4444",
};

function StatBox({ label, value, sub, accent = B.orange }) {
  return (
    <div className="bg-white border border-gray-200 p-5">
      <div className="font-sans font-extrabold text-[9px] tracking-[2px] uppercase text-brand-smoke mb-2">{label}</div>
      <div className="font-serif font-black text-[28px] tracking-[-1px] leading-none mb-1" style={{ color: accent }}>
        {value}
      </div>
      {sub && <div className="font-sans text-[11px] text-brand-smoke/60">{sub}</div>}
    </div>
  );
}

function HBar({ label, value, max, color, suffix = "", sub }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="font-sans font-extrabold text-[11px] tracking-[0.5px] text-brand-black w-36 flex-shrink-0 truncate" title={label}>
        {label}
      </div>
      <div className="flex-1 h-5 bg-gray-100 overflow-hidden">
        <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="flex flex-col items-end w-16 flex-shrink-0">
        <span className="font-sans font-black text-[13px] text-brand-black">{value}{suffix}</span>
        {sub && <span className="font-sans text-[9px] text-brand-smoke/60">{sub}</span>}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [orders,   setOrders ] = useState([]);
  const [loading,  setLoading] = useState(true);
  const [apiError, setError  ] = useState(null);
  const [range,    setRange  ] = useState("30");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchOrders();
      setOrders(res.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(range));
    return orders.filter((o) => new Date(o.created_at) >= cutoff);
  }, [orders, range]);

  const stats = useMemo(() => {
    const active    = filtered.filter((o) => o.status !== "cancelled");
    const revenue   = active.reduce((s, o) => s + Number(o.total), 0);
    const avgOrder  = active.length > 0 ? revenue / active.length : 0;
    const delivered = filtered.filter((o) => o.status === "delivered").length;
    const cancelled = filtered.filter((o) => o.status === "cancelled").length;

    // By status
    const statuses = {};
    filtered.forEach((o) => {
      statuses[o.status] = (statuses[o.status] ?? 0) + 1;
    });

    // Daily order counts — last 14 days
    const dailyMap = {};
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dailyMap[d.toISOString().split("T")[0]] = 0;
    }
    filtered.forEach((o) => {
      const day = o.created_at?.split("T")[0];
      if (day && day in dailyMap) dailyMap[day]++;
    });
    const daily  = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));
    const maxDay = Math.max(...daily.map((d) => d.count), 1);

    // Top products — aggregate qty and revenue across all order items
    const productMap = {};
    active.forEach((o) => {
      const items = Array.isArray(o.items)
        ? o.items
        : (typeof o.items === "string" ? JSON.parse(o.items) : []);
      items.forEach((item) => {
        const name = item.name ?? "Unknown";
        if (!productMap[name]) productMap[name] = { units: 0, revenue: 0 };
        productMap[name].units   += item.qty   ?? 1;
        productMap[name].revenue += (item.price ?? 0) * (item.qty ?? 1);
      });
    });
    const topProducts = Object.entries(productMap)
      .sort((a, b) => b[1].units - a[1].units)
      .slice(0, 7);
    const maxUnits = Math.max(...topProducts.map(([, v]) => v.units), 1);

    // Fulfillment split — delivery vs pickup
    const fulfillment = {
      delivery: { count: 0, revenue: 0 },
      pickup  : { count: 0, revenue: 0 },
    };
    active.forEach((o) => {
      const type = o.fulfillment_type === "pickup" ? "pickup" : "delivery";
      fulfillment[type].count++;
      fulfillment[type].revenue += Number(o.total);
    });

    return { revenue, avgOrder, delivered, cancelled, statuses, daily, maxDay,
             topProducts, maxUnits, fulfillment, total: filtered.length };
  }, [filtered]);

  if (loading) return <PageSpinner label="Loading Analytics" />;
  if (apiError) return <PageError message={apiError} onRetry={load} />;

  const fmt     = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtShort = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const totalFulfillment = stats.fulfillment.delivery.count + stats.fulfillment.pickup.count;

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-brand-black text-[26px] sm:text-[30px] tracking-[-1px] leading-none mb-1">
            Analytics
          </h1>
          <p className="font-sans text-brand-smoke text-[13px]">
            {stats.total} orders in the selected period
          </p>
        </div>
        <div className="flex gap-1">
          {[
            { v: "7",   l: "7 days"   },
            { v: "30",  l: "30 days"  },
            { v: "90",  l: "90 days"  },
            { v: "365", l: "All time" },
          ].map(({ v, l }) => (
            <button key={v} onClick={() => setRange(v)}
              className={`font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-4 py-2.5 border-2 cursor-pointer transition-colors ${
                range === v
                  ? "border-brand-black bg-brand-black text-brand-cream"
                  : "border-gray-200 text-brand-smoke hover:border-gray-400"
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Total Revenue" value={`$${fmt(stats.revenue)}`}   sub="non-cancelled orders" accent={B.orange} />
        <StatBox label="Orders"        value={String(stats.total)}         sub={`${stats.delivered} delivered`} accent={B.bark} />
        <StatBox label="Avg. Order"    value={`$${fmt(stats.avgOrder)}`}  sub="per transaction" accent={B.gold} />
        <StatBox label="Cancelled"     value={String(stats.cancelled)}     sub={`${stats.total > 0 ? Math.round(stats.cancelled / stats.total * 100) : 0}% rate`} accent="#EF4444" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Daily orders sparkline */}
        <div className="bg-white border border-gray-200 p-6">
          <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-5">
            Orders — Last 14 Days
          </div>
          <div className="flex items-end gap-1 h-[120px] border-b border-l border-gray-200 px-1 pb-1">
            {stats.daily.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1 group relative">
                <div className="w-full transition-all duration-300 cursor-default"
                  style={{
                    height    : `${d.count > 0 ? Math.max(4, Math.round((d.count / stats.maxDay) * 100)) : 2}%`,
                    background: d.count > 0 ? B.orange : "#E5E7EB",
                  }} />
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-brand-black text-brand-cream font-sans font-extrabold text-[9px] px-1.5 py-0.5 hidden group-hover:block whitespace-nowrap z-10">
                  {d.count} order{d.count !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-sans text-[9px] text-brand-smoke/50">{stats.daily[0]?.date?.slice(5)}</span>
            <span className="font-sans text-[9px] text-brand-smoke/50">{stats.daily[13]?.date?.slice(5)}</span>
          </div>
        </div>

        {/* Orders by status */}
        <div className="bg-white border border-gray-200 p-6">
          <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-5">
            Orders by Status
          </div>
          <div className="flex flex-col gap-3">
            {Object.entries(stats.statuses)
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => (
                <HBar key={status} label={status.replace(/_/g, " ")} value={count}
                  max={stats.total} color={STATUS_COLORS[status] ?? B.smoke} />
              ))}
            {Object.keys(stats.statuses).length === 0 && (
              <p className="font-sans text-[13px] text-brand-smoke/60 text-center py-6">No orders in this period.</p>
            )}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white border border-gray-200 p-6">
          <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-5">
            Top Products
          </div>
          <div className="flex flex-col gap-3">
            {stats.topProducts.map(([name, { units, revenue }]) => (
              <HBar key={name} label={name} value={units} max={stats.maxUnits}
                color={B.orange} suffix=" units" sub={`$${fmtShort(revenue)}`} />
            ))}
            {stats.topProducts.length === 0 && (
              <p className="font-sans text-[13px] text-brand-smoke/60 text-center py-6">No product data in this period.</p>
            )}
          </div>
        </div>

        {/* Fulfillment split */}
        <div className="bg-white border border-gray-200 p-6">
          <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-5">
            Fulfillment Split
          </div>
          {totalFulfillment === 0 ? (
            <p className="font-sans text-[13px] text-brand-smoke/60 text-center py-6">No orders in this period.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {[
                { key: "delivery", label: "Delivery", color: B.orange },
                { key: "pickup",   label: "Pickup",   color: B.bark   },
              ].map(({ key, label, color }) => {
                const { count, revenue } = stats.fulfillment[key];
                const pct = totalFulfillment > 0 ? Math.round((count / totalFulfillment) * 100) : 0;
                return (
                  <div key={key} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-extrabold text-[12px] text-brand-black">{label}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-sans font-extrabold text-[11px] px-2 py-0.5 rounded-sm"
                          style={{ background: `${color}15`, color }}>
                          {count} order{count !== 1 ? "s" : ""} · {pct}%
                        </span>
                        <span className="font-sans font-black text-[15px] text-brand-black">${fmt(revenue)}</span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-gray-100">
                      <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 border-t border-gray-100 flex justify-between">
                <span className="font-sans font-extrabold text-[10px] tracking-[1.5px] uppercase text-brand-smoke">Total</span>
                <span className="font-sans font-black text-[15px] text-brand-black">${fmt(stats.revenue)}</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Stripe note */}
      <div className="bg-amber-50 border border-amber-200 px-5 py-4 font-sans text-[12px] text-amber-800 flex items-start gap-3">
        <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>
          Revenue figures reflect order totals stored at checkout. Once Stripe Connect is integrated,
          actual settled payouts and fees will be surfaced here automatically.
        </span>
      </div>

    </div>
  );
}
