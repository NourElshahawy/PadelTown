import { createClient } from "@/lib/supabase/server";
import VenuesManager from "@/components/owner-dashboard/VenuesManager";

export default async function OwnerVenuesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: venues } = await supabase.from("venues").select("id, name, address, status, courts(id, name, type, sport_type, price_per_hour, images)").eq("owner_id", user.id);

  return (
    <>
      <h1 className="owner-page-title">ملاعبي</h1>

      <VenuesManager venues={venues || []} ownerId={user.id} />
    </>
  );
}
