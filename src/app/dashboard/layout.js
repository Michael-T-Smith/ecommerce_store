"use client";

import { MockSessionProvider }  from "@/app/dashboard/SessionContext";
import DashboardSidebar         from "@/app/components/dashboard/DashboardSidebar/DashboardSidebar";
import DashboardTopbar          from "@/app/components/dashboard/DashboardTopbar/DashboardTopbar";

export default function DashboardLayout({ children }) {
  return (
    <MockSessionProvider>
      <div className="flex h-screen overflow-hidden bg-[#F4F0EA]">

        {/* Fixed sidebar */}
        <DashboardSidebar />

        {/* Main column */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardTopbar />

          {/* Scrollable content area */}
          <main className="flex-1 overflow-y-auto px-6 sm:px-8 lg:px-10 py-8">
            {children}
          </main>
        </div>
      </div>
    </MockSessionProvider>
  );
}

