import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { formatSlotRanges } from "@/services/courtLogic";
import BookingConfirmationPage from "@/components/pages/confirmation/BookingConfirmationPage";

export const metadata = { title: "فاتورة الحجز — PadelTown" };

function timeToMinutes(label) {
  const match = label.trim().match(/^(\d{1,2}):(\d{2})\s*(ص|م)$/);
  if (!match) return 0;
  let [, h, m, period] = match;
  h = parseInt(h, 10);
  m = parseInt(m, 10);
  if (period === "ص") {
    if (h === 12) h = 0;
  } else if (h !== 12) {
    h += 12;
  }
  return h * 60 + m;
}

export default async function BookingInvoicePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: baseRow } = await supabase.from("bookings").select("id, user_id, group_id, court_id").eq("id", id).maybeSingle();

  if (!baseRow) notFound();
  if (baseRow.user_id !== user.id) notFound();

  const groupKey = baseRow.group_id || baseRow.id;

  const { data: groupRows } = await supabase
    .from("bookings")
    .select("id, venue_name, court_name, date, time, price, status, payment_status, payment_claimed_at, reviewed, created_at")
    .eq(baseRow.group_id ? "group_id" : "id", groupKey);

  const rows = groupRows && groupRows.length ? groupRows : [baseRow];
  const sortKey = (r) => `${r.date}_${String(timeToMinutes(r.time.split(" الي ")[0])).padStart(4, "0")}`;
  const sorted = [...rows].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  // حالة المجموعة كلها: لو كل الصفوف بنفس الحالة نعرضها عادي، لو مختلطة (بعضها اتلغى وبعضها لأ) نعتبرها "مؤكد" لأن فيها ساعات لسه شغالة
  const statuses = new Set(sorted.map((r) => r.status));
  const overallStatus = statuses.size === 1 ? [...statuses][0] : "confirmed";
  const isFullyCancelled = overallStatus === "cancelled";

  // الأسعار والدفع بيتحسبوا بس على الصفوف اللي لسه شغالة (مش ملغية)
  const activeRows = sorted.filter((r) => r.status !== "cancelled");
  const paymentBasisRows = activeRows.length ? activeRows : sorted;
  const totalPrice = activeRows.reduce((sum, r) => sum + Number(r.price), 0) || sorted.reduce((sum, r) => sum + Number(r.price), 0);


  const isPastBooking = new Date(last.date) < new Date(new Date().toISOString().split("T")[0]);
  const { data: courtRow } = await supabase.from("courts").select("images, venue_id, venues(address)").eq("id", baseRow.court_id).maybeSingle();

  const booking = {
    id: first.id,
    groupId: groupKey,
    displayId: `#IP-${groupKey.slice(0, 8).toUpperCase()}`,
    venueName: first.venue_name,
    venueImage: courtRow?.images?.[0] || "/assets/imgs/courts-bg.png",
    location: courtRow?.venues?.address || "—",
    locationLink: null,
    subCourtName: first.court_name,
    date: first.date === last.date ? first.date : `${first.date} → ${last.date}`,
    time: formatSlotRanges(sorted.map((r) => ({ date: r.date, start: r.time.split(" الي ")[0], end: r.time.split(" الي ")[1] }))),
    price: totalPrice,
    email: user.email,
    createdAt: new Date(first.created_at).toLocaleDateString("ar-EG"),
    status: overallStatus,
    courtId: baseRow.court_id,
    reviewed: first.reviewed || false,
    isPastBooking,
    paymentStatus: !isFullyCancelled ? paymentBasisRows[0]?.payment_status || "pending" : null,
    paymentClaimedAt: !isFullyCancelled ? paymentBasisRows[0]?.payment_claimed_at || null : null,
  };

  return <BookingConfirmationPage booking={booking} userId={user.id} />;
}
