"use client";
import { createClient } from "@/lib/supabase/client";

export async function createBookingWithDeposit({ rows, proofFile }) {
  const supabase = createClient();

  if (!proofFile) throw new Error("لازم صورة إثبات الدفع");

  const groupId = rows[0]?.group_id;
  const ext = proofFile.name.split(".").pop() || "jpg";
  const path = `${groupId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(path, proofFile, { upsert: true });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from("payment-proofs").getPublicUrl(path);

  const rowsWithProof = rows.map((r) => ({
    ...r,
    payment_claimed_at: new Date().toISOString(),
    payment_proof_url: urlData.publicUrl,
  }));

  const { data, error } = await supabase.from("bookings").insert(rowsWithProof).select();
  if (error) throw error;
  return data;
}
