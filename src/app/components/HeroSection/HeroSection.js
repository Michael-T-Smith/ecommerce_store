
"use client";

import { useState, useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import BirdLogo from "@/app/components/icons/BirdLogo";
import { C } from "@/lib/brand";

export default function HeroSection({ theme, featuredItems = [] }) {
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading,    setFading   ] = useState(false);

  const items  = featuredItems.slice(0, 3);
  const active = items[activeIdx];

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActiveIdx((i) => (i + 1) % items.length);
        setFading(false);
      }, 260);
    }, 5000);
    return () => clearInterval(t);
  }, [items.length]);

  function goTo(idx) {
    if (idx === activeIdx) return;
    setFading(true);
    setTimeout(() => { setActiveIdx(idx); setFading(false); }, 200);
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 min-h-[75vh] md:min-h-[90vh] overflow-hidden">

      {/* ── LEFT: Copy panel ── */}
      <div className="flex flex-col justify-center px-8 sm:px-12 md:px-[72px] py-16 md:py-20 bg-brand-cream relative overflow-hidden">

        {/* Vertical door stripes */}
        <div className="absolute left-0 top-0 bottom-0 flex gap-[3px]">
          <div className="w-2 h-full" style={{ background: theme.panelBg }} />
          <div className="w-1 h-full bg-brand-gold" />
          <div className="w-2 h-full" style={{ background: theme.panelBg }} />
        </div>

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 text-brand-cream font-sans text-[9px] sm:text-[10px] font-extrabold tracking-[2px] sm:tracking-[3px] uppercase px-3 sm:px-4 py-1.5 border-2 border-brand-black mb-6 w-fit"
          style={{ background: theme.panelBg }}
        >
          <BirdLogo size={12} color={C.cream} />
          {theme.badge}
        </div>

        {/* Headline */}
        <h1 className="font-serif font-black text-brand-black leading-[1.02] tracking-[-2px] sm:tracking-[-2.5px] mb-5 text-[clamp(40px,8vw,76px)]">
          {theme.headline.map((line, i) => (
            <span key={i}>
              <span style={{ color: i === theme.accentLine ? theme.panelBg : "#4a4a4a" }}>
                {line}
              </span>
              {i < theme.headline.length - 1 && <br />}
            </span>
          ))}
        </h1>

        {/* Sub copy */}
        <p className="font-sans text-sm sm:text-base text-brand-smoke leading-[1.75] max-w-[420px] mb-8 sm:mb-11">
          {theme.sub}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => router.push("/shop")}
            className="text-brand-cream border-[3px] border-brand-black px-7 sm:px-9 py-3.5 sm:py-4 font-sans font-black text-[12px] sm:text-[13px] tracking-[2px] uppercase cursor-pointer shadow-retro-md transition-all duration-100 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm text-center"
            style={{ background: theme.panelBg }}
          >
            {theme.cta} →
          </button>
          <button
            onClick={() => router.push("/about")}
            className="bg-transparent text-brand-black border-[3px] border-brand-black px-7 sm:px-9 py-3.5 sm:py-4 font-sans font-black text-[12px] sm:text-[13px] tracking-[2px] uppercase cursor-pointer text-center"
          >
            Our Story
          </button>
        </div>
      </div>

      {/* ── RIGHT: Product billboard ── */}
      <div
        className="hidden md:relative md:flex md:flex-col overflow-hidden transition-colors duration-500"
        style={{ background: theme.panelBg }}
      >
        {active ? (
          <>
            {/* Tag badge — floats top-right */}
            {active.tag && (
              <div
                className="absolute top-7 right-7 z-10 font-sans font-extrabold text-[8px] tracking-[3px] uppercase px-3 py-1.5 text-brand-cream pointer-events-none"
                style={{
                  background  : `${C.black}55`,
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  letterSpacing: "0.25em",
                }}
              >
                {active.tag}
              </div>
            )}

            {/* Product PNG — fills upper portion, transparent, no box */}
            <div
              className="flex-1 flex items-end justify-center px-12 pt-14 min-h-0"
              style={{ opacity: fading ? 0 : 1, transition: "opacity 0.24s ease" }}
            >
              {active.images?.[0]?.path ? (
                <img
                  src={active.images[0].path}
                  alt={active.name}
                  draggable={false}
                  onClick={() => {redirect(`/shop/${active.id}`)}}
                  className="w-auto select-none"
                  style={{
                    maxHeight   : "52vh",
                    maxWidth    : "100%",
                    objectFit   : "contain",
                    filter      : "drop-shadow(0 24px 40px rgba(0,0,0,0.22))",
                  }}
                />
              ) : (
                <BirdLogo size={200} color={C.cream} style={{ opacity: 0.09 }} />
              )}
            </div>

            {/* ── Text block — editorial, bottom-anchored ── */}
            <div
              className="px-10 lg:px-12 pt-7 pb-10 flex flex-col gap-0"
              style={{ opacity: fading ? 0 : 1, transition: "opacity 0.24s ease" }}
            >
              {/* Rule + category */}
              <div className="flex items-center gap-4 mb-4">
                <div className="h-[1px] w-8 flex-shrink-0" style={{ background: `${C.cream}35` }} />
                <span
                  className="font-sans font-extrabold text-[8px] tracking-[4px] uppercase"
                  style={{ color: `${C.black}50` }}
                >
                  {active.category}
                </span>
              </div>

              {/* Product name — large italic serif */}
              <h2
                className="font-serif italic font-black text-brand-cream leading-[1.04] mb-5"
                style={{
                  fontSize    : "clamp(24px, 2.8vw, 38px)",
                  letterSpacing: "-0.02em",
                }}
              >
                {active.name}
              </h2>

              {/* Price row */}
              <div
                className="flex items-baseline gap-3 pb-5 mb-5"
                style={{ borderBottom: `1px solid ${C.black}18` }}
              >
                <span
                  className="font-sans font-extrabold text-[8px] tracking-[4px] uppercase"
                  style={{ color: `${C.black}45` }}
                >
                  from
                </span>
                <span
                  className="font-serif font-black text-brand-cream"
                  style={{
                    fontSize    : "clamp(30px, 3.4vw, 46px)",
                    lineHeight  : 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  ${Math.min(...(active.prices ?? [0])).toFixed(2)}
                </span>
              </div>

              {/* CTA row + dots */}
              <div className="flex items-center justify-between">
                <Link
                  href={`/shop/${active.id}`}
                  className="font-sans font-extrabold text-[10px] tracking-[3px] uppercase text-brand-cream no-underline hover:opacity-60 transition-opacity duration-150"
                >
                  Shop Now →
                </Link>

                {items.length > 1 && (
                  <div className="flex gap-2">
                    {items.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        aria-label={`Item ${i + 1}`}
                        className="cursor-pointer border-none p-0 transition-all duration-250"
                        style={{
                          width       : i === activeIdx ? "18px" : "6px",
                          height      : "6px",
                          borderRadius: i === activeIdx ? "3px" : "50%",
                          background  : i === activeIdx ? C.cream : `${C.cream}28`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* No featured items — minimal fallback */
          <div className="flex-1 flex items-center justify-center">
            <BirdLogo size={140} color={C.cream} style={{ opacity: 0.08 }} />
          </div>
        )}
      </div>
    </section>
  );
}
