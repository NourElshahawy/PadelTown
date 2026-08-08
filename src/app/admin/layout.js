import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import "@/styles/pages/owner-dashboard.css";
import { ToastProvider } from "@/components/shared/ToastProvider";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, name").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="owner-shell" dir="rtl">
      <ToastProvider>
        <AdminSidebar adminName={profile?.name} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div className="owner-content">
            <div className="owner-content-inner">{children}</div>
          </div>
        </div>
      </ToastProvider>
    </div>
  );
}
