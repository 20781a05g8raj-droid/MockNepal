import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const user = await getSessionUser();

  // If user is already logged in, their session persists - redirect to dashboard!
  if (user) {
    if (user.role === "ADMIN" || user.role === "CONTENT_EDITOR" || user.role === "OWNER") {
      redirect("/admin/dashboard");
    }
    redirect("/student/dashboard");
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
