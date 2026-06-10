"use client";

import Link    from "next/link";
import Image   from "next/image";
import { C }   from "@/lib/brand";
import BirdLogo from "@/app/components/icons/BirdLogo";

const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='0.06'/%3E%3C/svg%3E")`;

export default function OccasionCard({
  occasion,
  catalogItems,
  isOpen,
  onToggle,
  onAddToCart,
  index = 0,
}) {
  const light      = occasion.lightText;
  const textColor  = light ? C.cream  : C.black;
  const textCls    = light ? "text-brand-cream"      : "text-brand-black";
  const subCls     = light ? "text-brand-cream/65"   : "text-brand-black/60";
  const tagCls     = light
    ? "bg-brand-cream/10 border-brand-cream/20 text-brand-cream/75"
    : "bg-brand-black/8  border-brand-black/15  text-brand-black/65";
  const badgeCls   = light
    ? "bg-brand-cream/10 border-brand-cream/20"
    : "bg-brand-black/8  border-brand-black/15";

  // For very dark accents, use blush for "Recommended" label — stays readable
  const recommendColor =
    occasion.accentColor === "#1D1B1C" || occasion.accentColor === "#3D2B1A"
      ? C.blush
      : occasion.accentColor;

  const num = String(index + 1).padStart(2, "0");

  return (
    <div
      className={`overflow-hidden border-[3px] border-brand-black transition-all duration-300 ${
        isOpen
          ? "shadow-retro-lg"
          : "shadow-retro-sm hover:-translate-y-1 hover:shadow-retro-md"
      }`}
    >
      {/* ── HEADER ── */}
      <button
        onClick={onToggle}
        className="w-full text-left cursor-pointer border-none p-0 block"
        aria-expanded={isOpen}
      >
        <div
          className="relative overflow-hidden px-6 sm:px-10 py-10 sm:py-14"
          style={{ background: occasion.accentColor }}
        >
          {/* Paper grain */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: GRAIN,
              backgroundRepeat: "repeat",
              backgroundSize: "200px 200px",
            }}
          />

          {/* Watermark number */}
          <div
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 font-serif font-black leading-none select-none pointer-events-none"
            style={{
              fontSize: "clamp(72px, 13vw, 180px)",
              letterSpacing: "-6px",
              color: light ? "rgba(250,248,244,0.08)" : "rgba(14,14,14,0.07)",
            }}
          >
            {num}
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">

            {/* Left: copy */}
            <div className="flex-1 max-w-[540px]">

              {/* Emoji + label */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[40px] sm:text-[48px] leading-none">
                  {occasion.emoji}
                </span>
                <span className={`font-sans font-extrabold text-[10px] tracking-[3px] uppercase ${subCls}`}>
                  {occasion.label}
                </span>
              </div>

              <h2
                className={`font-serif font-black tracking-[-2px] leading-[1.0] mb-3 ${textCls}`}
                style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
              >
                {occasion.headline}
              </h2>

              <p className={`font-sans text-[13px] sm:text-[14px] leading-relaxed mb-6 ${subCls}`}>
                {occasion.subheadline}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {occasion.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase px-2.5 py-1 border ${tagCls}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: count + toggle */}
            <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-3 flex-shrink-0">

              <div className={`flex items-center gap-2 px-3 py-2 border ${badgeCls}`}>
                <BirdLogo size={12} color={textColor} />
                <span className={`font-sans font-extrabold text-[9px] tracking-[2px] uppercase ${textCls}`}>
                  {catalogItems.length} Items
                </span>
              </div>

              <div
                className={`w-10 h-10 flex items-center justify-center border-[2px] transition-all duration-300 flex-shrink-0 ${
                  isOpen
                    ? "bg-brand-black border-brand-black rotate-45"
                    : light
                      ? "bg-brand-cream/15 border-brand-cream/30"
                      : "bg-brand-black/10 border-brand-black/20"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <line x1="8" y1="2" x2="8" y2="14"
                    stroke={isOpen ? C.cream : textColor}
                    strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="2" y1="8" x2="14" y2="8"
                    stroke={isOpen ? C.cream : textColor}
                    strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* ── EXPANDED PANEL ── */}
      {isOpen && (
        <div className="bg-brand-cream border-t-[3px] border-brand-black">

          {/* Body copy + shop link */}
          <div className="px-6 sm:px-10 py-6 border-b-[2px] border-brand-black/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="font-sans text-brand-smoke text-[13px] sm:text-[14px] leading-relaxed max-w-[540px]">
              {occasion.bodyCopy}
            </p>
            <Link
              href={`/shop?occasion=${occasion.id}`}
              className="font-sans font-extrabold text-[11px] tracking-[2px] uppercase text-brand-black no-underline border-b-[3px] pb-0.5 whitespace-nowrap self-start sm:self-auto flex-shrink-0 hover:opacity-70 transition-opacity"
              style={{ borderBottomColor: recommendColor }}
            >
              Shop All {occasion.label} →
            </Link>
          </div>

          {/* Product grid */}
          <div className="px-6 sm:px-10 py-6">
            <div
              className="font-sans text-[10px] font-extrabold tracking-[3px] uppercase mb-5"
              style={{ color: recommendColor }}
            >
              ✦ Recommended for {occasion.label}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {catalogItems.map((item) => (
                <OccasionProductCard
                  key={item.id}
                  item={item}
                  accentColor={recommendColor}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inline product card ────────────────────────────────────────────────────────
function OccasionProductCard({ item, accentColor, onAddToCart }) {
  const price = item.prices?.[0] ?? item.price ?? 0;

  return (
    <div className="border-[2px] border-brand-black bg-brand-cream overflow-hidden shadow-retro-sm hover:-translate-y-1 hover:shadow-retro-md transition-all duration-150">

      {/* Image zone */}
      <div
        className="h-[120px] sm:h-[140px] flex items-center justify-center relative overflow-hidden"
        style={{ background: item.inStock ? "#F0E8DE" : "#E8E4DE" }}
      >
        {/* Paper grain */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: GRAIN,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
          }}
        />
        {item.images?.[0]?.path ? (
          <Image
            src={item.images[0].path}
            alt={item.name}
            height={110}
            width={110}
            className={`z-[1] ${!item.inStock ? "opacity-40 grayscale" : ""}`}
          />
        ) : (
          <span className={`text-[48px] sm:text-[52px] z-[1] leading-none ${!item.inStock ? "opacity-40 grayscale" : ""}`}>
            🌸
          </span>
        )}
        {!item.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-cream/60 z-[2]">
            <span className="bg-brand-smoke text-brand-cream font-sans font-extrabold text-[8px] tracking-[1.5px] uppercase px-2 py-1">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="font-serif text-[13px] font-bold text-brand-black leading-tight mb-2">
          {item.name}
        </div>
        <div className="flex items-center justify-between gap-1">
          <span className="font-sans font-black text-[16px] text-brand-black">
            ${price}
          </span>
          <div className="flex gap-1">
            <Link
              href={`/shop/${item.id}`}
              className="bg-transparent text-brand-black border-[2px] border-brand-black px-2 py-1.5 font-sans font-extrabold text-[8px] tracking-[1px] uppercase no-underline hover:bg-brand-black hover:text-brand-cream transition-colors"
            >
              View
            </Link>
            <button
              onClick={() => item.inStock && onAddToCart(item)}
              disabled={!item.inStock}
              className={`border-none px-2 py-1.5 font-sans font-extrabold text-[8px] tracking-[1px] uppercase transition-colors ${
                item.inStock
                  ? "bg-brand-black text-brand-cream cursor-pointer hover:bg-brand-orange hover:text-brand-black"
                  : "bg-brand-smoke/30 text-brand-smoke/60 cursor-not-allowed"
              }`}
            >
              + Bag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
