"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { getAvailableCourtsForSlots } from "@/services/quickBookClient";
import { createBookingWithDeposit } from "@/services/depositBookingClient";

const INSTAPAY_NUMBER = "01065801252";

export default function QuickBookModal({ slots, onClose }) {
  useLockBodyScroll(true);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courts, setCourts] = useState([]);
  const [error, setError] = useState("");
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const first = slots[0];
  const last = slots[slots.length - 1];
  const spansMultipleDays = first.date !== last.date;
  const rangeLabel = spansMultipleDays ? `${first.start} (${first.date}) الي ${last.end} (${last.date})` : `${first.date} · ${first.start} الي ${last.end}`;

  useEffect(() => {
    let active = true;
    getAvailableCourtsForSlots(slots)
      .then((data) => active && setCourts(data))
      .catch(() => active && setError("حصل خطأ أثناء البحث"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slots]);

  useEffect(() => {
    if (!proofFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(proofFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [proofFile]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(INSTAPAY_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setProofFile(file);
  };

  const handleConfirmBooking = async () => {
    if (!proofFile || !selectedCourt) return;
    setConfirming(true);

    const groupId = crypto.randomUUID();
    const rows = selectedCourt.slots.map((s) => ({
      user_id: null, // بيتحدد جوه createBookingWithDeposit فعليًا لو محتاج، لكن نحتاج user_id هنا
      court_id: selectedCourt.courtId,
      venue_name: selectedCourt.venueName,
      court_name: selectedCourt.courtName,
      date: s.date,
      time: `${s.start} الي ${s.end}`,
      price: selectedCourt.pricePerHour,
      status: "confirmed",
      group_id: groupId,
    }));

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const rowsWithUser = rows.map((r) => ({ ...r, user_id: user.id }));
      const bookingRows = await createBookingWithDeposit({ rows: rowsWithUser, proofFile });
      onClose();
      router.push(`/bookings/${bookingRows[0].id}`);
    } catch (err) {
      if (err.code === "23505") {
        alert("للأسف حد سبقك حجز واحد أو أكتر من المواعيد دي، اختار ملعب تاني");
        setCourts((prev) => prev.filter((c) => c.courtId !== selectedCourt.courtId));
        setSelectedCourt(null);
        setProofFile(null);
      } else {
        alert("حصل خطأ أثناء الحجز، حاول تاني");
      }
    } finally {
      setConfirming(false);
    }
  };

  // خطوة دفع الديبوزيت بعد اختيار ملعب
  if (selectedCourt) {
    const deposit = Math.round(selectedCourt.totalPrice / 2);
    return createPortal(
      <div className="booking-guide-overlay" onClick={onClose}>
        <div className="quick-book-modal" onClick={(e) => e.stopPropagation()}>
          <button
            className="booking-guide-skip"
            onClick={() => {
              setSelectedCourt(null);
              setProofFile(null);
            }}>
            ← رجوع
          </button>
          <h3 style={{ marginBottom: 4 }}>
            {selectedCourt.venueName} — {selectedCourt.courtName}
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: ".85rem", marginBottom: 16 }}>
            {rangeLabel} · الإجمالي {selectedCourt.totalPrice} ج.م
          </p>

          <div className="deposit-box">
            <div className="deposit-header">
              <span className="deposit-header-label">
                <i className="fa-solid fa-shield-halved"></i> المبلغ المطلوب لتأكيد الحجز
              </span>
            </div>

            <div className="deposit-amount-display">
              <span>{deposit}</span>
              <small>ج.م</small>
            </div>

            <div className="deposit-notice">
              <i className="fa-solid fa-circle-info"></i>
              <span>الحجز بيتأكد بس بعد دفع الديبوزيت. لو خرجت من غير دفع، المواعيد دي تفضل متاحة لحد تاني فورًا.</span>
            </div>

            <div className="instapay-number-box">
              <i className="fa-solid fa-mobile-screen"></i>
              <div>
                <span className="inp-label">رقم InstaPay</span>
                <b className="inp-num">{INSTAPAY_NUMBER}</b>
              </div>
              <button type="button" className="btn-copy" onClick={handleCopy} aria-label="نسخ الرقم">
                <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`}></i>
              </button>
            </div>

            <label className="instapay-upload">
              <input type="file" accept="image/*" onChange={handleFileChange} hidden />
              {previewUrl ? (
                <img src={previewUrl} alt="إثبات الدفع" className="instapay-upload-preview" />
              ) : (
                <>
                  <i className="fa-solid fa-camera"></i>
                  <span>ارفع صورة إثبات تحويل الديبوزيت (إجباري)</span>
                </>
              )}
            </label>
          </div>

          <button className="btn btn-accent btn-block" onClick={handleConfirmBooking} disabled={confirming || !proofFile}>
            {confirming ? "جاري التأكيد..." : "تأكيد الحجز"}
          </button>
        </div>
      </div>,
      document.body,
    );
  }

  // ليستة الملاعب المتاحة (زي ما كانت)
  return createPortal(
    <div className="booking-guide-overlay" onClick={onClose}>
      <div className="quick-book-modal" onClick={(e) => e.stopPropagation()}>
        <button className="booking-guide-skip" onClick={onClose}>
          إغلاق
        </button>
        <h3 style={{ marginBottom: 4 }}>الملاعب المتاحة</h3>
        <p style={{ color: "var(--text-muted)", fontSize: ".85rem", marginBottom: 16 }}>
          {rangeLabel} ({slots.length} {slots.length === 1 ? "ساعة" : "ساعات"})
        </p>

        {loading ? (
          <p className="owner-table-empty">جاري البحث...</p>
        ) : error ? (
          <p className="owner-table-empty">{error}</p>
        ) : courts.length === 0 ? (
          <p className="owner-table-empty">للأسف مفيش ملاعب متاحة طول المدة دي كاملة.</p>
        ) : (
          <div className="quick-book-list">
            {courts.map((c) => (
              <div key={c.courtId} className="quick-book-row">
                <div>
                  <b>{c.venueName}</b>
                  <div style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>{c.courtName}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>{c.totalPrice} ج.م</span>
                  <button className="btn btn-accent btn-sm" onClick={() => setSelectedCourt(c)}>
                    احجزه
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
