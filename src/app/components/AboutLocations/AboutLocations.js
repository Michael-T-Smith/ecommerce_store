
import { B } from "@/lib/brand";
import FlowerMark from "@/app/components/icons/FlowerMark";

const LOCATIONS = [
  {
    id       : "piedmont",
    label    : "Primary Studio",
    name     : "Piedmont Location",
    address  : "123 Main Street",
    city     : "Piedmont, AL 36272",
    phone    : "(256) 555-0101",
    email    : "hello@lambsflorist.com",
    hours    : [
      { day: "Mon – Fri", time: "8:00 AM – 5:30 PM" },
      { day: "Saturday",  time: "9:00 AM – 3:00 PM" },
      { day: "Sunday",    time: "Closed"             },
    ],
    note     : "All orders are fulfilled and dispatched from this location.",
    accent   : B.orange,
    primary  : true,
  },
  {
    id       : "anniston",
    label    : "Service Area",
    name     : "Anniston & Centre Area",
    address  : "Deliveries dispatched from Piedmont",
    city     : "Anniston & Centre, AL",
    phone    : "(256) 555-0102",
    email    : "hello@lambsflorist.com",
    hours    : [
      { day: "Mon – Fri", time: "Delivery by 5:00 PM" },
      { day: "Saturday",  time: "Delivery by 2:00 PM" },
      { day: "Sunday",    time: "No Delivery"          },
    ],
    note     : "Forward orders and scheduled deliveries to the Anniston and Centre area.",
    accent   : B.gold,
    primary  : false,
  },
];

export default function AboutLocations() {
  return (
    <section className="bg-brand-cream border-t-[3px] border-brand-black/10 px-5 sm:px-10 lg:px-16 py-16 sm:py-24">

      <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[4px] text-brand-orange uppercase mb-4">
        <FlowerMark size={16} fill={B.orange} stroke={B.orange} />
        Find Us
      </div>
      <h2 className="font-serif font-black text-brand-black text-[36px] sm:text-[44px] tracking-[-2px] leading-[1.05] mb-12 sm:mb-16">
        Our Locations
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {LOCATIONS.map((loc) => (
          <div
            key={loc.id}
            className={`border-[3px] border-brand-black overflow-hidden ${
              loc.primary ? "shadow-retro-lg" : "shadow-retro-sm"
            }`}
          >
            {/* Header bar */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ background: loc.accent }}
            >
              <div>
                <div className="font-sans font-extrabold text-[9px] tracking-[3px] uppercase text-brand-cream/70 mb-0.5">
                  {loc.label}
                </div>
                <div className="font-serif font-black text-brand-cream text-[20px] tracking-[-0.5px] leading-none">
                  {loc.name}
                </div>
              </div>
              {loc.primary && (
                <div className="bg-brand-cream/20 border border-brand-cream/40 px-3 py-1.5">
                  <span className="font-sans font-extrabold text-[9px] tracking-[2px] uppercase text-brand-cream">
                    ✦ Main Studio
                  </span>
                </div>
              )}
            </div>

            {/* Photo placeholder */}
            <div
              className="h-[180px] sm:h-[200px] relative overflow-hidden"
              style={{ background: loc.primary ? B.bark : "#4A4A3A" }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `repeating-linear-gradient(-55deg,
                    transparent 0, transparent 32px,
                    rgba(255,255,255,0.04) 32px, rgba(255,255,255,0.04) 36px)`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
                <FlowerMark size={48} fill={`${B.cream}40`} stroke={`${B.cream}40`} />
                <span className="font-sans font-extrabold text-[9px] tracking-[3px] uppercase text-brand-cream/30">
                  Shop Photo
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 flex flex-col sm:flex-row gap-6">

              {/* Address + contact */}
              <div className="flex-1">
                <div className="font-sans font-extrabold text-[10px] tracking-[3px] uppercase mb-3"
                  style={{ color: loc.accent }}>
                  Address
                </div>
                <div className="font-serif text-[15px] text-brand-black leading-relaxed mb-4">
                  {loc.address}<br />{loc.city}
                </div>
                <div className="flex flex-col gap-1.5">
                  <a
                    href={`tel:${loc.phone}`}
                    className="font-sans text-[13px] text-brand-black no-underline hover:text-brand-orange transition-colors font-extrabold"
                  >
                    {loc.phone}
                  </a>
                  <a
                    href={`mailto:${loc.email}`}
                    className="font-sans text-[13px] text-brand-smoke no-underline hover:text-brand-orange transition-colors"
                  >
                    {loc.email}
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex-1">
                <div className="font-sans font-extrabold text-[10px] tracking-[3px] uppercase mb-3"
                  style={{ color: loc.accent }}>
                  Hours
                </div>
                <div className="flex flex-col gap-2">
                  {loc.hours.map((h) => (
                    <div key={h.day} className="flex justify-between items-baseline gap-4">
                      <span className="font-sans text-[12px] font-extrabold text-brand-smoke uppercase tracking-[1px] whitespace-nowrap">
                        {h.day}
                      </span>
                      <div className="flex-1 border-b border-dashed border-brand-black/10 mb-0.5" />
                      <span className="font-sans text-[12px] text-brand-black font-bold whitespace-nowrap">
                        {h.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Note bar */}
            <div className="px-6 py-3 border-t-[2px] border-brand-black/10 bg-brand-cream">
              <p className="font-sans text-[11px] text-brand-smoke leading-relaxed">
                <span className="text-brand-orange font-extrabold">Note: </span>
                {loc.note}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

