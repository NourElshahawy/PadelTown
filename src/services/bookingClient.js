"use client";
import { createClient } from "@/lib/supabase/client";

export async function cancelBooking(groupId) {
  const supabase = createClient();
  const { error } = await supabase.from("bookings").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("group_id", groupId);
  if (error) throw error;
}

export async function markPaymentSent(groupId, file) {
  const supabase = createClient();

  if (!file) throw new Error("لازم ترفع صورة إثبات الدفع");

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${groupId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from("payment-proofs").getPublicUrl(path);

  const { error } = await supabase.from("bookings").update({ payment_claimed_at: new Date().toISOString(), payment_proof_url: urlData.publicUrl }).eq("group_id", groupId);
  if (error) throw error;
}
