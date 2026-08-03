"use client";
"use client";
import { useState } from "react";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

export default function BlockSlotModal({ count, onConfirm, onCancel, submitting }) {
  useLockBodyScroll(true);
  const [reason, setReason] = useState("");

  return (
    <div className="confirm-modal-overlay" onClick={(e) => e.target === e.currentTarget && !submitting && onCancel()}>
      <div className="confirm-modal-box" role="alertdialog" aria-modal="true">
        <p className="confirm-modal-title">قفل {count === 1 ? "الساعة المحددة" : `${count} ساعات محددة`}</p>
        <p className="confirm-modal-message">هتتقفل الساعة/الساعات دي قدام الزباين ولن يقدر حد يحجزها. اكتب سبب (اختياري) , زي صيانة أو مناسبة خاصة.</p>

        <input className="field-input" placeholder="السبب (اختياري)" value={reason} onChange={(e) => setReason(e.target.value)} style={{ marginTop: 8, marginBottom: 4 }} />

        <div className="confirm-modal-actions">
          <button type="button" className="confirm-modal-btn confirm-modal-btn-cancel" onClick={onCancel} disabled={submitting}>
            إلغاء
          </button>
          <button type="button" className="confirm-modal-btn confirm-modal-btn-primary" onClick={() => onConfirm(reason)} disabled={submitting}>
            {submitting ? "جاري القفل…" : "تأكيد القفل"}
          </button>
        </div>
      </div>
    </div>
  );
}
