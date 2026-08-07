import TournamentDashboard from "@/components/tournaments/dashboard/TournamentDashboard";
import { getTournamentById } from "@/services/tournamentService";
import { getCurrentUser } from "@/services/authService";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const tournament = await getTournamentById(id);
  return {
    title: tournament ? `${tournament.name} — InstaPadel` : "بطولة غير موجودة",
  };
}

export default async function TournamentPage({ params }) {
  const { id } = await params;
  const tournament = await getTournamentById(id);
  if (!tournament) notFound();

  const supabase = await createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
const { data: profile } = user ? await supabase.from("profiles").select("phone").eq("id", user.id).single() : { data: null };

return (
  <TournamentDashboard
    tournament={tournament}
    currentUser={{
      id: user?.id,
      phone: profile?.phone || null,
      isOrganizer: tournament.organizerId === user?.id,
      isRegistered: tournament.teams?.some((t) => t.captainId === user?.id),
    }}
    onManage={`/tournaments/${id}/manage`}
    onCreateNew="/tournaments/create"
  />
);
}
