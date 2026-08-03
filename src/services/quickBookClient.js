"use client";
import { createClient } from "@/lib/supabase/client";

export async function getAvailableCourtsForSlots(slots) {
  const supabase = createClient();

  const { data: venues, error } = await supabase.from("venues").select("id, name, address, courts(id, name, price_per_hour, images)").eq("status", "approved");
  if (error) throw error;

  const allCourts = venues.flatMap((v) =>
    (v.courts || []).map((c) => ({
      courtId: c.id,
      courtName: c.name,
      venueName: v.name,
      venueId: v.id,
      pricePerHour: c.price_per_hour,
      image: c.images?.[0] || "/assets/imgs/courts-bg.png",
    })),
  );

  if (allCourts.length === 0) return [];
  const courtIds = allCourts.map((c) => c.courtId);
  const dates = [...new Set(slots.map((s) => s.date))];

  const [{ data: booked }, { data: blocked }] = await Promise.all([
    supabase.from("booking_slots").select("court_id, date, time").in("court_id", courtIds).in("date", dates).in("status", ["confirmed", "completed"]),
    supabase.from("blocked_slots").select("court_id, date, time").in("court_id", courtIds).in("date", dates),
  ]);

  const bookedSet = new Set((booked || []).map((b) => `${b.court_id}_${b.date}_${b.time}`));
  const blockedSet = new Set((blocked || []).map((b) => `${b.court_id}_${b.date}_${b.time}`));

  const unavailableCourtIds = new Set();
  courtIds.forEach((courtId) => {
    const isTaken = slots.some((s) => {
      const fullTime = `${s.start} الي ${s.end}`;
      return bookedSet.has(`${courtId}_${s.date}_${fullTime}`) || blockedSet.has(`${courtId}_${s.date}_${s.start}`);
    });
    if (isTaken) unavailableCourtIds.add(courtId);
  });

  return allCourts
    .filter((c) => !unavailableCourtIds.has(c.courtId))
    .map((c) => ({
      ...c,
      slots,
      totalPrice: c.pricePerHour * slots.length,
    }));
}

export async function bookSlotsNow({ courtId, courtName, venueName, slots, pricePerHour }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const err = new Error("NOT_LOGGED_IN");
    err.code = "NOT_LOGGED_IN";
    throw err;
  }

  const groupId = crypto.randomUUID();
  const rows = slots.map((s) => ({
    user_id: user.id,
    court_id: courtId,
    venue_name: venueName,
    court_name: courtName,
    date: s.date,
    time: `${s.start} الي ${s.end}`,
    price: pricePerHour,
    status: "confirmed",
    group_id: groupId,
  }));

  const { data, error } = await supabase.from("bookings").insert(rows).select();
  if (error) throw error;
  return data[0];
}
