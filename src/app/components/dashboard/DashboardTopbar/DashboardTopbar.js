
"use client";
 
import { usePathname }         from "next/navigation";
import Link                    from "next/link";
import { useDashboardSession } from "@/app/dashboard/SessionContext";
import { ROLE_META }           from "@/lib/permissions";
 
function getBreadcrumbs(pathname) {
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
  const pathname         = usePathname();
  const { user, logout } = useDashboardSession();
  const breadcrumbs      = getBreadcrumbs(pathname);
  const roleMeta         = ROLE_META[user?.role] ?? ROLE_META.employee;
 
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
            {i < breadcrumbs.length - 1 ? (
              <Link href={crumb.href}
                className="font-sans text-[13px] font-extrabold tracking-[0.5px] text-brand-smoke hover:text-brand-orange transition-colors no-underline truncate">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-sans text-[13px] font-extrabold tracking-[0.5px] text-brand-black truncate">
                {crumb.label}
              </span>
            )}
          </div>
        ))}
      </div>
 
      {/* Right: role badge · storefront link · user info · logout */}
      <div className="flex items-center gap-3 flex-shrink-0">
 
        <div
          className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase px-3 py-1.5 border-2 hidden sm:block"
          style={{ color: roleMeta.color, borderColor: roleMeta.color, background: `${roleMeta.color}18` }}
        >
          {roleMeta.label}
        </div>
 
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase text-brand-smoke border border-gray-200 px-3 py-1.5 no-underline hover:border-brand-orange hover:text-brand-orange transition-colors hidden sm:flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Storefront
        </a>
 
        <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
          <div className="hidden sm:block text-right">
            <div className="font-sans font-extrabold text-[12px] text-brand-black leading-tight">
              {user?.name ?? "—"}
            </div>
            <div className="font-sans text-[10px] text-brand-smoke leading-tight">
              {user?.email ?? ""}
            </div>
          </div>
          <button onClick={logout} title="Sign out"
            className="w-8 h-8 flex items-center justify-center border border-gray-200 text-brand-smoke cursor-pointer hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors bg-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}