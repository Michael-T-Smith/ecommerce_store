// src/app/components/Footer/Footer.js

"use client";

import Link       from "next/link";
import FlowerMark from "@/app/components/icons/FlowerMark";
import { B }      from "@/lib/brand";

const SHOP_LINKS = [
  { label: "All Arrangements",  href: "/shop"                           },
  { label: "Bouquets",          href: "/shop?category=Bouquets"         },
  { label: "Arrangements",      href: "/shop?category=Arrangements"     },
  { label: "Plants",            href: "/shop?category=Plants"           },
  { label: "Seasonal",          href: "/shop?category=Seasonal"         },
  { label: "Gifts",             href: "/shop?category=Gifts"            },
];

const INFO_LINKS = [
  { label: "About Us",         href: "/about"    },
  { label: "Delivery Info",    href: "/delivery" },
  { label: "Occasions",        href: "/occasions"},
  { label: "My Account",       href: "/account/orders" },
  { label: "Track My Order",   href: "/account/orders" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-black text-brand-cream border-t-[4px] border-brand-orange">

      {/* Top stripe */}
      <div
        className="h-[6px] w-full"
        style={{
          background: `repeating-linear-gradient(90deg,
            ${B.orange} 0, ${B.orange} 24px,
            ${B.gold}   24px, ${B.gold}   28px,
            ${B.black}  28px, ${B.black}  32px)`,
        }}
      />

      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 lg:px-16 py-14 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <FlowerMark size={24} fill={B.orange} stroke={B.orange} />
              <div>
                <div className="font-serif font-black text-[22px] tracking-[-0.5px] leading-tight text-brand-cream">
                  Lamb&apos;s
                </div>
                <div className="font-sans font-extrabold text-[9px] tracking-[4px] uppercase text-brand-orange leading-none">
                  Florist
                </div>
              </div>
            </div>
            <p className="font-sans text-[12px] text-brand-cream/60 leading-relaxed max-w-[220px] mb-5">
              Handcrafted flowers for every occasion.
              Serving Piedmont &amp; Anniston, Alabama since 1987.
            </p>
            {/* Location info */}
            <div className="flex flex-col gap-2">
              <div className="font-sans text-[11px] text-brand-cream/50 flex items-start gap-2">
                <svg className="flex-shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke={B.orange} strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                204 Main St, Piedmont, AL 36272
              </div>
              <div className="font-sans text-[11px] text-brand-cream/50 flex items-start gap-2">
                <svg className="flex-shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke={B.orange} strokeWidth="2.5" strokeLinecap="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                (256) 447-6331
              </div>
              <div className="font-sans text-[11px] text-brand-cream/50 flex items-start gap-2">
                <svg className="flex-shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke={B.orange} strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Mon–Sat 8am–6pm
              </div>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <div className="font-sans font-extrabold text-[10px] tracking-[3px] uppercase text-brand-orange mb-5">
              Shop
            </div>
            <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
              {SHOP_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-sans text-[13px] text-brand-cream/70 hover:text-brand-orange transition-colors no-underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div>
            <div className="font-sans font-extrabold text-[10px] tracking-[3px] uppercase text-brand-orange mb-5">
              Info
            </div>
            <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
              {INFO_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="font-sans text-[13px] text-brand-cream/70 hover:text-brand-orange transition-colors no-underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours & social */}
          <div>
            <div className="font-sans font-extrabold text-[10px] tracking-[3px] uppercase text-brand-orange mb-5">
              Hours
            </div>
            <div className="flex flex-col gap-1.5 mb-6">
              {[
                ["Mon–Fri", "8:00am – 6:00pm"],
                ["Saturday", "8:00am – 5:00pm"],
                ["Sunday",   "Closed"],
              ].map(([day, hrs]) => (
                <div key={day} className="flex items-center justify-between gap-4">
                  <span className="font-sans text-[12px] text-brand-cream/60">{day}</span>
                  <span className={`font-sans font-extrabold text-[11px] ${hrs === "Closed" ? "text-brand-smoke" : "text-brand-cream/80"}`}>
                    {hrs}
                  </span>
                </div>
              ))}
            </div>

            <div className="font-sans font-extrabold text-[10px] tracking-[3px] uppercase text-brand-orange mb-4">
              Follow
            </div>
            <div className="flex gap-3">
              {/* Facebook */}
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 border border-brand-cream/20 flex items-center justify-center text-brand-cream/50 hover:border-brand-orange hover:text-brand-orange transition-colors no-underline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 border border-brand-cream/20 flex items-center justify-center text-brand-cream/50 hover:border-brand-orange hover:text-brand-orange transition-colors no-underline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4.5" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="font-sans text-[11px] text-brand-cream/40">
            © {year} Lamb&apos;s Florist. All rights reserved.
          </div>
          <div className="flex gap-5">
            {[
              { label: "Privacy Policy",    href: "/" },
              { label: "Terms of Service",  href: "/" },
            ].map((l) => (
              <Link key={l.label} href={l.href}
                className="font-sans text-[11px] text-brand-cream/40 hover:text-brand-cream/70 transition-colors no-underline">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}