import { createClient } from "@/lib/supabase/server";

export async function getOwnerCustomers(ownerId) {
  const supabase = await createClient();

  const { data: venues } = await supabase.from("venues").select("courts(id)").eq("owner_id", ownerId);
  const courtIds = (venues || []).flatMap((v) => v.courts.map((c) => c.id));
  if (courtIds.length === 0) return [];

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("user_id, court_name, price, status, created_at, profiles(name, phone, email)")
    .in("court_id", courtIds)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const byCustomer = {};
  (bookings || []).forEach((b) => {
    if (!b.user_id) return;
    if (!byCustomer[b.user_id]) {
      byCustomer[b.user_id] = {
        id: b.user_id,
        name: b.profiles?.name || "عميل",
        phone: b.profiles?.phone || "—",
        email: b.profiles?.email || "—",
        totalBookings: 0,
        totalSpent: 0,
        lastBookingDate: b.created_at,
        courtCounts: {},
      };
    }
    const c = byCustomer[b.user_id];
    c.totalBookings += 1;
    c.totalSpent += Number(b.price) || 0;
    if (new Date(b.created_at) > new Date(c.lastBookingDate)) c.lastBookingDate = b.created_at;
    c.courtCounts[b.court_name] = (c.courtCounts[b.court_name] || 0) + 1;
  });

  return Object.values(byCustomer)
    .map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      totalBookings: c.totalBookings,
      totalSpent: c.totalSpent,
      lastBookingDate: c.lastBookingDate,
      favoriteCourt: Object.entries(c.courtCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—",
      isReturning: c.totalBookings >= 20,
    }))
    .sort((a, b) => b.totalBookings - a.totalBookings);
}
