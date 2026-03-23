
"use client";

import FlowerMark from "@/app/components/icons/FlowerMark";
import { B }      from "@/lib/brand";
import { redirect } from "next/navigation";

export default function HeroSection({ theme }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 min-h-[75vh] md:min-h-[90vh] overflow-hidden">

      {/* ── LEFT: Copy panel ── */}
      <div className="flex flex-col justify-center px-8 sm:px-12 md:px-[72px] py-16 md:py-20 bg-brand-cream relative overflow-hidden">

        {/* Vertical door stripes */}
        <div className="absolute left-0 top-0 bottom-0 flex gap-[3px]">
          <div className="w-2 h-full" style={{background: theme.panelBg}} />
          <div className="w-1 h-full bg-brand-gold" />
          <div className="w-2 h-full" style={{background: theme.panelBg}} />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 text-brand-cream font-sans text-[9px] sm:text-[10px] font-extrabold tracking-[2px] sm:tracking-[3px] uppercase px-3 sm:px-4 py-1.5 border-2 border-brand-black mb-6 w-fit" style={{background: theme.panelBg}}>
          <FlowerMark size={12} fill={B.cream} stroke={B.cream} />
          {theme.badge}
        </div>

        {/* Headline */}
        <h1 className="font-serif font-black text-brand-black leading-[1.02] tracking-[-2px] sm:tracking-[-2.5px] mb-5 text-[clamp(40px,8vw,76px)]">
          {theme.headline.map((line, i) => (
            <span key={i}>
              <span style={{color: `${i === theme.accentLine ? theme.panelBg : 'black'}`}}>
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

        {/* CTAs — stack on mobile, row on sm+ */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button onClick={() => redirect('/shop')}
            className="text-brand-cream border-[3px] border-brand-black px-7 sm:px-9 py-3.5 sm:py-4 font-sans font-black text-[12px] sm:text-[13px] tracking-[2px] uppercase cursor-pointer shadow-retro-md transition-all duration-100 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm text-center" style={{background: theme.panelBg}}
          >
            {theme.cta} →
          </button>
          <button onClick={() => redirect('/about')}
            className="bg-transparent text-brand-black border-[3px] border-brand-black px-7 sm:px-9 py-3.5 sm:py-4 font-sans font-black text-[12px] sm:text-[13px] tracking-[2px] uppercase cursor-pointer text-center"
          >
            Our Story
          </button>
        </div>
      </div>

      {/* ── RIGHT: Visual panel — hidden on mobile, shown md+ ── */}
      <div
        className="hidden md:flex relative overflow-hidden items-center justify-center transition-colors duration-[400ms]"
        style={{ background: theme.panelBg }}
      >
        {/* Diagonal stripe wallpaper */}
        <div
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(-55deg,
              transparent 0px, transparent 48px,
              rgba(0,0,0,0.12) 48px, rgba(0,0,0,0.12) 56px,
              transparent 56px, transparent 62px,
              rgba(0,0,0,0.06) 62px, rgba(0,0,0,0.06) 66px)`,
          }}
        />

        {/* Cream focal circle */}
        <div className="w-[320px] h-[320px] lg:w-[400px] lg:h-[400px] bg-brand-cream rounded-full border-[6px] border-brand-black flex items-center justify-center flex-col gap-3 relative z-[2] shadow-retro-lg">
          <div className="text-[80px] lg:text-[100px] leading-none">{theme.panelEmoji}</div>
          <div className="font-sans text-[9px] lg:text-[10px] font-extrabold tracking-[4px] lg:tracking-[5px] text-brand-smoke uppercase">
            Piedmont, Alabama
          </div>
          <div className="absolute inset-[14px] rounded-full border-2 border-brand-gold pointer-events-none" />
        </div>

        {/* Floating badge tags */}
        {theme.floatingTags.map((text, i) => {
          const positions = [
            { top: "13%", left: "6%",  rotate: "-10deg" },
            { top: "74%", right: "8%", rotate: "7deg"   },
            { top: "18%", right: "5%", rotate: "11deg"  },
          ];
          const p = positions[i];
          return (
            <div
              key={text}
              className="absolute bg-brand-black text-brand-cream font-sans font-extrabold text-[10px] lg:text-[11px] tracking-[1.5px] px-4 py-2 z-[3] border-2 border-brand-cream"
              style={{ top: p.top, left: p.left, right: p.right, transform: `rotate(${p.rotate})` }}
            >
              {text}
            </div>
          );
        })}
      </div>
    </section>
  );
}