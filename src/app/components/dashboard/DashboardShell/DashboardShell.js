"use client";

import { useState }                 from "react";
import { DashboardSessionProvider } from "@/app/dashboard/SessionContext";
import DashboardSidebar             from "@/app/components/dashboard/DashboardSidebar/DashboardSidebar";
import DashboardTopbar              from "@/app/components/dashboard/DashboardTopbar/DashboardTopbar";

export default function DashboardShell({ initialUser, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardSessionProvider initialUser={initialUser}>
      <div className="flex h-screen overflow-hidden" style={{ background: "#F4F0EA" }}>

        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-[40] bg-brand-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardTopbar onMenuClick={() => setSidebarOpen((o) => !o)} />
          <main className="flex-1 overflow-y-auto px-6 sm:px-8 lg:px-10 py-8">
            {children}
          </main>
        </div>
      </div>
    </DashboardSessionProvider>
  );
}