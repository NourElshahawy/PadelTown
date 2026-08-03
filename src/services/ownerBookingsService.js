import { createClient } from "@/lib/supabase/server";

export async function getOwnerBookings(ownerId) {
  const supabase = await createClient();

  const { data: venues } = await supabase.from("venues").select("courts(id)").eq("owner_id", ownerId);

  const courtIds = (venues || []).flatMap((v) => v.courts.map((c) => c.id));
  if (courtIds.length === 0) return [];

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("id, group_id, court_name, venue_name, date, time, price, status, payment_status, payment_claimed_at, payment_proof_url, created_at, user_id, profiles(name, phone, email)")
    .in("court_id", courtIds)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (bookings || []).map((b) => ({
    id: b.id,
    courtName: b.court_name,
    venueName: b.venue_name,
    date: b.date,
    time: b.time,
    price: b.price,
    status: b.status,
    paymentStatus: b.payment_status,
    paymentClaimedAt: b.payment_claimed_at,
    customerName: b.profiles?.name || "عميل",
    customerPhone: b.profiles?.phone,
    customerEmail: b.profiles?.email, // ← جديد
    groupId: b.group_id || b.id,
    paymentProofUrl: b.payment_proof_url,
    userId: b.user_id,
  }));
}