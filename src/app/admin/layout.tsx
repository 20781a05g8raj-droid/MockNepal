import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AdminShellWrapper from "@/components/AdminShellWrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  // Enforce administrative permissions (PRD Section 4)
  const allowedRoles = ["ADMIN", "CONTENT_EDITOR", "OWNER"];
  if (!allowedRoles.includes(user.role)) {
    redirect("/student/dashboard");
  }

  return (
    <AdminShellWrapper user={user}>
      {children}
    </AdminShellWrapper>
  );
}

