"use client";
import { useState } from "react";
import { approveSubscription, rejectSubscription } from "@/services/adminSubscriptionsClient";
import { mapSubscription } from "@/lib/subscriptionUtils";
import { useToast } from "@/components/shared/ToastProvider";

const STATUS_LABELS = {
  trial: "فترة تجريبية",
  active: "نشط",
  pending_payment: "قيد المراجعة",
  expired: "منتهي",
  rejected: "مرفوض",
};

function mergeMapped(row, ownerInfo) {
  return { ...mapSubscription(row), ownerId: row.owner_id, ...ownerInfo };
}

export default function AdminSubscriptionsManager({ initialSubscriptions }) {
  const { showToast } = useToast();
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [busyId, setBusyId] = useState(null);
  const [days, setDays] = useState(30);

  const pending = subscriptions.filter((s) => s.status === "pending_payment");
  const rest = subscriptions.filter((s) => s.status !== "pending_payment");

  const ownerInfoOf = (id) => {
    const s = subscriptions.find((x) => x.id === id);
    return { ownerName: s.ownerName, ownerEmail: s.ownerEmail, ownerPhone: s.ownerPhone };
  };

  const handleApprove = async (id) => {
    setBusyId(id);
    try {
      const updated = await approveSubscription(id, Number(days) || 30);
      setSubscriptions((prev) => prev.map((s) => (s.id === id ? mergeMapped(updated, ownerInfoOf(id)) : s)));
      showToast("تم تفعيل الاشتراك", "success");
    } catch {
      showToast("حصل خطأ أثناء الموافقة", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    const note = prompt("سبب الرفض (اختياري):") || "";
    setBusyId(id);
    try {
      const updated = await rejectSubscription(id, note);
      setSubscriptions((prev) => prev.map((s) => (s.id === id ? mergeMapped(updated, ownerInfoOf(id)) : s)));
      showToast("تم رفض الطلب", "success");
    } catch {
      showToast("حصل خطأ أثناء الرفض", "error");
    } finally {
      setBusyId(null);
    }
  };

  const renderRow = (s, withActions) => (
    <div key={s.id} className="owner-venue-row" style={{ flexWrap: "wrap" }}>
      <div>
        <div className="owner-venue-row-name">{s.ownerName}</div>
        <div style={{ fontSize: ".76rem", color: "var(--text-faint)" }}>
          {s.ownerPhone} · {s.ownerEmail}
        </div>
        {s.paymentMethod && <div style={{ fontSize: ".76rem", color: "var(--text-faint)" }}>{s.paymentMethod === "vodafone_cash" ? "فودافون كاش" : "تحويل بنكي"}</div>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {s.paymentProofUrl && (
          <button type="button" className="owner-btn-view-proof" title="مشاهدة إثبات الدفع" onClick={() => window.open(s.paymentProofUrl, "_blank")}>
            <i className="fa-solid fa-eye"></i>
          </button>
        )}
        <span className={`owner-status-badge ${s.effectiveStatus}`}>{STATUS_LABELS[s.effectiveStatus] || s.effectiveStatus}</span>
        {s.endsAt && <span style={{ fontSize: ".76rem", color: "var(--text-faint)" }}>حتى {new Date(s.endsAt).toLocaleDateString("ar-EG", { day: "numeric", month: "short" })}</span>}

        {withActions && (
          <>
            <button type="button" className="owner-btn-complete" disabled={busyId === s.id} onClick={() => handleApprove(s.id)}>
              موافقة
            </button>
            <button type="button" className="owner-btn-cancel-booking" disabled={busyId === s.id} onClick={() => handleReject(s.id)}>
              رفض
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="owner-card">
        <h2 className="owner-card-title">طلبات معلّقة ({pending.length})</h2>
        {pending.length > 0 && (
          <div className="field-group" style={{ maxWidth: 220 }}>
            <label style={{ fontSize: ".78rem" }}>مدة التفعيل (أيام)</label>
            <input className="field-input" type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} />
          </div>
        )}
        {pending.length === 0 ? <p className="owner-table-empty">مفيش طلبات معلّقة دلوقتي.</p> : pending.map((s) => renderRow(s, true))}
      </div>

      <div className="owner-card">
        <h2 className="owner-card-title">كل الاشتراكات</h2>
        {rest.length === 0 ? <p className="owner-table-empty">مفيش حاجة تانية لسه.</p> : rest.map((s) => renderRow(s, false))}
      </div>
    </>
  );
}
