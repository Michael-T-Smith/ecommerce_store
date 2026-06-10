
"use client";

import Link              from "next/link";
import { usePathname }   from "next/navigation";
import { useCustomer }   from "@/app/account/CustomerContext";
import { C }             from "@/lib/brand";

const NAV_ITEMS = [
  {
    href  : "/account/orders",
    label : "Order History",
    icon  : (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    href  : "/account/addresses",
    label : "Saved Addresses",
    icon  : (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    href  : "/account/settings",
    label : "Account Settings",
    icon  : (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

export default function AccountNav() {
  const pathname          = usePathname();
  const { customer, logout } = useCustomer();

  return (
    <div className="flex flex-col gap-1">
      {/* Customer identity */}
      <div
        className="px-4 py-4 border-[3px] border-brand-black mb-3"
        style={{ background: C.darkGrey }}
      >
        <div
          className="w-10 h-10 rounded-full border-2 border-brand-cream/30 flex items-center justify-center font-serif font-black text-[18px] mb-2"
          style={{ background: C.blush, color: C.cream }}
        >
          {customer?.name?.charAt(0) ?? "?"}
        </div>
        <div className="font-serif font-black text-brand-cream text-[15px] leading-tight truncate">
          {customer?.name}
        </div>
        <div className="font-sans text-[11px] text-brand-cream/50 truncate mt-0.5">
          {customer?.email}
        </div>
      </div>

      {/* Nav links */}
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 border-2 font-sans font-extrabold text-[11px] tracking-[1px] uppercase transition-all no-underline"
            style={{
              borderColor: isActive ? C.black : "transparent",
              background : isActive ? "white" : "transparent",
              color      : isActive ? C.blush : "#8C8288",
              boxShadow  : isActive ? `3px 3px 0 ${C.black}` : "none",
            }}
          >
            <span style={{ color: isActive ? C.blush : "#8C8288" }}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}

      {/* Storefront link */}
      <Link
        href="/shop"
        className="flex items-center gap-3 px-4 py-3 border-2 border-transparent font-sans font-extrabold text-[11px] tracking-[1px] uppercase transition-colors no-underline mt-2"
        style={{ color: "#8C8288" }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Back to Shop
      </Link>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 border-2 border-transparent font-sans font-extrabold text-[11px] tracking-[1px] uppercase transition-colors cursor-pointer bg-transparent text-left mt-1"
        style={{ color: "#8C8288" }}
        onMouseEnter={(e) => e.currentTarget.style.color = "#EF4444"}
        onMouseLeave={(e) => e.currentTarget.style.color = "#8C8288"}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign Out
      </button>
    </div>
  );
}
