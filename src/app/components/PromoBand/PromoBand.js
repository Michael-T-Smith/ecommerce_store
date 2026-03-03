
import { B } from "@/lib/brand";

const FEATURES = [
  { icon: "🌿", label: "Locally Sourced",       sub: "Fresh from our growers" },
  { icon: "📦", label: "Same-Day Delivery",      sub: "Order before 1pm"       },
  { icon: "💌", label: "Personal Note Included", sub: "Every order, always"    },
];

export default function PromoBand() {
  return (
    <section className="bg-brand-black px-5 sm:px-10 lg:px-16 py-16 sm:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center relative overflow-hidden border-t-[6px] border-brand-orange">

      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(-55deg,
            transparent 0, transparent 60px,
            rgba(212,81,26,0.06) 60px, rgba(212,81,26,0.06) 70px)`,
        }}
      />

      {/* Left: headline */}
      <div className="relative z-10">
        <h2 className="font-serif font-black text-brand-cream text-[36px] sm:text-[44px] lg:text-[52px] tracking-[-2px] leading-[1.05] mb-5">
          Same-Day<br />Delivery.<br />
          <span className="text-brand-orange">Always Fresh.</span>
        </h2>
        <p className="font-sans text-brand-smoke text-[14px] sm:text-[15px] leading-[1.75] max-w-[360px]">
          Order by 1pm for same-day delivery across Piedmont, Anniston, and
          Centre. Every arrangement cut fresh from our studio.
        </p>
      </div>

      {/* Right: feature cards */}
      <div className="relative z-10 flex flex-col gap-4">
        {FEATURES.map((feat) => (
          <div
            key={feat.label}
            className="bg-brand-cream border-[3px] border-brand-orange px-4 sm:px-5 py-4 flex items-center gap-4 shadow-retro-orange-sm"
          >
            <span className="text-[24px] sm:text-[28px] flex-shrink-0">{feat.icon}</span>
            <div>
              <div className="font-serif font-extrabold text-brand-black text-[14px] sm:text-[15px]">{feat.label}</div>
              <div className="font-sans text-brand-smoke text-[12px] sm:text-[13px]">{feat.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}