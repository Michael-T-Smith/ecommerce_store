
"use client";

import Link        from "next/link";
import { usePathname } from "next/navigation";
import FlowerMark  from "@/app/components/icons/FlowerMark";
import { B }       from "@/lib/brand";
import { useDashboardSession } from "@/app/dashboard/SessionContext";
import { canDo }   from "@/lib/permissions";

const NAV_SECTIONS = [
  {
    group: "Overview",
    items: [
      {
        label   : "Dashboard",
        href    : "/dashboard",
        resource: null,          // always visible
        icon    : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
        ),
      },
    ],
  },
  {
    group: "Management",
    items: [
      {
        label   : "Inventory",
        href    : "/dashboard/inventory",
        resource: "inventory",
        icon    : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        ),
      },
      {
        label   : "Orders",
        href    : "/dashboard/orders",
        resource: "orders",
        soon    : true,
        icon    : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        ),
      },
      {
        label   : "Delivery",
        href    : "/dashboard/delivery",
        resource: "delivery",
        soon    : true,
        icon    : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <path d="M16 8l4 2v5h-4V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        ),
      },
    ],
  },
  {
    group: "People",
    items: [
      {
        label   : "Employees",
        href    : "/dashboard/employees",
        resource: "employees",
        soon    : true,
        icon    : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
      {
        label   : "Customers",
        href    : "/dashboard/customers",
        resource: "users",
        soon    : true,
        icon    : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        ),
      },
    ],
  },
  {
    group: "Analytics",
    items: [
      {
        label   : "Reports",
        href    : "/dashboard/reports",
        resource: null,
        soon    : true,
        icon    : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4"  />
            <line x1="6"  y1="20" x2="6"  y2="14" />
          </svg>
        ),
      },
    ],
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useDashboardSession();

  return (
    <aside className="hidden md:flex flex-col w-[240px] flex-shrink-0 bg-brand-bark border-r-[3px] border-brand-black overflow-y-auto">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b-[2px] border-brand-cream/10">
        <div className="w-9 h-9 bg-brand-orange rounded-full border-2 border-brand-cream flex items-center justify-center flex-shrink-0">
          <FlowerMark size={20} fill={B.cream} stroke={B.black} />
        </div>
        <div>
          <div className="font-serif font-black text-brand-cream text-[14px] leading-none tracking-[-0.5px]">
            Lamb&apos;s Florist
          </div>
          <div className="font-sans text-[9px] text-brand-orange tracking-[2px] uppercase font-extrabold mt-0.5">
            Dashboard
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-5">
        {NAV_SECTIONS.map((section) => {
          // Filter items the current role can't read at all
          const visibleItems = section.items.filter((item) =>
            !item.resource || canDo(user.role, item.resource, "read")
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.group}>
              <div className="font-sans text-[9px] font-extrabold tracking-[3px] uppercase text-brand-cream/30 px-3 mb-2">
                {section.group}
              </div>
              <div className="flex flex-col gap-0.5">
                {visibleItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <div key={item.href}>
                      {item.soon ? (
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-not-allowed opacity-40">
                          <span className="text-brand-cream/60">{item.icon}</span>
                          <span className="font-sans font-extrabold text-[12px] text-brand-cream/60 tracking-[0.5px]">
                            {item.label}
                          </span>
                          <span className="ml-auto font-sans text-[8px] tracking-[1.5px] uppercase text-brand-smoke bg-brand-cream/10 px-1.5 py-0.5 rounded-sm">
                            Soon
                          </span>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-sm no-underline transition-colors duration-150 group ${
                            active
                              ? "bg-brand-orange text-brand-cream"
                              : "text-brand-cream/70 hover:bg-brand-cream/10 hover:text-brand-cream"
                          }`}
                        >
                          <span className={active ? "text-brand-cream" : "text-brand-cream/50 group-hover:text-brand-cream"}>
                            {item.icon}
                          </span>
                          <span className="font-sans font-extrabold text-[12px] tracking-[0.5px]">
                            {item.label}
                          </span>
                          {active && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-cream" />
                          )}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom: current user */}
      <div className="px-4 py-4 border-t-[2px] border-brand-cream/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-orange/20 border border-brand-orange/40 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="font-serif font-black text-brand-orange text-[13px]">
              {user.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-sans font-extrabold text-[11px] text-brand-cream truncate">
              {user.name}
            </div>
            <div className="font-sans text-[9px] text-brand-smoke tracking-[1px] uppercase">
              {user.role}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
