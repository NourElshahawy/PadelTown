import PartnerRequestsListing from "@/components/pages/find-partner/PartnerRequestsListing";
import { getAllPartnerRequests } from "@/services/partnerRequestService";
import { getAllCourts } from "@/services/courtService";

export const metadata = {
  title: "ابحث عن شريك بادل في المنصورة | Ace Town",
  description: "دور على لاعب بادل يكمل معاك الفريق في ملعب Ace Town بالمنصورة، تواصل مع لاعبين تانيين وانضم بسهولة.",
  keywords: ["ابحث عن لاعب بادل", "شريك بادل", "لاعبين بادل المنصورة", "Find Padel Partner", "Padel Players Mansoura"],
};

export default async function FindPartnerPage() {
  const [requests, courts] = await Promise.all([getAllPartnerRequests(), getAllCourts()]);
  return <PartnerRequestsListing requests={requests} courts={courts} />;
}