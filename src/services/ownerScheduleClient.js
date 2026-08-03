"use client";
import { createClient } from "@/lib/supabase/client";

// بيقفل ساعة أو أكتر يدويًا (صيانة، مناسبة خاصة...) على ملعب معيّن في يوم معيّن
export async function blockSlots(courtId, date, times, reason) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rows = times.map((time) => ({
    court_id: courtId,
    date,
    time,
    reason: reason || null,
    created_by: user?.id || null,
  }));

  const { data, error } = await supabase.from("blocked_slots").insert(rows).select();
  if (error) throw error;
  return data;
}

// بيفك القفل عن ساعة كانت مقفولة يدويًا
export async function unblockSlot(blockedSlotId) {
  const supabase = createClient();
  const { error } = await supabase.from("blocked_slots").delete().eq("id", blockedSlotId);
  if (error) throw error;
}
