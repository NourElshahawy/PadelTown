import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateTournamentWizard from "@/components/tournaments/CreateTournamentWizard";
import { getAllCourts } from "@/services/courtService";
import { getAllCourtsFlat } from "@/services/courtService";
import { createTournament } from "@/services/tournamentClient";

export const metadata = { title: "إنشاء بطولة جديدة — InstaPadel" };

export default async function CreateTournamentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const courts = (await getAllCourtsFlat()) ?? [];

  return <CreateTournamentWizard courts={courts} organizerId={user.id} />;
}