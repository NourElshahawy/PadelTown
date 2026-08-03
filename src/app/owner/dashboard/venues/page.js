import { createClient } from "@/lib/supabase/server";
import VenuesManager from "@/components/owner-dashboard/VenuesManager";
import AddVenueForm from "@/components/owner-dashboard/AddVenueForm";

export default async function OwnerVenuesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: venues } = await supabase.from("venues").select("id, name, status, courts(id, name, type, price_per_hour, images)").eq("owner_id", user.id);

  return (
    <>
      <h1 className="owner-page-title">ملاعبي</h1>

      <VenuesManager venues={venues || []} />

      <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--border-glass)" }}>
        <p style={{ color: "var(--text-faint)", fontSize: ".82rem", marginBottom: 10 }}>عندك نادي في مكان مختلف تمامًا (مش امتداد لنادٍ موجود)؟</p>
        <AddVenueForm ownerId={user.id} />
      </div>
    </>
  );
}
