
"use client";

import { usePathname }           from "next/navigation";
import { useDashboardSession }   from "@/app/dashboard/SessionContext";
import { ROLE_META }             from "@/lib/permissions";
import { B }                     from "@/lib/brand";

// Derive a readable breadcrumb from the current pathname
function getBreadcrumb(pathname) {
  const segments = pathname.replace("/dashboard", "").split("/").filter(Boolean);
  if (segments.length === 0) return [{ label: "Dashboard", href: "/dashboard" }];
  return [
    { label: "Dashboard", href: "/dashboard" },
    ...segments.map((seg, i) => ({
      label: seg.charAt(0).toUpperCase() + seg.slice(1),
      href : "/dashboard/" + segments.slice(0, i + 1).join("/"),
    })),
  ];
}

export default function DashboardTopbar() {
  const pathname = usePathname();
  const { user, setUser, allUsers } = useDashboardSession();
  const breadcrumbs = getBreadcrumb(pathname);
  const roleMeta    = ROLE_META[user.role];

  return (
    <header className="bg-white border-b border-gray-200 px-6 sm:px-8 lg:px-10 py-3.5 flex items-center justify-between gap-4 flex-shrink-0">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.href} className="flex items-center gap-2">
            {i > 0 && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="#7A6A58" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
            <span className={`font-sans text-[13px] font-extrabold tracking-[0.5px] truncate ${
              i === breadcrumbs.length - 1
                ? "text-brand-black"
                : "text-brand-smoke hover:text-brand-orange cursor-pointer transition-colors"
            }`}>
              {crumb.label}
            </span>
          </div>
        ))}
      </div>

      {/* Right: role switcher + user badge */}
      <div className="flex items-center gap-3 flex-shrink-0">

        {/* DEV TOOL: Role switcher — remove or auth-gate before go-live */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-sm">
          <span className="font-sans text-[9px] font-extrabold tracking-[2px] uppercase text-brand-smoke">
            Preview as:
          </span>
          <select
            value={user.id}
            onChange={(e) => {
              const selected = allUsers.find((u) => u.id === parseInt(e.target.value));
              if (selected) setUser(selected);
            }}
            className="font-sans font-extrabold text-[11px] bg-transparent border-none outline-none cursor-pointer"
            style={{ color: roleMeta.color }}
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>

        {/* Role badge */}
        <div
          className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase px-3 py-1.5 border-2"
          style={{
            color       : roleMeta.color,
            borderColor : roleMeta.color,
            background  : `${roleMeta.color}15`,
          }}
        >
          {roleMeta.label}
        </div>

        {/* View storefront */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase text-brand-smoke border border-gray-200 px-3 py-1.5 no-underline hover:border-brand-orange hover:text-brand-orange transition-colors flex items-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Storefront
        </a>
      </div>
    </header>
  );
}