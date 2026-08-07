import { redirect } from "next/navigation";
import CreatePartnerRequestForm from "@/components/pages/find-partner/CreatePartnerRequestForm";
import { getAllCourtsFlat } from "@/services/courtService"; // ← بدل getAllCourts
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "إنشاء طلب شريك — InstaPadel" };

export default async function CreatePartnerRequestPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const courts = await getAllCourtsFlat(); // ← بدل getAllCourts()

  return (
    <section className="section" style={{ paddingTop: 140 }}>
      <div className="container">
        <CreatePartnerRequestForm courts={courts} hostId={user.id} />
      </div>
    </section>
  );
}
