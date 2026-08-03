"use client";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

export default function ConfirmModal({ isOpen, title, message, confirmLabel = "تأكيد", cancelLabel = "إلغاء", danger = false, onConfirm, onCancel }) {
  useLockBodyScroll(isOpen);
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="confirm-modal-box" role="alertdialog" aria-modal="true">
        <p className="confirm-modal-title">{title}</p>
        {message && <p className="confirm-modal-message">{message}</p>}

        <div className="confirm-modal-actions">
          <button type="button" className="confirm-modal-btn confirm-modal-btn-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={`confirm-modal-btn ${danger ? "confirm-modal-btn-danger" : "confirm-modal-btn-primary"}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
