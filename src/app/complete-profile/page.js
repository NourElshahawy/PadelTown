import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CompleteProfileForm from "@/components/shared/CompleteProfileForm";

export const metadata = { title: "أكمل بياناتك — InstaPadel" };

export default async function CompleteProfilePage({ searchParams }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("phone").eq("id", user.id).maybeSingle();

  // لو رقمه موجود بالفعل (دخل الصفحة بالغلط أو رجع تاني)، نوديه على طول
  if (profile?.phone) redirect(sp.redirect || "/");

  return <CompleteProfileForm redirectTo={sp.redirect || "/"} />;
}
