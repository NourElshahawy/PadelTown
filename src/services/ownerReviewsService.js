import { createClient } from "@/lib/supabase/server";

export async function getOwnerReviews(ownerId) {
  const supabase = await createClient();

  const { data: venues } = await supabase.from("venues").select("courts(id)").eq("owner_id", ownerId);
  const courtIds = (venues || []).flatMap((v) => v.courts.map((c) => c.id));
  if (courtIds.length === 0) return [];

  const { data: reviews, error } = await supabase
    .from("court_reviews")
    .select("id, rating, comment, created_at, courts(name, venues(name)), profiles(name, phone, email)")
    .in("court_id", courtIds)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (reviews || []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    venueName: r.courts?.venues?.name || "—",
    courtName: r.courts?.name || "—",
    customerName: r.profiles?.name || "عميل",
    customerPhone: r.profiles?.phone || "—",
    customerEmail: r.profiles?.email || "—",
    createdAt: r.created_at,
  }));
}
