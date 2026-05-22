import { redirect } from "next/navigation";
import { auth } from "@/backend/lib/auth";
import { AdminShell } from "@/frontend/components/admin/AdminShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <AdminShell
      adminEmail={session.user.email ?? undefined}
      adminName={session.user.name ?? undefined}
    >
      {children}
    </AdminShell>
  );
}
