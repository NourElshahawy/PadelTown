import { getCourtDetails } from "@/services/courtService";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BookingConfirmationPage from "@/components/pages/confirmation/BookingConfirmationPage";

export const metadata = { title: "تأكيد الحجز — PadelTown" };

export default async function ConfirmationPage({ params, searchParams }) {
  const { slug } = await params;
  const court = await getCourtDetails(slug);
  if (!court) notFound();

  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let bookingRow = null;
  if (sp.bookingId) {
    const { data } = await supabase.from("bookings").select("id, group_id, status, payment_status, payment_claimed_at, reviewed").eq("id", sp.bookingId).maybeSingle();
    bookingRow = data;
  }

  const booking = {
    id: bookingRow?.id || sp.bookingId || null,
    groupId: bookingRow?.group_id || bookingRow?.id || sp.bookingId || null,
    displayId: bookingRow?.group_id ? `#IP-${bookingRow.group_id.slice(0, 8).toUpperCase()}` : bookingRow?.id ? `#IP-${bookingRow.id.slice(0, 8).toUpperCase()}` : "—",
    venueName: sp.court || court.name,
    venueImage: court.coverImage || court.image,
    location: court.location,
    locationLink: court.locationLink,
    subCourtName: sp.subCourt || "—",
    date: sp.date || "—",
    time: sp.time || "—",
    price: sp.price || court.pricePerHour,
    email: user?.email || "—",
    createdAt: "اليوم",
    status: bookingRow?.status || "confirmed",
    courtId: sp.subCourtId || null,
    reviewed: bookingRow?.reviewed || false,
    paymentStatus: bookingRow?.status !== "cancelled" ? bookingRow?.payment_status || "pending" : null,
    paymentClaimedAt: bookingRow?.payment_claimed_at || null,
    isPastBooking: false,
  };

  return <BookingConfirmationPage booking={booking} userId={user?.id} />;
}
