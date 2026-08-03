"use client";
import { useState } from "react";
import { submitCourtReview } from "@/services/reviewClient";

export default function ReviewPrompt({ bookingId, courtId, userId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showSiteFeedback, setShowSiteFeedback] = useState(false);
  const [siteFeedback, setSiteFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await submitCourtReview(bookingId, courtId, userId, rating, comment, siteFeedback || null);
      onSubmitted();
    } catch {
      alert("حصل خطأ أثناء إرسال التقييم");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-prompt-card">
      <p style={{ color: "var(--white)", fontWeight: 700, marginBottom: 10 }}>عاوزين رأيك في الملعب</p>
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`review-star ${n <= rating ? "is-active" : ""}`} onClick={() => setRating(n)}>
            ★
          </span>
        ))}
      </div>
      <textarea className="field-input field-textarea" placeholder="تعليق (اختياري)" value={comment} onChange={(e) => setComment(e.target.value)} style={{ marginTop: 10 }} />

      {!showSiteFeedback ? (
        <button
          type="button"
          onClick={() => setShowSiteFeedback(true)}
          style={{ background: "none", border: "none", color: "var(--text-dim, #9797a3)", fontSize: ".8rem", marginTop: 10, cursor: "pointer", textDecoration: "underline" }}>
          واجهتك مشكلة في الموقع؟
        </button>
      ) : (
        <textarea className="field-input field-textarea" placeholder="ملاحظات على الموقع (اختياري)" value={siteFeedback} onChange={(e) => setSiteFeedback(e.target.value)} style={{ marginTop: 10 }} />
      )}

      <button className="btn btn-accent btn-sm btn-block" onClick={handleSubmit} disabled={rating === 0 || submitting} style={{ marginTop: 10 }}>
        {submitting ? "جاري الإرسال…" : "إرسال التقييم"}
      </button>
    </div>
  );
}
