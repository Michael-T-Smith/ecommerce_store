export const DELIVERY_ZONES = [
  { value: "piedmont", label: "Piedmont",         city: "Piedmont, AL",    fee: 8  },
  { value: "anniston", label: "Anniston / Oxford", city: "Anniston, AL",   fee: 12 },
  { value: "centre",   label: "Centre",            city: "Centre, AL",     fee: 15 },
];

/** Look up fee for a zone value. Returns 0 if not found. */
export function getDeliveryFee(zoneValue) {
  return DELIVERY_ZONES.find((z) => z.value === zoneValue)?.fee ?? 0;
}