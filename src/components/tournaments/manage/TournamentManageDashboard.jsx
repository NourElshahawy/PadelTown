"use client";
import { useState } from "react";
import { generateBracket } from "@/services/tournamentLogic";
import { startTournament, submitMatchResult } from "@/services/tournamentClient";
import StartTournamentButton from "./StartTournamentButton";
import TeamsManageList from "./TeamsManageList";
import MatchScoreForm from "./MatchScoreForm";
// import "@/styles/pages/tournament-manage.css";

export default function TournamentManageDashboard({ tournament: initialTournament }) {
  const [tournament, setTournament] = useState(initialTournament);

  const handleStart = async () => {
    const { rounds, matches } = generateBracket(tournament.teams);
    const savedMatches = await startTournament(tournament.id, rounds, matches);

    // نحوّل شكل الصفوف الراجعة من Supabase لنفس الشكل اللي الواجهة متوقعاه
    const mappedMatches = savedMatches.map((m) => ({
      id: m.id, // UUID حقيقي دلوقتي
      round: m.round,
      roundIndex: m.round_index,
      matchIndex: m.match_index,
      teamA: m.team_a_name,
      teamB: m.team_b_name,
      scoreA: m.score_a,
      scoreB: m.score_b,
      isDone: m.is_done,
    }));

    setTournament((t) => ({ ...t, rounds, matches: mappedMatches, status: "ready" }));

    fetch("/api/notifications/tournament-started", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipients: tournament.teams.map((t) => ({ email: t.captainEmail, captainName: t.captainName })),
        tournamentName: tournament.name,
        venueName: tournament.venue,
      }),
    }).catch(() => {});
  };

  const handleScoreSubmit = async (matchId, scoreA, scoreB) => {
    const match = tournament.matches.find((m) => m.id === matchId);
    const winnerName = scoreA > scoreB ? match.teamA : match.teamB;
    const isFinal = match.round === tournament.rounds[tournament.rounds.length - 1];

    let nextMatch = null;
    let nextSlot = null;
    if (!isFinal) {
      const nextRoundIndex = match.roundIndex + 1;
      const nextMatchIndex = Math.floor(match.matchIndex / 2);
      nextMatch = tournament.matches.find((m) => m.roundIndex === nextRoundIndex && m.matchIndex === nextMatchIndex);
      nextSlot = match.matchIndex % 2 === 0 ? "teamA" : "teamB";
    }

    await submitMatchResult(
      matchId,
      scoreA,
      scoreB,
      nextMatch?.id || null, // ← UUID حقيقي دلوقتي، مش نص متركّب
      nextSlot,
      winnerName,
      isFinal,
      tournament.id,
    );

    setTournament((t) => {
      const updatedMatches = t.matches.map((m) => (m.id === matchId ? { ...m, scoreA, scoreB, isDone: true } : m));
      const finalMatches = nextMatch ? updatedMatches.map((m) => (m.id === nextMatch.id ? { ...m, [nextSlot]: winnerName } : m)) : updatedMatches;

      return {
        ...t,
        matches: finalMatches,
        status: isFinal ? "completed" : "live",
        champion: isFinal ? { teamName: winnerName } : t.champion,
      };
    });
  };

  const roundsInOrder = [...new Set(tournament.matches.map((m) => m.round))];

  return (
    <div className="manage-page" dir="rtl">
      <h1 style={{ color: "var(--white)", marginBottom: 24 }}>إدارة {tournament.name}</h1>

      <TeamsManageList teams={tournament.teams} />

      {tournament.status === "registration" && <StartTournamentButton tournament={tournament} onStart={handleStart} />}

      {tournament.matches.length > 0 && (
        <div className="manage-section">
          <h3>🎾 المباريات</h3>
          {roundsInOrder.map((round) => (
            <div key={round} style={{ marginBottom: 20 }}>
              <p style={{ color: "var(--text-faint)", fontSize: ".8rem", marginBottom: 10 }}>{round}</p>
              {tournament.matches
                .filter((m) => m.round === round)
                .map((m) => (
                  <MatchScoreForm key={m.id} match={m} onSubmit={handleScoreSubmit} />
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
