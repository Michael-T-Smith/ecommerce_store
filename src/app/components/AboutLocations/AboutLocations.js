
import { C } from "@/lib/brand";
import BirdLogo from "@/app/components/icons/BirdLogo";

const SHIPPING_TIERS = [
  { label: "Standard",  time: "3 – 5 business days", note: "Most orders"            },
  { label: "Express",   time: "1 – 2 business days", note: "Available at checkout"  },
  { label: "Overnight", time: "Next business day",   note: "Order by noon"          },
];

export default function AboutLocations() {
  return (
    <section className="bg-brand-cream border-t-[3px] border-brand-black/10">

      {/* ── Editorial ── */}
      <div className="px-5 sm:px-10 lg:px-16 py-16 sm:py-24">

        <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[4px] text-brand-orange uppercase mb-4">
          <BirdLogo size={16} color={C.blush} />
          Online Only
        </div>

        <h2 className="font-serif font-black text-brand-black text-[36px] sm:text-[52px] tracking-[-2px] leading-[1.05] mb-8 max-w-[720px]">
          Every piece, brought<br className="hidden sm:block" /> to your door.
        </h2>

        <div className="flex flex-col gap-5 font-sans text-[14px] sm:text-[15px] text-brand-smoke leading-[1.8] max-w-[640px]">
          <p>
            BityBird Co is 100% online — no storefront, no pickup. Every item we carry is either
            carefully refurbished or handcrafted with intention, then shipped directly to you,
            wherever you are.
          </p>
          <p>
            We believe every piece matters. Whether it&apos;s something with its own history that
            deserves a second life, or made by hand from scratch — each one belongs somewhere.
            That place might just be with you.
          </p>
        </div>

        <div className="mt-10 flex items-center gap-4">
          <div
            className="h-[3px] w-16"
            style={{
              background: `repeating-linear-gradient(90deg,
                ${C.gold} 0, ${C.gold} 10px,
                ${C.black} 10px, ${C.black} 13px)`,
            }}
          />
          <span className="font-sans font-extrabold text-[9px] tracking-[3px] uppercase text-brand-smoke">
            Ships nationwide · Est. 2024
          </span>
        </div>
      </div>

      {/* ── Shipping band ── */}
      <div className="bg-brand-black px-5 sm:px-10 lg:px-16 py-12 sm:py-16">

        <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[4px] text-brand-orange uppercase mb-8">
          <BirdLogo size={14} color={C.blush} />
          Getting Your Order
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {SHIPPING_TIERS.map((tier) => (
            <div key={tier.label} className="border-[2px] border-brand-cream/10 p-5">
              <div className="font-sans font-extrabold text-[9px] tracking-[3px] uppercase text-brand-orange mb-2">
                {tier.label}
              </div>
              <div className="font-serif font-black text-brand-cream text-[22px] sm:text-[26px] tracking-[-0.5px] leading-tight mb-1.5">
                {tier.time}
              </div>
              <div className="font-sans text-[11px] text-brand-cream/50">
                {tier.note}
              </div>
            </div>
          ))}
        </div>

        <p className="font-sans text-[12px] text-brand-cream/50 leading-relaxed max-w-[560px]">
          <span className="text-brand-orange font-extrabold">Note: </span>
          Handcrafted and refurbished items may require additional processing time before they ship.
        </p>
      </div>

      {/* ── Contact strip ── */}
      <div className="px-5 sm:px-10 lg:px-16 py-10 border-t-[2px] border-brand-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-sans font-extrabold text-[9px] tracking-[3px] uppercase text-brand-smoke mb-1.5">
            Questions? Reach out.
          </div>
          <a
            href="mailto:hello@company.com"
            className="font-serif font-black text-brand-black text-[22px] tracking-[-0.5px] no-underline hover:text-brand-orange transition-colors"
          >
            hello@company.com
          </a>
        </div>
        <p className="font-sans text-[12px] text-brand-smoke leading-relaxed max-w-[300px] sm:text-right">
          Orders ship same-day Mon – Fri.<br className="hidden sm:block" />
          Weekend orders ship the following Monday.
        </p>
      </div>

    </section>
  );
}
