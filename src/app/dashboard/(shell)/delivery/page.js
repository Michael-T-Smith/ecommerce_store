
"use client";

import { useState, useEffect, useCallback } from "react";
import { useDashboardSession }  from "@/app/dashboard/SessionContext";
import { canDo }                from "@/lib/permissions";
import StatusBadge              from "@/app/components/dashboard/StatusBadge/StatusBadge";
import { fetchDeliveries, updateDelivery, fetchEmployees } from "@/lib/dashboardApi";
import { PageSpinner, PageError } from "@/app/components/dashboard/PageStates/PageStates";

const DELIVERY_STATUSES = [
  { key: "scheduled",  label: "Scheduled",  color: "#3B82F6" },
  { key: "dispatched", label: "Dispatched", color: "#D4511A" },
  { key: "delivered",  label: "Delivered",  color: "#22C55E" },
  { key: "failed",     label: "Failed",     color: "#EF4444" },
];

const STATUS_NEXT = {
  scheduled : "dispatched",
  dispatched: "delivered",
  delivered : null,
  failed    : "scheduled",
};

const ZONE_META = {
  piedmont: { label: "Piedmont", color: "#D4511A" },
  anniston: { label: "Anniston", color: "#C9A84C" },
  centre  : { label: "Centre",   color: "#3D2B1A" },
};

function remapDelivery(row) {
  return {
    id              : row.id,
    orderId         : row.order_id,
    orderNumber     : row.order_number,
    customerName    : row.customer_name,
    driverId        : row.driver_id,
    driverName      : row.driver_name,
    zone            : row.zone,
    address         : row.address,
    scheduledDate   : row.scheduled_date,
    scheduledWindow : row.scheduled_window,
    status          : row.status,
    deliveryNotes   : row.delivery_notes,
    deliveredAt     : row.delivered_at,
  };
}

export default function DeliveryPage() {
  const { user } = useDashboardSession();

  const [deliveries, setDeliveries] = useState([]);
  const [drivers,    setDrivers   ] = useState([]);
  const [loading,    setLoading   ] = useState(true);
  const [apiError,   setApiError  ] = useState(null);

  const canUpdate = canDo(user.role, "delivery", "update");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);
      const [delRes, empRes] = await Promise.all([
        fetchDeliveries(),
        fetchEmployees({ status: "active" }),
      ]);
      setDeliveries(delRes.data.map(remapDelivery));
      setDrivers(empRes.data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdvance = async (deliveryId) => {
    const delivery = deliveries.find((d) => d.id === deliveryId);
    if (!delivery) return;
    const nextStatus = STATUS_NEXT[delivery.status];
    if (!nextStatus) return;

    setDeliveries((prev) =>
      prev.map((d) => d.id === deliveryId
        ? { ...d, status: nextStatus, deliveredAt: nextStatus === "delivered" ? new Date().toISOString() : d.deliveredAt }
        : d)
    );
    try {
      await updateDelivery(deliveryId, { status: nextStatus });
    } catch (err) {
      load();
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleMarkFailed = async (deliveryId) => {
    setDeliveries((prev) =>
      prev.map((d) => d.id === deliveryId ? { ...d, status: "failed" } : d)
    );
    try {
      await updateDelivery(deliveryId, { status: "failed" });
    } catch (err) {
      load();
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleAssignDriver = async (deliveryId, employeeId) => {
    const driver = drivers.find((d) => d.id === parseInt(employeeId));
    setDeliveries((prev) =>
      prev.map((d) => d.id === deliveryId
        ? { ...d, driverId: driver?.id || null, driverName: driver?.name || null }
        : d)
    );
    try {
      await updateDelivery(deliveryId, { driverId: driver?.id || null });
    } catch (err) {
      load();
      alert(`Driver assignment failed: ${err.message}`);
    }
  };

  if (loading) return <PageSpinner label="Loading Deliveries" />;
  if (apiError) return <PageError message={apiError} onRetry={load} />;

  const columns = DELIVERY_STATUSES.map((status) => ({
    ...status,
    items: deliveries.filter((d) => d.status === status.key),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif font-black text-brand-black text-[26px] sm:text-[30px] tracking-[-1px] leading-none mb-1">
          Delivery Board
        </h1>
        <p className="font-sans text-brand-smoke text-[13px]">
          {deliveries.length} total deliveries · advance status as drivers check in
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => (
          <div key={col.key} className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-4 py-3 border-2 border-brand-black"
              style={{ background: `${col.color}15`, borderLeftColor: col.color, borderLeftWidth: "4px" }}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                <span className="font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase text-brand-black">{col.label}</span>
              </div>
              <span className="font-sans font-extrabold text-[12px] px-2 py-0.5 rounded-full"
                style={{ background: `${col.color}25`, color: col.color }}>
                {col.items.length}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {col.items.length === 0 && (
                <div className="bg-white border border-dashed border-gray-200 px-4 py-8 text-center">
                  <span className="font-sans text-[12px] text-brand-smoke/40">No deliveries</span>
                </div>
              )}
              {col.items.map((delivery) => {
                const zoneMeta   = ZONE_META[delivery.zone] ?? { label: delivery.zone, color: "#7A6A58" };
                const nextStatus = STATUS_NEXT[delivery.status];
                const nextMeta   = nextStatus ? DELIVERY_STATUSES.find((s) => s.key === nextStatus) : null;

                return (
                  <div key={delivery.id} className="bg-white border border-gray-200 overflow-hidden hover:border-gray-400 transition-colors"
                    style={{ borderTop: `3px solid ${col.color}` }}>
                    <div className="p-4 flex flex-col gap-3">
                      <div>
                        <div className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase text-brand-smoke mb-0.5">{delivery.orderNumber}</div>
                        <div className="font-serif font-bold text-brand-black text-[15px] leading-tight">{delivery.customerName}</div>
                      </div>
                      <div className="font-sans text-[11px] text-brand-smoke leading-relaxed">{delivery.address}</div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase px-2 py-1 border"
                          style={{ color: zoneMeta.color, borderColor: `${zoneMeta.color}50`, background: `${zoneMeta.color}12` }}>
                          {zoneMeta.label}
                        </span>
                        <span className="font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase px-2 py-1 border border-gray-200 text-brand-smoke">
                          {delivery.scheduledWindow === "morning" ? "AM" : "PM"}
                        </span>
                      </div>

                      {canUpdate ? (
                        <div>
                          <div className="font-sans text-[9px] font-extrabold tracking-[1.5px] uppercase text-brand-smoke mb-1">Driver</div>
                          <select value={delivery.driverId ?? ""} onChange={(e) => handleAssignDriver(delivery.id, e.target.value)}
                            className="w-full border border-gray-200 px-2 py-1.5 font-sans text-[11px] text-brand-black focus:outline-none focus:border-brand-orange transition-colors cursor-pointer bg-white appearance-none">
                            <option value="">Unassigned</option>
                            {drivers.map((d) => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      ) : delivery.driverName && (
                        <div className="font-sans text-[11px] text-brand-smoke">
                          Driver: <span className="font-extrabold text-brand-black">{delivery.driverName}</span>
                        </div>
                      )}

                      {delivery.deliveryNotes && (
                        <div className="bg-amber-50 border border-amber-200 px-3 py-2 font-sans text-[11px] text-amber-700 leading-relaxed">
                          📌 {delivery.deliveryNotes}
                        </div>
                      )}
                      {delivery.status === "delivered" && delivery.deliveredAt && (
                        <div className="font-sans text-[11px] text-green-600 font-extrabold">
                          ✓ Delivered {new Date(delivery.deliveredAt).toLocaleTimeString("en-US", { timeStyle: "short" })}
                        </div>
                      )}

                      {canUpdate && (nextMeta || delivery.status === "dispatched") && (
                        <div className="flex gap-2 pt-1 border-t border-gray-100">
                          {nextMeta && (
                            <button onClick={() => handleAdvance(delivery.id)}
                              className="flex-1 font-sans font-extrabold text-[9px] tracking-[1px] uppercase py-2 border-2 border-brand-black text-brand-cream cursor-pointer transition-all shadow-retro-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                              style={{ background: col.color }}>
                              → {nextMeta.label}
                            </button>
                          )}
                          {delivery.status === "dispatched" && (
                            <button onClick={() => handleMarkFailed(delivery.id)}
                              className="font-sans font-extrabold text-[9px] tracking-[1px] uppercase px-3 py-2 border-2 border-red-300 text-red-500 bg-white cursor-pointer hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors">
                              Failed
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}