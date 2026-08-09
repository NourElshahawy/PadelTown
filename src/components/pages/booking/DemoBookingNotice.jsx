"use client";
import Link from "next/link";
import "@/styles/shared/owner-modal.css";

export default function DemoBookingNotice({ onClose }) {
  return (
    <div className="modal-backdrop-ph show" onClick={onClose}>
      <div className="modal-dialog-ph" onClick={(e) => e.stopPropagation()}>
        <div className="owner-modal-content owner-modal-body demo-notice-body">
          <button type="button" className="btn-close-ph" aria-label="إغلاق" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="demo-notice-icon">
            <i className="fa-solid fa-flask"></i>
          </div>
          <h3>ده حجز تجريبي بس</h3>
          <p className="owner-modal-sub">ده ملعب تجريبي لتوضيح شكل الحجز على المنصة — مش هيتم حجز حقيقي. سجّل كصاحب ملعب عشان تستقبل حجوزات حقيقية على ملعبك.</p>
          <div className="demo-notice-actions">
            <Link href="/register/owner" className="btn btn-accent btn-block">
              سجّل كصاحب ملعب
            </Link>
            <button type="button" className="btn btn-ghost btn-block" onClick={onClose}>
              رجوع
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
