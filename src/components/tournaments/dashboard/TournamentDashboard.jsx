"use client";

import { useMemo, useState } from "react";
import { computeTimeline } from "@/services/tournamentLogic";
import Hero from "./Hero";
import Countdown from "./Countdown";
import RegistrationProgress from "./RegistrationProgress";
import TeamsGrid from "./TeamsGrid";
import StatusTimeline from "./StatusTimeline";
import MatchesList from "./MatchesList";
import Bracket from "./Bracket";
import StatsGrid from "./StatsGrid";
import NewsFeed from "./NewsFeed";
import FloatingActionButton from "./FloatingActionButton";
import JoinTeamSheet from "../JoinTeamSheet";
import { joinTournament } from "@/services/tournamentClient";
import { createClient } from "@/lib/supabase/client";
// import "@/styles/pages/tournament-dashboard.css";
// import "@/styles/pages/booking.css";
import ParallaxBg from "@/components/ui/ParallaxBg";

function resolveStage(tournament) {
  if (tournament.status === "completed") return "completed";
  if (tournament.status === "live") return "live";
  if (tournament.status === "ready") return "ready";
  if (tournament.teams?.length >= tournament.maxTeams) return "ready";
  return "registration";
}

export default function TournamentDashboard({ tournament: initialTournament, currentUser = {}, onManage, onCreateNew }) {
  const [tournament, setTournament] = useState(initialTournament);
  const [joinOpen, setJoinOpen] = useState(false);

  const stage = useMemo(() => resolveStage(tournament), [tournament]);

  const handleJoinSubmit = async (teamData) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let newTeamRow;
    try {
      newTeamRow = await joinTournament(tournament.id, { ...teamData, captainPhone: currentUser.phone }, user.id);
    } catch (err) {
      if (err.code === "TOURNAMENT_FULL") {
        alert("للأسف البطولة اكتملت، مفيش أماكن فاضية.");
      } else {
        alert("حصل خطأ أثناء التسجيل في البطولة، حاول تاني");
      }
      return;
    }

    const updatedTeams = [
      ...tournament.teams,
      {
        id: newTeamRow.id,
        name: newTeamRow.name,
        captainId: user.id,
        captainName: teamData.captainName,
        captainPhone: teamData.captainPhone,
        status: "confirmed",
        rating: 0,
      },
    ];

    setTournament((t) => ({ ...t, teams: updatedTeams }));
    setJoinOpen(false);

    if (updatedTeams.length === tournament.maxTeams && tournament.organizerEmail) {
      fetch("/api/notifications/tournament-full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: tournament.organizerEmail,
          tournamentName: tournament.name,
          venueName: tournament.venue,
          maxTeams: tournament.maxTeams,
        }),
      }).catch(() => {});
    }
  };

  const fab = useMemo(() => {
    if (stage === "completed") return { label: "أنشئ بطولة جديدة", href: onCreateNew, tone: "gold" };
    if (currentUser.isOrganizer) return { label: "إدارة البطولة", href: onManage, tone: "court" };
    if (currentUser.isRegistered) return { label: "أنت مشترك بالفعل", tone: "muted" };
    if (stage === "registration") return { label: "اشترك الآن", action: () => setJoinOpen(true), tone: "court" };
    return null;
  }, [stage, currentUser, onManage, onCreateNew]);

  return (
    <div className={`td-page td-page--${stage}`} dir="rtl">
      <Hero tournament={tournament} stage={stage} />

      {stage === "registration" && (
        <>
          <RegistrationProgress current={tournament.teams?.length ?? 0} max={tournament.maxTeams} />
          {tournament.startsAt && <Countdown target={tournament.startsAt} label="يبدأ بعد" />}
          <TeamsGrid teams={tournament.teams} />
        </>
      )}

      {stage === "ready" && (
        <>
          {tournament.firstMatchAt && <Countdown target={tournament.firstMatchAt} label="أول مباراة بعد" />}
          <Bracket rounds={tournament.rounds} matches={tournament.matches} />
          <MatchesList matches={tournament.matches} stage={stage} />
        </>
      )}

      {stage === "live" && (
        <>
          <MatchesList matches={tournament.matches} stage={stage} />
          <Bracket rounds={tournament.rounds} matches={tournament.matches} />
        </>
      )}

      {stage === "completed" && (
        <>
          <MatchesList matches={tournament.matches} stage={stage} />
          {tournament.gallery?.length > 0 && (
            <section className="td-gallery">
              <h3 className="td-section-title">📸 صور البطولة</h3>
              <div className="td-gallery-grid">
                {tournament.gallery.map((src, i) => (
                  <img key={i} src={src} alt="" className="td-gallery-img" />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {stage !== "completed" && <StatusTimeline steps={computeTimeline(tournament)} />}
      <StatsGrid tournament={tournament} />
      {tournament.news?.length > 0 && <NewsFeed items={tournament.news} />}

      {fab && <FloatingActionButton label={fab.label} href={fab.href} onClick={fab.action} tone={fab.tone} disabled={!fab.action && !fab.href} />}

      {joinOpen && <JoinTeamSheet tournament={tournament} phone={currentUser.phone} onClose={() => setJoinOpen(false)} onSubmit={handleJoinSubmit} />}
    </div>
  );
}
