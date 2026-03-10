
"use client";

import { CustomerProvider } from "@/app/account/CustomerContext";
import AccountNav           from "@/app/components/account/AccountNav/AccountNav";
import { B }               from "@/lib/brand";

function ShellInner({ children }) {
  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      {/* Top accent stripe */}
      <div
        className="h-[5px] w-full"
        style={{
          background: `repeating-linear-gradient(90deg,
            ${B.orange} 0, ${B.orange} 40px,
            ${B.gold}   40px, ${B.gold}   50px,
            ${B.orange} 50px, ${B.orange} 90px,
            ${B.black}  90px, ${B.black}  94px)`,
        }}
      />

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar nav */}
          <aside className="lg:w-[220px] flex-shrink-0">
            <AccountNav />
          </aside>
          {/* Page content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AccountShell({ initialCustomer, children }) {
  return (
    <CustomerProvider initialCustomer={initialCustomer}>
      <ShellInner>{children}</ShellInner>
    </CustomerProvider>
  );
}
