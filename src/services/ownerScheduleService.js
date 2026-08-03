import { createClient } from "@/lib/supabase/server";
import { buildNextSevenDays } from "./courtLogic";

export async function getOwnerScheduleData(ownerId) {
  const supabase = await createClient();

  const { data: venues } = await supabase.from("venues").select("id, name, courts(id, name, price_per_hour)").eq("owner_id", ownerId);

  const courts = (venues || []).flatMap((v) => v.courts.map((c) => ({ ...c, venueName: v.name })));
  const courtIds = courts.map((c) => c.id);

  const days = buildNextSevenDays();
  const fromDate = days[0]?.date;
  const toDate = days[days.length - 1]?.date;

  if (courtIds.length === 0) {
    return { courts: [], days, bookings: [], blockedSlots: [] };
  }

const { data: bookings } = await supabase
  .from("booking_slots")
  .select("court_id, date, time")
  .in("court_id", courtIds)
  .gte("date", fromDate)
  .lte("date", toDate)
  .in("status", ["confirmed", "completed"]);
  const { data: blockedSlots } = await supabase.from("blocked_slots").select("id, court_id, date, time, reason").in("court_id", courtIds).gte("date", fromDate).lte("date", toDate);

  return { courts, days, bookings: bookings || [], blockedSlots: blockedSlots || [] };
}
