import { createClient } from "@/lib/supabase/server";

export async function getMyTournaments(userId) {
  const supabase = await createClient();

  // البطولات اللي هو منظمها
  const { data: organized } = await supabase.from("tournaments").select("id, name, status, tournament_date, venue_name, champion_team_name").eq("organizer_id", userId);

  // البطولات اللي اشترك فيها كفريق
  const { data: joinedTeams } = await supabase
    .from("tournament_teams")
    .select("tournament_id, name, tournaments (id, name, status, tournament_date, venue_name, champion_team_name)")
    .eq("captain_id", userId);

  const organizedList = (organized || []).map((t) => ({
    id: t.id,
    name: t.name,
    status: t.status,
    date: t.tournament_date,
    venue: t.venue_name,
    role: "organizer",
    champion: t.champion_team_name,
  }));

  const joinedList = (joinedTeams || [])
    .filter((jt) => jt.tournaments) // احتياط لو البطولة اتمسحت
    .map((jt) => ({
      id: jt.tournaments.id,
      name: jt.tournaments.name,
      status: jt.tournaments.status,
      date: jt.tournaments.tournament_date,
      venue: jt.tournaments.venue_name,
      role: "player",
      teamName: jt.name,
      champion: jt.tournaments.champion_team_name,
    }));

  // دمج القايمتين ومنع التكرار لو هو منظم ومشترك في نفس البطولة (نادر بس ممكن)
  const merged = [...organizedList];
  joinedList.forEach((j) => {
    if (!merged.some((m) => m.id === j.id)) merged.push(j);
  });

  return merged.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getMyPartnerRequests(userId) {
  const supabase = await createClient();

  // الطلبات اللي هو صاحبها
  const { data: hosted } = await supabase.from("partner_requests").select("id, court_name, request_date, time_label, level, status, players_needed").eq("host_id", userId);

  // الطلبات اللي اشترك فيها
  const { data: joined } = await supabase
    .from("partner_request_joins")
    .select("status, partner_requests (id, court_name, request_date, time_label, level, status, host_id, profiles!partner_requests_host_id_fkey(name))")
    .eq("player_id", userId);

  const hostedList = (hosted || []).map((r) => ({
    id: r.id,
    courtName: r.court_name,
    date: r.request_date,
    time: r.time_label,
    level: r.level,
    status: r.status,
    role: "host",
  }));

  const joinedList = (joined || [])
    .filter((j) => j.partner_requests)
    .map((j) => ({
      id: j.partner_requests.id,
      courtName: j.partner_requests.court_name,
      date: j.partner_requests.request_date,
      time: j.partner_requests.time_label,
      level: j.partner_requests.level,
      status: j.status,
      role: "player",
      hostName: j.partner_requests.profiles?.name,
    }));

  return [...hostedList, ...joinedList].sort((a, b) => new Date(b.date) - new Date(a.date));
}
