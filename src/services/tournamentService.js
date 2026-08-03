import { createClient } from "@/lib/supabase/server";

export async function getAllTournaments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("*, tournament_teams(count)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((t) => ({
    id: t.id,
    name: t.name,
    venue: t.venue_name,
    date: t.tournament_date,
    status: t.status,
    maxTeams: t.max_teams,
    teams: Array(t.tournament_teams[0]?.count ?? 0).fill(null), // بس عشان .length يشتغل في صفحة الاستعراض
  }));
}

export async function getTournamentById(id) {
  const supabase = await createClient();

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !tournament) return null;

  const { data: teams } = await supabase
    .from("tournament_teams")
    .select("*")
    .eq("tournament_id", id);

  const { data: matches } = await supabase
    .from("tournament_matches")
    .select("*")
    .eq("tournament_id", id)
    .order("round_index").order("match_index");

  const rounds = [...new Set((matches || []).map((m) => m.round))];

  return {
    id: tournament.id,
    name: tournament.name,
    organizerId: tournament.organizer_id,
    type: tournament.type,
    status: tournament.status,
    venue: tournament.venue_name,
    date: tournament.tournament_date,
    maxTeams: tournament.max_teams,
    entryFee: tournament.entry_fee,
    registrationDeadline: tournament.registration_deadline,
    startsAt: tournament.starts_at,
    firstMatchAt: tournament.first_match_at,
    champion: tournament.champion_team_name ? { teamName: tournament.champion_team_name } : null,
    topThree: [],
    gallery: [],
    news: [],
    organizerId: tournament.organizer_id,
    organizerEmail: tournament.organizer_email,
    teams: (teams || []).map((t) => ({
      id: t.id,
      name: t.name,
      captainId: t.captain_id,
      captainEmail: t.captain_email,
      captainName: t.captain_name,
      captainPhone: t.captain_phone,
      status: t.status,
      rating: 0,
    })),
    rounds,
    matches: (matches || []).map((m) => ({
      id: m.id,
      round: m.round,
      roundIndex: m.round_index,
      matchIndex: m.match_index,
      teamA: m.team_a_name,
      teamB: m.team_b_name,
      scoreA: m.score_a,
      scoreB: m.score_b,
      isDone: m.is_done,
      isLive: m.is_live,
      time: m.match_time,
    })),
  };
}