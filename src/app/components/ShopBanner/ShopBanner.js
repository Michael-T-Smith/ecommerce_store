import BirdLogo from "@/app/components/icons/BirdLogo";
import { C }      from "@/lib/brand";
import Link from "next/link";

export default function ShopBanner({ title = "Shop", subtitle = "" }) {
  return (
    <section className="bg-brand-grey relative overflow-hidden">
      <div className="relative z-10 px-5 sm:px-10 lg:px-16 py-12 sm:py-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">

        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[3px] uppercase text-brand-smoke mb-4">
            <Link href="/" className="text-brand-smoke hover:text-brand-orange transition-colors no-underline">
              Home
            </Link>
            <span className="text-brand-orange">◆</span>
            <span className="text-brand-orange">{title}</span>
          </div>

          <h1 className="font-serif font-black text-brand-black text-[40px] sm:text-[52px] lg:text-[64px] tracking-[-2px] leading-none m-0">
            {title}
          </h1>
          {subtitle && (
            <p className="font-sans text-brand-smoke text-[13px] sm:text-[14px] mt-3 max-w-[440px] leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Decorative flower badge */}
        <div className="hidden sm:flex items-center justify-center w-[100px] h-[100px] lg:w-[120px] lg:h-[120px] bg-brand-orange rounded-full border-[4px] border-brand-cream relative flex-shrink-0">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `repeating-linear-gradient(-55deg,
                transparent 0, transparent 8px,
                rgba(0,0,0,0.12) 8px, rgba(0,0,0,0.12) 12px)`,
            }}
          />
          <div className="z-10">
            <BirdLogo size={52} color={C.cream} />
          </div>
          <div className="absolute inset-[8px] rounded-full border-2 border-brand-gold pointer-events-none" />
        </div>
      </div>

      {/* Pinstripe bottom band */}
      <div
        className="h-[6px] w-full"
        style={{
          background: `repeating-linear-gradient(90deg,
            ${C.blush} 0,   ${C.blush} 40px,
            ${C.gold}   40px,${C.gold}   50px,
            ${C.blush} 50px,${C.blush} 90px,
            ${C.black}  90px,${C.black}  94px)`,
        }}
      />
    </section>
  );
}
