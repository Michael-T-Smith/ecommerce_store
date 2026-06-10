'use client'
import Link from "next/link";
import BirdLogo from "@/app/components/icons/BirdLogo";
import { C } from "@/lib/brand";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    setTimeout(() => {
      window.location.href = '/';
    }, 2000)
  }, [])

  return (
    <div className="min-h-screen bg-brand-black text-brand-cream flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Diagonal stripe wallpaper */}
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(-55deg,
            transparent 0px, transparent 60px,
            rgba(212,81,26,0.05) 60px, rgba(212,81,26,0.05) 68px)`
        }}
      />

      <div className="relative z-10 text-center max-w-2xl">

        {/* Decorative badge */}
        <div className="mx-auto mb-8 w-[120px] h-[120px] bg-brand-orange rounded-full border-[4px] border-brand-cream flex items-center justify-center shadow-retro-lg relative">

          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `repeating-linear-gradient(-55deg,
                transparent 0, transparent 8px,
                rgba(0,0,0,0.12) 8px, rgba(0,0,0,0.12) 12px)`
            }}
          />

          <div className="z-10">
            <BirdLogo size={56} color={C.cream} />
          </div>

          <div className="absolute inset-[10px] rounded-full border-2 border-brand-gold pointer-events-none" />
        </div>

        {/* 404 Number */}
        <h1 className="font-serif font-black text-[96px] sm:text-[120px] leading-none tracking-[-4px] text-brand-cream mb-4">
          404
        </h1>

        {/* Title */}
        <h2 className="font-serif font-black text-[32px] sm:text-[40px] tracking-[-1px] mb-4">
          This Page Does Not Exist! <br /> Going Home now!
        </h2>

        {/* Description */}
        <p className="font-sans text-brand-smoke text-[14px] sm:text-[15px] leading-relaxed max-w-md mx-auto mb-10">
          The page you’re looking for may have been moved, removed, or never existed.
          Let’s get you back to something beautiful.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">

          <Link
            href="/"
            className="bg-brand-orange text-brand-cream border-[3px] border-brand-orange px-8 py-3 font-sans font-extrabold text-[11px] tracking-[2px] uppercase no-underline shadow-retro-sm hover:shadow-retro-orange-sm transition-all duration-150"
          >
            Back Home
          </Link>

          <Link
            href="/shop"
            className="bg-transparent text-brand-cream border-[3px] border-brand-cream px-8 py-3 font-sans font-extrabold text-[11px] tracking-[2px] uppercase no-underline hover:bg-brand-cream hover:text-brand-black transition-colors duration-150"
          >
            Browse Shop
          </Link>

        </div>
      </div>

      {/* Bottom pinstripe band */}
      <div
        className="absolute bottom-0 left-0 w-full h-[6px]"
        style={{
          background: `repeating-linear-gradient(90deg,
            ${C.blush} 0,   ${C.blush} 40px,
            ${C.gold}   40px,${C.gold}   50px,
            ${C.blush} 50px,${C.blush} 90px,
            ${C.black}  90px,${C.black}  94px)`
        }}
      />
    </div>
  );
}