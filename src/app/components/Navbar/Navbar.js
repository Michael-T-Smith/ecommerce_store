"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter }          from "next/navigation";
import Link                    from "next/link";
import { usePathname }         from "next/navigation";
import BirdLogo                     from "@/app/components/icons/BirdLogo";
import IconSearch                   from "@/app/components/icons/IconSearch";
import IconUser                     from "@/app/components/icons/IconUser";
import IconBag                      from "@/app/components/icons/IconBag";
import { IconHamburger, IconClose } from "@/app/components/icons/IconMenu";
import { NAV_LINKS }                from "@/lib/data";
import { C }                        from "@/lib/brand";
import { useCart }                  from "@/app/CartContext";

export default function Navbar() {
  const { itemCount } = useCart();
  const router = useRouter();
  const [menuOpen,      setMenuOpen     ] = useState(false);
  const [searchOpen,    setSearchOpen   ] = useState(false);
  const [searchQuery,   setSearchQuery  ] = useState("");
  const searchRef = useRef(null);
  const [accountHref,   setAccountHref  ] = useState("/account/login");
  const [accountLabel,  setAccountLabel ] = useState("Sign In");
  const [customerName,  setCustomerName ] = useState(null);
  const pathname = usePathname();

  // Read the non-HttpOnly hint cookie synchronously — no network request needed.
  useEffect(() => {
    const match = document.cookie.split("; ").find((r) => r.startsWith("bitybird_sess="));
    if (match) {
      const name = decodeURIComponent(match.split("=")[1] ?? "");
      if (name) {
        setCustomerName(name);
        setAccountHref("/account/orders");
        setAccountLabel("My Account");
      }
    }
  }, []);

  return (
    <header className="bg-brand-cream border-b-[3px] border-brand-black sticky top-0 z-50">

      <nav className="flex items-center justify-between px-5 sm:px-10 md:px-14 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 no-underline">
          <BirdLogo size={46} className="flex-shrink-0" />
          <div>
            <div className="font-serif text-[18px] sm:text-[22px] font-black text-brand-black tracking-[-1px] leading-none">
              BityBird Co
            </div>
            <div className="font-sans text-[8px] sm:text-[9px] text-brand-orange tracking-[3px] sm:tracking-[4px] font-extrabold uppercase">
              Every Piece Belongs
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
          {/* Search — expands inline on click */}
          <div className="hidden sm:flex items-center relative">
            {searchOpen && (
              <div className="absolute right-10 top-0 flex items-center">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchOpen(false);
                      setSearchQuery("");
                    }
                    if (e.key === "Escape") {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }
                  }}
                  placeholder="Search items…"
                  autoComplete="off"
                  className="w-[220px] border-b-2 border-brand-black bg-transparent font-sans text-[12px] text-brand-black placeholder:text-brand-smoke/60 focus:outline-none px-2 py-1.5 animate-[fadeIn_0.15s_ease]"
                />
              </div>
            )}
            <button
              onClick={() => {
                if (searchOpen && searchQuery.trim()) {
                  router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchOpen(false);
                  setSearchQuery("");
                } else {
                  setSearchOpen((o) => !o);
                  if (!searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
                }
              }}
              className="bg-transparent border-none cursor-pointer p-2.5 flex items-center"
              aria-label="Search"
            >
              <IconSearch color={searchOpen ? C.blush : C.black} />
            </button>
          </div>

          {/* Account icon — session-aware */}
          <Link
            href={accountHref}
            title={accountLabel}
            className="relative bg-transparent border-none cursor-pointer p-2.5 flex items-center group"
          >
            <IconUser color={customerName ? C.blush : C.black} />
            {/* Authenticated indicator dot */}
            {customerName && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-white"
                style={{ background: C.blush }}
              />
            )}
          </Link>

          {/* Bag — links to /bag page, count from CartContext */}
          <Link
            href="/bag"
            className="bg-brand-black text-brand-cream border-none px-3 sm:px-5 py-2.5 ml-1 sm:ml-2 font-sans font-extrabold text-[11px] sm:text-[12px] tracking-[1px] sm:tracking-[1.5px] uppercase cursor-pointer flex items-center gap-1.5 sm:gap-2 no-underline hover:bg-brand-orange hover:text-brand-black transition-colors duration-150"
          >
            <IconBag color={C.cream} />
            <span className="hidden sm:inline">Bag</span>
            {itemCount > 0 && (
              <span className="bg-brand-orange text-brand-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center leading-none border border-brand-black/20">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden bg-transparent border-none cursor-pointer p-2.5 flex items-center ml-1"
            aria-label="Toggle menu"
          >
            {menuOpen ? <IconClose color={C.black} /> : <IconHamburger color={C.black} />}
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

          {/* Bag row in mobile menu */}
          <Link
            href="/bag"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-between py-3 border-b border-brand-black/10 no-underline"
          >
            <div className="flex items-center gap-2">
              <IconBag color="#8C8288" />
              <span className="font-sans text-[12px] font-extrabold tracking-[2px] uppercase text-brand-smoke">
                Bag {itemCount > 0 && `(${itemCount})`}
              </span>
            </div>
          </Link>

          {/* Account row in mobile menu */}
          <Link
            href={accountHref}
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-between py-3 border-t border-brand-black/10 mt-1 no-underline group"
          >
            <div className="flex items-center gap-2">
              <IconUser color={customerName ? C.blush : "#8C8288"} />
              <span
                className="font-sans text-[12px] font-extrabold tracking-[2px] uppercase"
                style={{ color: customerName ? C.blush : "#8C8288" }}
              >
                {customerName ? `Hi, ${customerName.split(" ")[0]}` : "Sign In"}
              </span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="#8C8288" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      )}
    </header>
  );
}