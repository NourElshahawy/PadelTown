import { createClient } from "@/lib/supabase/server";
import { getOwnerBookings } from "@/services/ownerBookingsService";
import BookingsTable from "@/components/owner-dashboard/BookingsTable";

export default async function OwnerBookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const bookings = await getOwnerBookings(user.id);

  const { data: venues } = await supabase.from("venues").select("courts(id)").eq("owner_id", user.id);
  const courtIds = (venues || []).flatMap((v) => v.courts.map((c) => c.id));

  return (
    <>
      <h1 className="owner-page-title">الحجوزات</h1>
      <div className="owner-card">
        <BookingsTable initialBookings={bookings} courtIds={courtIds} />
      </div>
    </>
  );
}
