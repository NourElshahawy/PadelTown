import { notFound } from "next/navigation";
import BookingPage from "@/components/pages/booking/BookingPage";
import { getCourtDetails } from "@/services/courtService";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const court = await getCourtDetails(slug);
  return { title: court ? `حجز ${court.name} — PadelTown` : "ملعب غير موجود — PadelTown" };
}

export default async function CourtBookingPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const court = await getCourtDetails(slug);
  if (!court) notFound();

  return <BookingPage court={court} preselectedSubCourtId={sp.subCourtId || null} />;
}
