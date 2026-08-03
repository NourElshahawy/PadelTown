import { createClient } from "@/lib/supabase/server";

export async function getOwnerOverview(ownerId) {
  const supabase = await createClient();

  const { data: venues } = await supabase.from("venues").select("id, name, status, courts(id, name, price_per_hour)").eq("owner_id", ownerId);

  const courtIds = (venues || []).flatMap((v) => v.courts.map((c) => c.id));

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, court_id, price, status, payment_status, created_at, date")
    .in("court_id", courtIds.length ? courtIds : ["00000000-0000-0000-0000-000000000000"]);

  const activeBookings = (bookings || []).filter((b) => b.status !== "cancelled");

  // إيرادات فعلية اتقبضت بالفعل (payment_status = paid) — الرقم الحقيقي في جيب الأونر
  const collectedRevenue = activeBookings.filter((b) => b.payment_status === "paid").reduce((sum, b) => sum + Number(b.price), 0);

  // إجمالي قيمة الحجوزات المؤكدة كلها، شامل اللي لسه مدفوعتش — رقم متوقع مش فعلي
  const expectedRevenue = activeBookings.reduce((sum, b) => sum + Number(b.price), 0);

  const totalBookings = activeBookings.length;
  const totalCourts = courtIds.length;
  const totalVenues = venues?.length || 0;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const revenueByDay = last7Days.map((date) => ({
    date: new Date(date).toLocaleDateString("ar-EG", { weekday: "short" }),
    revenue: activeBookings.filter((b) => b.created_at?.startsWith(date) && b.payment_status === "paid").reduce((sum, b) => sum + Number(b.price), 0),
  }));

  // آخر 6 شهور، عشان يقدر يقارن الإيرادات شهر بشهر (على أساس تاريخ الحجز الفعلي)
  const now = new Date();
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const revenueByMonth = last6Months.map(({ year, month }) => {
    const monthBookings = activeBookings.filter((b) => {
      if (!b.date) return false;
      const bd = new Date(b.date);
      return bd.getFullYear() === year && bd.getMonth() === month;
    });
    const paidMonthBookings = monthBookings.filter((b) => b.payment_status === "paid");
    return {
      month: new Date(year, month, 1).toLocaleDateString("ar-EG", { month: "short", year: "2-digit" }),
      revenue: paidMonthBookings.reduce((sum, b) => sum + Number(b.price), 0),
      bookings: monthBookings.length,
    };
  });

  return { venues: venues || [], collectedRevenue, expectedRevenue, totalBookings, totalCourts, totalVenues, revenueByDay, revenueByMonth };
}
