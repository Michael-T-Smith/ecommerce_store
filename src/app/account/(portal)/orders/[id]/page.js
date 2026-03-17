"use client";

import { useState, useEffect }  from "react";
import { useParams }            from "next/navigation";
import Link                     from "next/link";
import { B }                    from "@/lib/brand";

const STATUS_META = {
  pending         : { label: "Pending",          color: "#F59E0B" },
  confirmed       : { label: "Confirmed",        color: "#3B82F6" },
  preparing       : { label: "Preparing",        color: "#8B5CF6" },
  out_for_delivery: { label: "Out for Delivery", color: "#D4511A" },
  delivered       : { label: "Delivered",        color: "#22C55E" },
  cancelled       : { label: "Cancelled",        color: "#EF4444" },
};

export default function OrderDetailPage() {
  const { id }   = useParams();
  const [order,   setOrder  ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState(null);

  useEffect(() => {
    fetch(`/api/customers/orders?id=${id}`)
      .then((r) => r.json())
      .then((json) => {
        // Find the specific order from the list
        const found = json.data?.find((o) => String(o.id) === String(id));
        if (!found) throw new Error("Order not found.");
        const items = typeof found.items === "string" ? JSON.parse(found.items) : found.items;
        setOrder({ ...found, items, total: Number(found.total), subtotal: Number(found.subtotal), deliveryFee: Number(found.delivery_fee) });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

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
      <p className="font-sans text-brand-smoke mb-4">{error}</p>
      <Link href="/account/orders"
        className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase text-brand-orange no-underline hover:underline">
        ← Back to orders
      </Link>
    </div>
  );

  const statusMeta = STATUS_META[order.status] ?? { label: order.status, color: B.smoke };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex-1">
          <Link href="/account/orders"
            className="font-sans font-extrabold text-[10px] tracking-[1.5px] uppercase text-brand-smoke no-underline hover:text-brand-orange transition-colors flex items-center gap-1.5 mb-3">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All Orders
          </Link>
          <h1 className="font-serif font-black text-brand-black text-[26px] tracking-[-1px] leading-none">
            {order.order_number}
          </h1>
          <p className="font-sans text-brand-smoke text-[13px] mt-1">
            Placed {new Date(order.created_at).toLocaleDateString("en-US", { dateStyle: "long" })}
          </p>
        </div>
        <span
          className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase px-3 py-2 border-2 flex items-center gap-2"
          style={{ color: statusMeta.color, borderColor: statusMeta.color, background: `${statusMeta.color}12` }}
        >
          {(order.status === "out_for_delivery" || order.status === "preparing") && (
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: statusMeta.color }} />
          )}
          {statusMeta.label}
        </span>
      </div>

      {/* Items */}
      <div className="bg-white border-[2px] border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <span className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke">Items</span>
        </div>
        {order.items?.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-gray-100 last:border-b-0">
            <div>
              <span className="font-sans font-extrabold text-[14px] text-brand-black">{item.name}</span>
              <span className="font-sans text-[12px] text-brand-smoke ml-2">{item.size} × {item.qty}</span>
            </div>
            <span className="font-sans font-black text-[15px] text-brand-black">
              ${(item.price * item.qty).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex flex-col items-end gap-1">
          <span className="font-sans text-[12px] text-brand-smoke">Subtotal: ${(order.subtotal ?? order.total).toFixed(2)}</span>
          {order.deliveryFee > 0 && (
            <span className="font-sans text-[12px] text-brand-smoke">Delivery fee: ${order.deliveryFee.toFixed(2)}</span>
          )}
          <span className="font-serif font-black text-[20px] text-brand-black">Total: ${order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Delivery info */}
      <div className="bg-white border-[2px] border-gray-200 px-5 py-5">
        <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-3">Delivery</div>
        <div className="font-sans text-[13px] text-brand-black leading-relaxed mb-2">{order.delivery_address}</div>
        <div className="font-sans text-[12px] text-brand-smoke">
          {new Date(order.delivery_date + "T00:00:00").toLocaleDateString("en-US", { dateStyle: "long" })}
          {" · "}
          {order.delivery_window === "morning" ? "Morning (9AM–12PM)" : "Afternoon (12PM–5PM)"}
          {" · "}
          <span className="capitalize">{order.delivery_zone}</span>
        </div>
      </div>

      {/* Note message */}
      {order.note_message && (
        <div className="bg-brand-cream border-l-4 border-brand-gold px-5 py-4">
          <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-2">Handwritten Note</div>
          <div className="font-serif text-[14px] text-brand-bark italic leading-relaxed">
            &ldquo;{order.note_message}&rdquo;
          </div>
        </div>
      )}
    </div>
  );
}