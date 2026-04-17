import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminLoginPage() {
  const authenticated = await isAdminAuthenticated();
  if (authenticated) {
    redirect("/admin");
  }

  return (
    <main className="container-default flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-md">
        <AdminLoginForm />
      </div>
    </main>
  );
}
