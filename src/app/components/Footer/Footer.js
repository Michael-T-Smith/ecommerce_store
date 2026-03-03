
import FlowerMark from "@/app/components/icons/FlowerMark";
import { B }      from "@/lib/brand";

const FOOTER_COLS = [
  { title: "Shop", links: ["All Flowers", "Bouquets", "Seasonal", "Gifts"]  },
  { title: "Info", links: ["About Us", "Delivery Info", "FAQ", "Contact"]   },
];

export default function Footer() {
  return (
    <footer className="bg-brand-bark px-5 sm:px-10 lg:px-16 pt-10 pb-12 border-t-[6px] border-brand-black relative overflow-hidden">

      {/* Pinstripe header band */}
      <div
        className="absolute top-0 left-0 right-0 h-[6px]"
        style={{
          background: `repeating-linear-gradient(90deg,
            ${B.orange} 0,   ${B.orange} 40px,
            ${B.gold}   40px,${B.gold}   50px,
            ${B.orange} 50px,${B.orange} 90px,
            ${B.black}  90px,${B.black}  94px)`,
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-10 lg:gap-16 mt-4">

        {/* Brand column — full width on mobile */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-11 h-11 bg-brand-orange rounded-full flex items-center justify-center border-[3px] border-brand-cream flex-shrink-0">
              <FlowerMark size={28} fill={B.cream} stroke={B.cream} />
            </div>
            <div className="font-serif text-[20px] font-black text-brand-cream tracking-[-0.5px]">
              Lamb&apos;s Florist
            </div>
          </div>
          <p className="font-sans text-brand-gold text-[13px] sm:text-[14px] leading-[1.75] max-w-[280px]">
            Handcrafted floral arrangements by Cecelia &amp; Frank. Serving
            Piedmont, Anniston, and Centre with love since day one.
          </p>
        </div>

        {/* Link columns */}
        {FOOTER_COLS.map((col) => (
          <div key={col.title}>
            <div className="font-sans text-[10px] font-extrabold tracking-[4px] text-brand-orange uppercase mb-4 sm:mb-5">
              {col.title}
            </div>
            {col.links.map((link) => (
              <a
                key={link}
                href="#"
                className="block font-sans text-brand-cream text-[13px] sm:text-[14px] no-underline mb-2 sm:mb-2.5 opacity-80 hover:opacity-100 transition-opacity"
              >
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="mt-10 pt-6 border-t border-brand-cream/10 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="font-sans text-brand-smoke text-[11px] tracking-[1px]">
          © {new Date().getFullYear()} Lamb&apos;s Florist. All rights reserved.
        </p>
        <p className="font-sans text-brand-smoke text-[10px] tracking-[1px] opacity-60">
          Powered by Dopamine Drip Platform
        </p>
      </div>
    </footer>
  );
}