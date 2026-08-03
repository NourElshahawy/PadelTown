import { createClient } from "@/lib/supabase/server";

export async function getAllPartnerRequests() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("partner_requests")
    .select(`
      *,
      host:profiles!partner_requests_host_id_fkey (name, phone),
      partner_request_joins (id, status, player_id, profiles (name, phone, email))
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapRequest);
}

export async function getPartnerRequestById(id) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("partner_requests")
    .select(
      `
    *,
    host:profiles!partner_requests_host_id_fkey (name, phone, avatar_url),
    partner_request_joins (id, status, player_id, profiles (name, phone, email, avatar_url))
  `,
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return mapRequest(data);
}

function mapRequest(r) {
  return {
    id: r.id,
    hostId: r.host_id,
    hostName: r.host?.name || "مستخدم",
    hostLevel: r.level,
    hostPhone: r.host?.phone,
    courtId: r.court_id,
    courtName: r.court_name,
    date: r.request_date,
    dateLabel: new Date(r.request_date).toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" }),
    time: r.time_label,
    level: r.level,
    playersNeeded: r.players_needed,
    notes: r.notes,
    status: r.status,
    playersJoined: (r.partner_request_joins || []).map((j) => ({
      id: j.player_id,
      joinId: j.id,
      name: j.profiles?.name || "مستخدم",
      phone: j.profiles?.phone,
      avatarUrl: j.profiles?.avatar_url,
      email: j.profiles?.email, // ← هنا مكانه الصح، جوه الـ map بتاعة playersJoined
      status: j.status,
    })),
  };
}