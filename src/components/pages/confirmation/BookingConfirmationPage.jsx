"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import EmailNotice from "./EmailNotice";
import StatusTracker from "./StatusTracker";
import BookAgainCard from "./BookAgainCard";
import BookingSummarySidebar from "./BookingSummarySidebar";
import ReviewPrompt from "@/components/pages/booking/confirmation/ReviewPrompt";

export default function BookingConfirmationPage({ booking, userId }) {
  const [showEmailNotice, setShowEmailNotice] = useState(true);
  const [isPaid, setIsPaid] = useState(booking.paymentStatus === "paid");
  const [isClaimed, setIsClaimed] = useState(!!booking.paymentClaimedAt);
  const [isCancelled, setIsCancelled] = useState(booking.status === "cancelled");
  const [showReview, setShowReview] = useState(!booking.reviewed && !!booking.isPastBooking);

  const groupKey = booking.groupId || booking.id;

  // اشتراك لحظي: لو الأونر أكد استلام الدفع (أو ألغى الحجز) والعميل فاتح نفس الصفحة، تتحدث فورًا من غير Refresh
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`booking-status-${groupKey}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bookings", filter: `group_id=eq.${groupKey}` }, (payload) => {
        const row = payload.new;
        if (!row) return;
        if (row.payment_status === "paid") setIsPaid(true);
        if (row.status === "cancelled") setIsCancelled(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupKey]);

  let statusLabel = "مؤكد";
  let statusClass = "confirmed";
  if (isCancelled) {
    statusLabel = "ملغي";
    statusClass = "cancelled";
  } else if (isPaid) {
    statusLabel = "مدفوع";
    statusClass = "paid";
  } else if (isClaimed) {
    statusLabel = "قيد المراجعة";
    statusClass = "pending";
  }

  return (
    <main className="confirmation-main">
      <div className="container">
        <div className="confirmation-grid">
          <div className="confirmation-left">
            {showEmailNotice && <EmailNotice email={booking.email} onDismiss={() => setShowEmailNotice(false)} />}

            <div className="booking-header">
              <div>
                <p className="booking-id">
                  الحجز <b>{booking.displayId}</b>
                </p>
                <h1>{isCancelled ? "الحجز اتلغى." : isPaid ? "تم تأكيد الدفع. نراكم في الملعب." : "كل شيء جاهز. نراكم في الملعب."}</h1>
              </div>
              <span className={`status-pill ${statusClass}`}>
                <span className="pulse-dot" /> {statusLabel}
              </span>
            </div>

            <StatusTracker booking={{ ...booking, status: isCancelled ? "cancelled" : booking.status }} isPaid={isPaid} isClaimed={isClaimed} onMarkPaid={() => setIsClaimed(true)} />

            {showReview && !isCancelled && (
              <div className="review-modal-overlay">
                <div className="review-modal-box">
                  <ReviewPrompt bookingId={booking.id} courtId={booking.courtId} userId={userId} onSubmitted={() => setShowReview(false)} />
                </div>
              </div>
            )}
            <BookAgainCard />
          </div>

          <div className="confirmation-right">
            <BookingSummarySidebar booking={booking} isPaid={isPaid} isClaimed={isClaimed} />{" "}
          </div>
        </div>
      </div>
    </main>
  );
}
