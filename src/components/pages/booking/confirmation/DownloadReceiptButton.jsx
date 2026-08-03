"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

export default function DownloadReceiptButton({ booking }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <button className="summary-action-btn" type="button" onClick={() => setShowPreview(true)}>
        <i className="fa-solid fa-image"></i> تحميل الإيصال
      </button>

      {showPreview && <ReceiptImagePreview booking={booking} onClose={() => setShowPreview(false)} />}
    </>
  );
}

function ReceiptImagePreview({ booking, onClose }) {
  useLockBodyScroll(true);
  const [saving, setSaving] = useState(false);

  const handleSaveImage = async () => {
    setSaving(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const el = document.getElementById("receipt-visible-card");
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#0b1020" });

      const link = document.createElement("a");
      link.download = `Ace Town-${booking.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("حصل خطأ أثناء حفظ الصورة، حاول تاني");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="booking-guide-overlay" onClick={onClose}>
      <div className="quick-book-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
        <button className="booking-guide-skip" onClick={onClose}>
          إغلاق
        </button>

        <div
          id="receipt-visible-card"
          dir="rtl"
          style={{
            fontFamily: "Tahoma, Arial, sans-serif",
            background: "#0b1020",
            color: "#fff",
            padding: "24px",
            borderRadius: "12px",
            marginTop: 20,
          }}>
          <h2 style={{ color: "#7c3aed", margin: "0 0 4px", fontSize: 20 }}>Ace Town</h2>
          <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 20 }}>إيصال الحجز</p>

          <ReceiptRow label="رقم الحجز" value={booking.displayId || booking.id} />
          <ReceiptRow label="الملعب" value={booking.venueName} />
          <ReceiptRow label="الكورت" value={booking.subCourtName} />
          <ReceiptRow label="التاريخ" value={booking.date} />
          <ReceiptRow label="الوقت" value={booking.time} />

          <div style={{ borderTop: "1px solid rgba(255,255,255,.15)", marginTop: 16, paddingTop: 16, display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#94a3b8" }}>الإجمالي</span>
            <b style={{ color: "#00d68f", fontSize: 20 }}>{booking.price} ج.م</b>
          </div>
        </div>

        <button className="btn btn-accent btn-block" onClick={handleSaveImage} disabled={saving} style={{ marginTop: 16 }}>
          {saving ? "جاري الحفظ..." : "حفظ الصورة في جهازك"}
        </button>
      </div>
    </div>,
    document.body,
  );
}

function ReceiptRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
      <span style={{ color: "#94a3b8" }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
