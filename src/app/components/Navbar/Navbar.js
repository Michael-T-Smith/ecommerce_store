
"use client";

import { useState }    from "react";
import Link            from "next/link";
import { usePathname } from "next/navigation";
import FlowerMark                   from "@/app/components/icons/FlowerMark";
import IconSearch                   from "@/app/components/icons/IconSearch";
import IconUser                     from "@/app/components/icons/IconUser";
import IconBag                      from "@/app/components/icons/IconBag";
import { IconHamburger, IconClose } from "@/app/components/icons/IconMenu";
import { NAV_LINKS }                from "@/lib/data";
import { B }                        from "@/lib/brand";

export default function Navbar({ cartCount = 0, onCartClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-brand-cream border-b-[3px] border-brand-black sticky top-0 z-50">

      <nav className="flex items-center justify-between px-5 sm:px-10 md:px-14 py-4">

        {/* Logo — always routes home */}
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] bg-brand-orange rounded-full border-[3px] border-brand-black flex items-center justify-center relative overflow-hidden shadow-retro-sm flex-shrink-0">
            <div
              className="absolute inset-0"
              style={{
                background: `repeating-linear-gradient(-55deg,
                  transparent 0, transparent 5px,
                  rgba(0,0,0,0.15) 5px, rgba(0,0,0,0.15) 8px)`,
              }}
            />
            <div className="z-10">
              <FlowerMark size={28} fill={B.cream} stroke={B.black} />
            </div>
          </div>
          <div>
            <div className="font-serif text-[18px] sm:text-[22px] font-black text-brand-black tracking-[-1px] leading-none">
              Lamb&apos;s Florist
            </div>
            <div className="font-sans text-[8px] sm:text-[9px] text-brand-orange tracking-[3px] sm:tracking-[4px] font-extrabold uppercase">
              Piedmont, Alabama
            </div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex gap-10">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-[12px] font-extrabold tracking-[2px] uppercase text-brand-black no-underline border-b-2 pb-0.5 transition-colors duration-200 ${
                  active
                    ? "border-brand-orange"
                    : "border-transparent hover:border-brand-orange"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-1 items-center">
          <button className="hidden sm:flex bg-transparent border-none cursor-pointer p-2.5 items-center">
            <IconSearch color={B.black} />
          </button>
          <Link
            href="/account"
            title="My Account"
            className="bg-transparent border-none cursor-pointer p-2.5 flex items-center"
          >
            <IconUser color={B.black} />
          </Link>
          <button
            onClick={onCartClick}
            className="bg-brand-black text-brand-cream border-none px-3 sm:px-5 py-2.5 ml-1 sm:ml-2 font-sans font-extrabold text-[11px] sm:text-[12px] tracking-[1px] sm:tracking-[1.5px] uppercase cursor-pointer flex items-center gap-1.5 sm:gap-2"
          >
            <IconBag color={B.cream} />
            <span className="hidden sm:inline">Bag</span>
            {cartCount > 0 && `(${cartCount})`}
          </button>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden bg-transparent border-none cursor-pointer p-2.5 flex items-center ml-1"
            aria-label="Toggle menu"
          >
            {menuOpen ? <IconClose color={B.black} /> : <IconHamburger color={B.black} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-brand-cream border-t-[3px] border-brand-black px-5 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`font-sans text-[13px] font-extrabold tracking-[2px] uppercase no-underline py-3 border-b border-brand-black/10 last:border-b-0 transition-colors ${
                pathname === link.href
                  ? "text-brand-orange"
                  : "text-brand-black hover:text-brand-orange"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 flex items-center gap-2 border-t border-brand-black/10 mt-1">
            <IconSearch color={B.smoke} />
            <span className="font-sans text-[12px] font-extrabold tracking-[2px] uppercase text-brand-smoke">
              Search
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
