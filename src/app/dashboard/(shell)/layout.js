import { headers }     from "next/headers";
import DashboardShell  from "@/app/components/dashboard/DashboardShell/DashboardShell";

export const metadata = {
  title: "Dashboard — Lamb's Florist",
};

export default async function ShellLayout({ children }) {
  const h = await headers();

  const user = {
    id   : h.get("x-user-id")    ?? null,
    name : h.get("x-user-name")  ?? "Unknown",
    email: h.get("x-user-email") ?? "",
    role : h.get("x-user-role")  ?? "employee",
  };

  return (
    <DashboardShell initialUser={user}>
      {children}
    </DashboardShell>
  );
}