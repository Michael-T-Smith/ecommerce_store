// src/app/components/Footer/Footer.js

"use client";

import Link       from "next/link";
import BirdLogo from "@/app/components/icons/BirdLogo";
import { C }      from "@/lib/brand";

const SHOP_LINKS = [
  { label: "All Items",         href: "/shop"                              },
  { label: "Home Décor",        href: "/shop?category=Home"    },
  { label: "Refurbished",       href: "/shop?category=Refurbished"        },
  { label: "Handcrafted",       href: "/shop?category=Handcrafted"        },
  { label: "Seasonal",          href: "/shop?category=Seasonal"           },
  { label: "Gifts",             href: "/shop?category=Gifts"              },
];

const INFO_LINKS = [
  { label: "About Us",         href: "/about"           },
  { label: "Shipping Info",    href: "/faq"        },
  { label: "Collections",      href: "/collections"     },
  { label: "Contact & Returns",href: "/contact"         },
  { label: "My Account",       href: "/account/orders"  },
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
            ${C.blush} 0, ${C.blush} 24px,
            ${C.gold}   24px, ${C.gold}   28px,
            ${C.black}  28px, ${C.black}  32px)`,
        }}
      />

      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 lg:px-16 py-14 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <BirdLogo size={24} color={C.blush} />
              <div>
                <div className="font-serif font-black text-[22px] tracking-[-0.5px] leading-tight text-brand-cream">
                  BityBird
                </div>
                <div className="font-sans font-extrabold text-[9px] tracking-[4px] uppercase text-brand-orange leading-none">
                  Co
                </div>
              </div>
            </div>
            <p className="font-sans text-[12px] text-brand-cream/60 leading-relaxed max-w-[220px] mb-5">
              Handcrafted goods &amp; refurbished finds.
              Online only — shipped across the US.
            </p>
            <div className="flex flex-col gap-2">
              <div className="font-sans text-[11px] text-brand-cream/50 flex items-start gap-2">
                <svg className="flex-shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke={C.blush} strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                hello@company.com
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
            © {year} BityBird Co. All rights reserved.
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