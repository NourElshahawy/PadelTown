"use client";
import { createClient } from "@/lib/supabase/client";

// نفس bucket إثبات دفع الحجوزات، بس تحت مسار subscriptions/ منفصل
export async function submitSubscriptionPayment(ownerId, proofFile, paymentMethod) {
  const supabase = createClient();

  const ext = proofFile.name.split(".").pop() || "jpg";
  const path = `subscriptions/${ownerId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(path, proofFile, { upsert: true });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from("payment-proofs").getPublicUrl(path);

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      owner_id: ownerId,
      status: "pending_payment",
      payment_method: paymentMethod,
      payment_proof_url: urlData.publicUrl,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
