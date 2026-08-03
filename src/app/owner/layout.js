import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import "@/styles/pages/owner-dashboard.css";
import OwnerShell from "@/components/owner-dashboard/OwnerShell";

export default async function OwnerLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, name, avatar_url").eq("id", user.id).single();
  if (profile?.role !== "owner") redirect("/");

  return (
    <div className="owner-shell" dir="rtl">
      <OwnerShell ownerName={profile?.name}>{children}</OwnerShell>
    </div>
  );
}
