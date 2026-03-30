
import { B } from "@/lib/brand";
import FlowerMark from "@/app/components/icons/FlowerMark";

const ZONES = [
  {
    id       : "piedmont",
    label    : "Zone 1",
    city     : "Piedmont",
    state    : "Alabama",
    fee      : "Free over $60",
    feeSub   : "$8 flat rate under $60",
    cutoff   : "Order by 2:00 PM",
    window   : "Same-Day Delivery",
    windowSub: "Delivered by 5:30 PM",
    accent   : B.orange,
    note     : "Our home base. Same-day guaranteed on all in-stock items ordered before 1pm.",
    primary  : true,
  },
  {
    id       : "anniston",
    label    : "Zone 2",
    city     : "Anniston",
    state    : "Alabama",
    fee      : "Free over $75",
    feeSub   : "$12 flat rate under $75",
    cutoff   : "Order by 2:00 PM",
    window   : "Same-Day Delivery",
    windowSub: "Delivered by 5:00 PM",
    accent   : B.gold,
    note     : "Forward orders dispatched from our Piedmont studio. Earlier cutoff to allow for travel time.",
    primary  : false,
  },
  {
    id       : "centre",
    label    : "Zone 3",
    city     : "Centre",
    state    : "Alabama",
    fee      : "Free over $85",
    feeSub   : "$15 flat rate under $85",
    cutoff   : "Order by 2:00 PM",
    window   : "Same-Day Delivery",
    windowSub: "Delivered by 4:30 PM",
    accent   : B.bark,
    note     : "Furthest zone from our studio. Book early — Centre slots fill quickly on holidays.",
    primary  : false,
  },
];

export default function DeliveryZones() {
  return (
    <section className="bg-brand-cream px-5 sm:px-10 lg:px-16 py-16 sm:py-24">

      <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[4px] text-brand-orange uppercase mb-4">
        <FlowerMark size={16} fill={B.orange} stroke={B.orange} />
        Delivery Areas
      </div>
      <h2 className="font-serif font-black text-brand-black text-[36px] sm:text-[44px] tracking-[-2px] leading-[1.05] mb-3">
        Where We Deliver
      </h2>
      <p className="font-sans text-brand-smoke text-[14px] sm:text-[15px] leading-[1.8] max-w-[520px] mb-12 sm:mb-16">
        We deliver across three zones. All orders are hand-delivered —
        no third-party couriers, no drop-and-go.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
        {ZONES.map((zone) => (
          <div
            key={zone.id}
            className={`border-[3px] border-brand-black overflow-hidden transition-all duration-150 ${
              zone.primary ? "shadow-retro-lg" : "shadow-retro-sm"
            }`}
          >
            {/* Zone header */}
            <div
              className="px-5 py-5 relative overflow-hidden"
              style={{ background: zone.accent }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `repeating-linear-gradient(-55deg,
                    transparent 0, transparent 24px,
                    rgba(0,0,0,0.1) 24px, rgba(0,0,0,0.1) 28px)`,
                }}
              />
              <div className="relative z-10">
                <div className="font-sans font-extrabold text-[9px] tracking-[3px] uppercase text-brand-cream/70 mb-1">
                  {zone.label}
                </div>
                <div className="font-serif font-black text-brand-cream text-[28px] sm:text-[32px] tracking-[-1px] leading-none">
                  {zone.city}
                </div>
                <div className="font-sans text-[11px] text-brand-cream/70 mt-1 tracking-[1px]">
                  {zone.state}
                </div>
              </div>
            </div>

            {/* Zone details */}
            <div className="p-5 flex flex-col gap-5">

              {/* Cutoff */}
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 flex items-center justify-center border-2 border-brand-black flex-shrink-0 mt-0.5"
                  style={{ background: zone.accent }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={B.cream} strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="9" />
                    <polyline points="12 7 12 12 15.5 15.5" />
                  </svg>
                </div>
                <div>
                  <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-0.5">
                    Order Cutoff
                  </div>
                  <div className="font-serif font-black text-brand-black text-[16px] leading-tight">
                    {zone.cutoff}
                  </div>
                </div>
              </div>

              {/* Delivery window */}
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 flex items-center justify-center border-2 border-brand-black flex-shrink-0 mt-0.5"
                  style={{ background: zone.accent }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={B.cream} strokeWidth="2.5" strokeLinecap="round">
                    <rect x="1" y="3" width="15" height="13" rx="1" />
                    <path d="M16 8l4 2v5h-4V8z" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <div>
                  <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-0.5">
                    Delivery Window
                  </div>
                  <div className="font-serif font-black text-brand-black text-[16px] leading-tight">
                    {zone.window}
                  </div>
                  <div className="font-sans text-[12px] text-brand-smoke mt-0.5">
                    {zone.windowSub}
                  </div>
                </div>
              </div>

              {/* Fee */}
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 flex items-center justify-center border-2 border-brand-black flex-shrink-0 mt-0.5"
                  style={{ background: zone.accent }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={B.cream} strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div>
                  <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-0.5">
                    Delivery Fee
                  </div>
                  <div className="font-serif font-black text-brand-black text-[16px] leading-tight">
                    {zone.fee}
                  </div>
                  <div className="font-sans text-[12px] text-brand-smoke mt-0.5">
                    {zone.feeSub}
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="border-t-[2px] border-brand-black/10 pt-4">
                <p className="font-sans text-[12px] text-brand-smoke leading-[1.7]">
                  {zone.note}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}