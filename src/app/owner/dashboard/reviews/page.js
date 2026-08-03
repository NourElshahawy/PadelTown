import { createClient } from "@/lib/supabase/server";
import { getOwnerReviews } from "@/services/ownerReviewsService";
import OwnerReviewsTable from "@/components/owner-dashboard/OwnerReviewsTable";

export default async function OwnerReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const reviews = await getOwnerReviews(user.id);

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  return (
    <>
      <h1 className="owner-page-title">التقييمات ({reviews.length})</h1>

      <div className="owner-stats-grid">
        <div className="owner-stat-card">
          <p className="owner-stat-label">متوسط التقييم</p>
          <p className="owner-stat-value">{avgRating} ⭐</p>
        </div>
      </div>

      <div className="owner-card">
        <OwnerReviewsTable reviews={reviews} />
      </div>
    </>
  );
}
