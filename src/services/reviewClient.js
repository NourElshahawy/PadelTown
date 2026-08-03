"use client";
import { createClient } from "@/lib/supabase/client";

export async function submitCourtReview(bookingId, courtId, userId, rating, comment, siteFeedback = null) {
  const supabase = createClient();

  const { error: insertError } = await supabase.from("court_reviews").insert({
    booking_id: bookingId,
    court_id: courtId,
    user_id: userId,
    rating,
    comment: comment || null,
    site_feedback: siteFeedback,
  });
  if (insertError) throw insertError;

  const { error: updateError } = await supabase.from("bookings").update({ reviewed: true }).eq("id", bookingId);
  if (updateError) throw updateError;
}
