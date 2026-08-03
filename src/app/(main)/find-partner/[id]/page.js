import { notFound } from "next/navigation";
import PartnerRequestDetail from "@/components/pages/find-partner/PartnerRequestDetail";
import { getPartnerRequestById } from "@/services/partnerRequestService";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const request = await getPartnerRequestById(id);
  return { title: request ? `${request.courtName} — طلب شريك` : "طلب غير موجود" };
}

export default async function PartnerRequestPage({ params }) {
  const { id } = await params;
  const request = await getPartnerRequestById(id);
  if (!request) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <PartnerRequestDetail initialRequest={request} currentUserId={user?.id} />;
}