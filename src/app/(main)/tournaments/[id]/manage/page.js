import { notFound, redirect } from "next/navigation";
import TournamentManageDashboard from "@/components/tournaments/manage/TournamentManageDashboard";
import { getTournamentById } from "@/services/tournamentService";
import { createClient } from "@/lib/supabase/server";

export default async function ManageTournamentPage({ params }) {
  const { id } = await params;
  const tournament = await getTournamentById(id);
  if (!tournament) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const isOrganizer = tournament.organizerId === user.id;

  if (!isOrganizer) {
    return (
      <div className="not-authorized">
        <h2 style={{ color: "var(--white)" }}>غير مصرح لك</h2>
        <p>لوحة الإدارة دي متاحة بس لمنظم البطولة.</p>
      </div>
    );
  }

  return <TournamentManageDashboard tournament={tournament} />;
}