"use client";
import { useState } from "react";
import { submitPlayerReview } from "@/services/playerReviewClient";

export default function PlayerReviewPrompt({ partnerRequestId, reviewerId, otherPlayer, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [showedUp, setShowedUp] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await submitPlayerReview(partnerRequestId, reviewerId, otherPlayer.id, rating, showedUp ? null : "لم يحضر الموعد");
      onSubmitted();
    } catch {
      alert("حصل خطأ أثناء إرسال التقييم");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-prompt-card">
      <p style={{ color: "var(--white)", fontWeight: 700, marginBottom: 10 }}>عاوزين رأيك في {otherPlayer.name}</p>

      <label className="check-row" style={{ marginBottom: 12 }}>
        <input type="checkbox" checked={showedUp} onChange={(e) => setShowedUp(e.target.checked)} />
        <span>حضر الموعد فعلاً</span>
      </label>

      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`review-star ${n <= rating ? "is-active" : ""}`} onClick={() => setRating(n)}>
            ★
          </span>
        ))}
      </div>

      <button className="btn btn-accent btn-sm btn-block" onClick={handleSubmit} disabled={rating === 0 || submitting} style={{ marginTop: 10 }}>
        {submitting ? "جاري الإرسال…" : "إرسال التقييم"}
      </button>
    </div>
  );
}
