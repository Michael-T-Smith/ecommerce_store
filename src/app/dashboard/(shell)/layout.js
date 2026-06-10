import { redirect }    from "next/navigation";
import { getSession }  from "@/lib/auth";
import DashboardShell  from "@/app/components/dashboard/DashboardShell/DashboardShell";

export const metadata = { title: "Dashboard - BityBird Co" };

export default async function ShellLayout({ children }) {
  const session = await getSession();

  // Middleware should have already redirected unauthenticated requests,
  // but verify here too — if the JWT is invalid or expired, send to login.
  if (!session || !session.id || !session.role) {
    redirect("/dashboard/login");
  }

  const user = {
    id    : String(session.id),
    name  : session.name  ?? "Staff",
    email : session.email ?? "",
    role  : session.role,
  };

  return (
    <DashboardShell initialUser={user}>
      {children}
    </DashboardShell>
  );
}