
export const DELIVERY_STATUSES = [
  { key: "scheduled",  label: "Scheduled",  color: "#3B82F6" },
  { key: "dispatched", label: "Dispatched", color: "#D4511A" },
  { key: "delivered",  label: "Delivered",  color: "#22C55E" },
  { key: "failed",     label: "Failed",     color: "#EF4444" },
];

// Which status a card can advance to via button
export const DELIVERY_STATUS_NEXT = {
  scheduled  : "dispatched",
  dispatched : "delivered",
  delivered  : null,
  failed     : "scheduled", // reschedule
};

export const ZONE_META = {
  piedmont : { label: "Piedmont",    color: "#D4511A" },
  anniston : { label: "Anniston",    color: "#C9A84C" },
  centre   : { label: "Centre",      color: "#3D2B1A" },
};

export const DELIVERIES_MOCK = [
  {
    id: 1, orderId: 1, orderNumber: "LF-2024-0001",
    customerName: "Sarah Mitchell",
    driverId: 2, driverName: "Frank Lamb",
    zone: "piedmont",
    address: "412 Oak Street, Piedmont, AL 36272",
    scheduledDate: "2024-12-01", scheduledWindow: "morning",
    status: "delivered",
    deliveryNotes: null,
    deliveredAt: "2024-12-01T10:42:00Z",
  },
  {
    id: 2, orderId: 2, orderNumber: "LF-2024-0002",
    customerName: "Marcus Webb",
    driverId: 2, driverName: "Frank Lamb",
    zone: "anniston",
    address: "88 Hillside Drive, Anniston, AL 36201",
    scheduledDate: "2024-12-03", scheduledWindow: "afternoon",
    status: "dispatched",
    deliveryNotes: "Gate code: 4421",
    deliveredAt: null,
  },
  {
    id: 3, orderId: 3, orderNumber: "LF-2024-0003",
    customerName: "Linda Carver",
    driverId: null, driverName: null,
    zone: "piedmont",
    address: "27 Maple Ave, Piedmont, AL 36272",
    scheduledDate: "2024-12-03", scheduledWindow: "morning",
    status: "scheduled",
    deliveryNotes: "Wedding arrangements — careful handling.",
    deliveredAt: null,
  },
];

