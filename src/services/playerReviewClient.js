"use client";
import { createClient } from "@/lib/supabase/client";

export async function submitPlayerReview(partnerRequestId, reviewerId, reviewedId, rating, comment) {
  const supabase = createClient();
  const { error } = await supabase.from("player_reviews").insert({
    partner_request_id: partnerRequestId,
    reviewer_id: reviewerId,
    reviewed_id: reviewedId,
    rating,
    comment: comment || null,
  });
  if (error) throw error;

  // نحدّث متوسط تقييم اليوزر (حساب بسيط في الفرونت، مش الأمثل لكن كافي دلوقتي)
  const { data: allReviews } = await supabase.from("player_reviews").select("rating").eq("reviewed_id", reviewedId);
  const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await supabase
    .from("profiles")
    .update({ avg_rating: avg.toFixed(1), ratings_count: allReviews.length })
    .eq("id", reviewedId);
}
