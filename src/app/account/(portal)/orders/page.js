"use client";

import { useState, useEffect, useCallback } from "react";
import Link                                  from "next/link";
import { useCustomer }                       from "@/app/account/CustomerContext";
import { B }                                 from "@/lib/brand";

const STATUS_META = {
  pending         : { label: "Pending",          color: "#F59E0B" },
  confirmed       : { label: "Confirmed",        color: "#3B82F6" },
  preparing       : { label: "Preparing",        color: "#8B5CF6" },
  out_for_delivery: { label: "Out for Delivery", color: "#D4511A" },
  delivered       : { label: "Delivered",        color: "#22C55E" },
  cancelled       : { label: "Cancelled",        color: "#EF4444" },
};

function OrderStatusBadge({ status }) {
  const meta = STATUS_META[status] ?? { label: status, color: "#7A6A58" };
  return (
    <span
      className="inline-flex items-center gap-1.5 font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-2.5 py-1 border whitespace-nowrap"
      style={{ color: meta.color, borderColor: `${meta.color}50`, background: `${meta.color}12` }}
    >
      {(status === "out_for_delivery" || status === "preparing") && (
        <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: meta.color }} />
      )}
      {meta.label}
    </span>
  );
}

export default function OrdersPage() {
  const { customer } = useCustomer();

  const [orders,  setOrders ] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res  = await fetch("/api/customers/orders");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setOrders(json.data.map(remapOrder));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function remapOrder(row) {
    return {
      id             : row.id,
      orderNumber    : row.order_number,
      items          : typeof row.items === "string" ? JSON.parse(row.items) : row.items,
      total          : Number(row.total),
      status         : row.status,
      deliveryDate   : row.delivery_date,
      deliveryZone   : row.delivery_zone,
      deliveryAddress: row.delivery_address,
      createdAt      : row.created_at,
    };
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24"
        fill="none" stroke={B.orange} strokeWidth="2.5">
        <path d="M21 12a9 9 0 11-6.219-8.56" />
      </svg>
    </div>
  );

  if (error) return (
    <div className="py-12 text-center">
      <p className="font-sans text-brand-smoke text-[13px] mb-4">{error}</p>
      <button onClick={load}
        className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase px-5 py-2.5 bg-brand-orange text-brand-cream border-2 border-brand-black cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
        Retry
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif font-black text-brand-black text-[26px] tracking-[-1px] leading-none mb-1">
          Order History
        </h1>
        <p className="font-sans text-brand-smoke text-[13px]">
          {orders.length} {orders.length === 1 ? "order" : "orders"} placed with Lamb&apos;s Florist
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border-[3px] border-dashed border-gray-200 px-8 py-16 text-center">
          <div className="text-[48px] mb-4">🌸</div>
          <h2 className="font-serif font-black text-brand-black text-[20px] mb-2">No orders yet</h2>
          <p className="font-sans text-brand-smoke text-[13px] mb-6 leading-relaxed max-w-[300px] mx-auto">
            When you place an order it will appear here along with its delivery status.
          </p>
          <Link href="/shop"
            className="font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase px-6 py-3 bg-brand-orange text-brand-cream border-2 border-brand-black no-underline inline-block shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
            Browse the Shop →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="bg-white border-[2px] border-gray-200 hover:border-brand-orange transition-colors no-underline block group"
              style={{ borderLeft: `4px solid ${STATUS_META[order.status]?.color ?? B.smoke}` }}
            >
              <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-sans font-extrabold text-[13px] text-brand-black tracking-[0.5px]">
                      {order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="font-sans text-[12px] text-brand-smoke">
                    {order.items?.length ?? 0} item{order.items?.length !== 1 ? "s" : ""}
                    {" · "}
                    Delivery: {new Date(order.deliveryDate).toLocaleDateString("en-US", { dateStyle: "medium" })}
                    {" · "}
                    <span className="capitalize">{order.deliveryZone}</span>
                  </div>
                  <div className="font-sans text-[11px] text-brand-smoke/60 truncate max-w-[360px]">
                    {order.deliveryAddress}
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="font-serif font-black text-[20px] text-brand-black">
                    ${order.total.toFixed(2)}
                  </span>
                  <svg className="text-brand-smoke group-hover:text-brand-orange transition-colors flex-shrink-0"
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
