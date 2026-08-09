"use client";
import { useState } from "react";
import { cancelBooking } from "@/services/bookingClient";
import ReviewPrompt from "@/components/pages/booking/confirmation/ReviewPrompt";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { formatSlotRanges } from "@/services/courtLogic";
import { useToast } from "@/components/shared/ToastProvider";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
// بيحول "3:00 م" أو "11:00 ص" لعدد دقايق من نص الليل، عشان نرتب صح
function timeToMinutes(label) {
  const match = label.trim().match(/^(\d{1,2}):(\d{2})\s*(ص|م)$/);
  if (!match) return 0;
  let [, h, m, period] = match;
  h = parseInt(h, 10);
  m = parseInt(m, 10);
  if (period === "ص") {
    if (h === 12) h = 0; // 12 ص = نص الليل
  } else {
    if (h !== 12) h += 12; // م بخلاف 12 الضهر
  }
  return h * 60 + m;
}

function startMinutes(rangeText) {
  return timeToMinutes(rangeText.split(" الي ")[0]);
}

function groupBookings(rows) {
  const groups = {};
  rows.forEach((b) => {
    const key = b.group_id || b.id;
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
  });
  return Object.values(groups).map((items) => {
const sortKey = (b) => `${b.date}_${String(startMinutes(b.time)).padStart(4, "0")}`;
    const sorted = [...items].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    return {
      groupId: first.group_id || first.id,
      bookingId: first.id,
      venue_name: first.venue_name,
      court_name: first.court_name,
      court_id: first.court_id,
      date: first.date === last.date ? first.date : `${first.date} → ${last.date}`,
      status: first.status,
      reviewed: first.reviewed,
      price: sorted.reduce((sum, x) => sum + x.price, 0),
      time: formatSlotRanges(sorted.map((b) => ({ date: b.date, start: b.time.split(" الي ")[0], end: b.time.split(" الي ")[1] }))),
    };
  });
}

export default function BookingHistorySection({ bookings: initialBookings, currentUserId }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const { showToast } = useToast();

  const requestCancel = (id) => setConfirmTarget(id);

  const handleCancel = async () => {
    const id = confirmTarget;
    setConfirmTarget(null);
    setCancellingId(id);
    try {
      await cancelBooking(id);
      const cancelledRows = bookings.filter((b) => (b.group_id || b.id) === id);
      setBookings((prev) => prev.map((b) => ((b.group_id || b.id) === id ? { ...b, status: "cancelled" } : b)));
      showToast("تم إلغاء الحجز بنجاح", "success");

      if (cancelledRows.length > 0) {
        const first = cancelledRows[0];
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        fetch("/api/notifications/booking-cancelled", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user?.email,
            userId: user?.id,
            userName: "لاعب PadelTown",
            venueName: first.venue_name,
            courtName: first.court_name,
            date: first.date,
            time: first.time,
            price: cancelledRows.reduce((sum, r) => sum + Number(r.price), 0),
          }),
        }).catch(() => {});
      }
    } catch {
      showToast("حصل خطأ أثناء الإلغاء", "error");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="profile-section">
      <h2>
        <i className="fa-solid fa-calendar-days"></i>حجوزاتي
      </h2>
      {bookings.length === 0 ? (
        <div className="profile-empty-card">
          <i className="fa-solid fa-calendar-xmark"></i>
          لسه معملتش أي حجز.{" "}
          <a href="/courts" className="auth-link">
            دور على ملعب دلوقتي
          </a>
        </div>
      ) : (
        groupBookings(bookings).map((b) => {
          const isPast = new Date(b.date) < new Date();
          const needsReview = isPast && (b.status === "confirmed" || b.status === "completed") && !b.reviewed;

          return (
            <div key={b.groupId}>
              <Link href={`/bookings/${b.bookingId}`} className="booking-history-card" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="bhc-info">
                  <b>
                    {b.venue_name} — {b.court_name}
                  </b>
                  <span>
                    {b.date} · {b.time}
                  </span>
                  {b.status === "cancelled" && <span style={{ color: "#ff6b6b", fontSize: ".76rem", fontWeight: 700 }}> ملغي</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="bhc-price">{b.price} ج.م</span>
                  {b.status === "confirmed" && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        requestCancel(b.groupId);
                      }}
                      disabled={cancellingId === b.groupId}
                      style={{ background: "none", border: "none", color: "#ff6b6b", fontSize: ".76rem", cursor: "pointer" }}>
                      {cancellingId === b.groupId ? "..." : "إلغاء"}
                    </button>
                  )}
                </div>
              </Link>
              {needsReview && (
                <ReviewPrompt
                  bookingId={b.bookingId}
                  courtId={b.court_id}
                  userId={currentUserId}
                  onSubmitted={() => {
                    setBookings((prev) => prev.map((x) => ((x.group_id || x.id) === b.groupId ? { ...x, reviewed: true } : x)));
                  }}
                />
              )}
            </div>
          );
        })
      )}

      <ConfirmModal
        isOpen={confirmTarget !== null}
        title="تأكيد إلغاء الحجز"
        message="متأكد إنك عايز تلغي الحجز ده؟ الخطوة دي مش هترجع تاني."
        confirmLabel="نعم، ألغِ الحجز"
        cancelLabel="تراجع"
        danger
        onConfirm={handleCancel}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
