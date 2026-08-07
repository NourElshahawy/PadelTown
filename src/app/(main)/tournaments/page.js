import Link from "next/link";
import { getAllTournaments } from "@/services/tournamentService";
import ListingHero from "@/components/shared/ListingHero";
import TournamentsListing from "@/components/tournaments/TournamentsListing";


export const metadata = {
  title: "بطولات بادل المنصورة | InstaPadel",
  description: "اكتشف بطولات ومسابقات البادل في المنصورة ومصر، سجّل فريقك أو تابع نتائج البطولات الجارية والمنتهية.",
  keywords: ["بطولات بادل المنصورة", "بطولات البادل في مصر", "مسابقات بادل", "Padel Tournaments Mansoura"],
};

const STATUS_LABELS = {
  registration: "التسجيل مفتوح",
  ready: "التسجيل اكتمل",
  live: "جارية الآن",
  completed: "انتهت",
};

export default async function TournamentsPage() {
  const tournaments = await getAllTournaments();
 
  return <TournamentsListing tournaments={tournaments} />;
}
 
