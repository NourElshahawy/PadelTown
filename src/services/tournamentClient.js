"use client";
import { createClient } from "@/lib/supabase/client";
import { insertNotification, insertNotifications } from "@/services/notificationService";

export async function createTournament(data, organizerId) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: row, error } = await supabase
    .from("tournaments")
    .insert({
      organizer_id: organizerId,
      organizer_email: user?.email || null,
      name: data.name,
      type: data.type,
      venue_name: data.courtName,
      court_id: data.courtId,
      tournament_date: data.startDate,
      max_teams: data.teamsCount,
      entry_fee: data.entryFee || null,
      registration_deadline: data.registrationDeadline || null,
      starts_at: data.startDate ? new Date(data.startDate).toISOString() : null,
    })
    .select()
    .single();

  if (error) throw error;

  const { data: courtRow } = await supabase.from("courts").select("images, venue_id").eq("id", data.courtId).maybeSingle();

  let imageUrl = courtRow?.images?.[0] || null;
  if (!imageUrl && courtRow?.venue_id) {
    const { data: siblings } = await supabase.from("courts").select("images").eq("venue_id", courtRow.venue_id);
    imageUrl = siblings?.find((c) => c.images?.length > 0)?.images?.[0] || null;
  }

  await supabase.from("news").insert({
    source_type: "tournament",
    source_id: row.id,
    author_id: organizerId,
    title: `التسجيل مفتوح: بطولة ${row.name}`,
    body: `بطولة ${row.type === "double" ? "زوجي" : "فردي"} جديدة في ${row.venue_name}، محتاجة ${row.max_teams} فرق. سجّل فريقك الآن.`,
    image_url: imageUrl,
    category: "tournament",
    status: "published",
  });

  return row;
}
export async function joinTournament(tournamentId, teamData, captainId) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // نتأكد الأول إن فيه مكان فاضي قبل أي إضافة
  const { data: tournament, error: tError } = await supabase.from("tournaments").select("name, organizer_id, max_teams").eq("id", tournamentId).single();
  if (tError) throw tError;

  const { count: currentCount } = await supabase.from("tournament_teams").select("*", { count: "exact", head: true }).eq("tournament_id", tournamentId);

  if (tournament.max_teams && (currentCount || 0) >= tournament.max_teams) {
    const err = new Error("البطولة اكتملت بالفعل، مفيش أماكن فاضية");
    err.code = "TOURNAMENT_FULL";
    throw err;
  }

  const { data, error } = await supabase
    .from("tournament_teams")
    .insert({
      tournament_id: tournamentId,
      captain_id: captainId,
      captain_email: user?.email || null,
      name: teamData.partnerName ? `${teamData.captainName} & ${teamData.partnerName}` : teamData.captainName,
      captain_name: teamData.captainName,
      captain_phone: teamData.captainPhone,
      partner_name: teamData.partnerName || null,
    })
    .select()
    .single();

  if (error) throw error;

  if (tournament?.organizer_id) {
    await insertNotification(supabase, {
      userId: tournament.organizer_id,
      type: "tournament_team_joined",
      title: `فريق جديد سجّل في بطولة ${tournament.name}`,
      body: `فريق "${data.name}" سجّل في البطولة`,
      link: `/tournaments/${tournamentId}`,
    });

    // لو اكتمل عدد الفرق، نبلّغ المنظم وكل الكباتن
    const newCount = (currentCount || 0) + 1;

    if (tournament.max_teams && newCount >= tournament.max_teams) {
      const { data: teams } = await supabase.from("tournament_teams").select("captain_id").eq("tournament_id", tournamentId);

      const recipientIds = [tournament.organizer_id, ...(teams || []).map((t) => t.captain_id)];

      await insertNotifications(supabase, recipientIds, {
        type: "tournament_full",
        title: "اكتمل فريق البطولة! 🏆",
        body: `اكتمل عدد الفرق في بطولة ${tournament.name}، البطولة جاهزة تبدأ`,
        link: `/tournaments/${tournamentId}`,
      });
    }
  }

  return data;
}

export async function startTournament(tournamentId, rounds, matches) {
  const supabase = createClient();

  const rows = matches.map((m) => ({
    tournament_id: tournamentId,
    round: m.round,
    round_index: m.roundIndex,
    match_index: m.matchIndex,
    team_a_name: m.teamA,
    team_b_name: m.teamB,
  }));

  const { data: insertedMatches, error: matchesError } = await supabase.from("tournament_matches").insert(rows).select();

  if (matchesError) throw matchesError;

  const { error: updateError } = await supabase.from("tournaments").update({ status: "ready", first_match_at: new Date().toISOString() }).eq("id", tournamentId);
  if (updateError) throw updateError;

  // نحدّث الخبر عشان يعكس إن البطولة بدأت
  const { data: tournament } = await supabase.from("tournaments").select("name, venue_name").eq("id", tournamentId).single();

  if (tournament) {
    await supabase
      .from("news")
      .update({
        title: `⚡ بدأت بطولة ${tournament.name}`,
        body: `انطلقت منافسات بطولة ${tournament.name} في ${tournament.venue_name}. تابع النتائج أول بأول.`,
      })
      .eq("source_type", "tournament")
      .eq("source_id", tournamentId);

    // إشعار لكل كباتن الفرق إن البطولة بدأت
    const { data: teams } = await supabase.from("tournament_teams").select("captain_id").eq("tournament_id", tournamentId);
    await insertNotifications(
      supabase,
      (teams || []).map((t) => t.captain_id),
      {
        type: "tournament_started",
        title: `بدأت بطولة ${tournament.name} ⚡`,
        body: `انطلقت المنافسات في ${tournament.venue_name}`,
        link: `/tournaments/${tournamentId}`,
      },
    );
  }

  return insertedMatches;
}

export async function submitMatchResult(matchId, scoreA, scoreB, nextMatchId, nextSlot, winnerName, isFinal, tournamentId) {
  const supabase = createClient();

  const { error: matchError } = await supabase.from("tournament_matches").update({ score_a: scoreA, score_b: scoreB, is_done: true }).eq("id", matchId);
  if (matchError) throw matchError;

  if (nextMatchId) {
    const field = nextSlot === "teamA" ? "team_a_name" : "team_b_name";
    await supabase
      .from("tournament_matches")
      .update({ [field]: winnerName })
      .eq("id", nextMatchId);
  }

  await supabase
    .from("tournaments")
    .update({ status: isFinal ? "completed" : "live", champion_team_name: isFinal ? winnerName : null })
    .eq("id", tournamentId);

  if (isFinal) {
    const { data: tournament } = await supabase.from("tournaments").select("name, venue_name, organizer_id").eq("id", tournamentId).single();

    if (tournament) {
      // ندوّر على الخبر الموجود بالفعل لنفس البطولة، ونحدّثه بدل ما نعمل جديد
      const { data: existingNews } = await supabase.from("news").select("id").eq("source_type", "tournament").eq("source_id", tournamentId).maybeSingle();

      const updatedFields = {
        title: `🏆 ${winnerName} بطل بطولة ${tournament.name}`,
        body: `انتهت بطولة ${tournament.name} في ${tournament.venue_name}، وتوّج ${winnerName} بلقب البطولة بعد منافسة قوية.`,
      };

      if (existingNews) {
        await supabase.from("news").update(updatedFields).eq("id", existingNews.id);
      } else {
        await supabase.from("news").insert({
          source_type: "tournament",
          source_id: tournamentId,
          author_id: tournament.organizer_id,
          category: "tournament",
          status: "published",
          ...updatedFields,
        });
      }

      // إشعار للمنظم وكل الكباتن إن البطولة خلصت
      const { data: teams } = await supabase.from("tournament_teams").select("captain_id, name").eq("tournament_id", tournamentId);
      const recipientIds = [tournament.organizer_id, ...(teams || []).map((t) => t.captain_id)];

      await insertNotifications(supabase, recipientIds, {
        type: "tournament_finished",
        title: `🏆 انتهت بطولة ${tournament.name}`,
        body: `${winnerName} فاز بلقب البطولة`,
        link: `/tournaments/${tournamentId}`,
      });
    }
  }
}
