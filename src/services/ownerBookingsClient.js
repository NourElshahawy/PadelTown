"use client";
import { createClient } from "@/lib/supabase/client";

export async function updateBookingStatus(ids, status) {
  const supabase = createClient();
  const payload = status === "cancelled" ? { status, cancelled_at: new Date().toISOString() } : { status };
  const { error } = await supabase.from("bookings").update(payload).in("id", ids);
  if (error) throw error;
}

export async function confirmPaymentReceived(ids) {
  const supabase = createClient();
  const { error } = await supabase.from("bookings").update({ payment_status: "paid" }).in("id", ids);
  if (error) throw error;
}
