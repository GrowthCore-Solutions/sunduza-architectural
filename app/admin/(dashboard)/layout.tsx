import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminShell } from "@/src/client/components/admin/AdminShell";

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
