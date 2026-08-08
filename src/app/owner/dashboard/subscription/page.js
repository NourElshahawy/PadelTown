import { createClient } from "@/lib/supabase/server";
import { getOwnerSubscription, mapSubscription } from "@/services/subscriptionService";
import SubscriptionRenewForm from "@/components/owner-dashboard/SubscriptionRenewForm";

const STATUS_LABELS = {
  trial: "فترة تجريبية",
  active: "نشط",
  pending_payment: "قيد المراجعة",
  expired: "منتهي",
  rejected: "مرفوض",
};

export default async function OwnerSubscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subscription = await getOwnerSubscription(user.id);

  const { data: historyRows } = await supabase.from("subscriptions").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
  const history = (historyRows || []).map(mapSubscription);

  return (
    <>
      <h1 className="owner-page-title">الاشتراك</h1>

      <div className="owner-card">
        <h2 className="owner-card-title">حالتك الحالية</h2>
        {subscription ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span className={`owner-status-badge ${subscription.effectiveStatus}`}>{STATUS_LABELS[subscription.effectiveStatus] || subscription.effectiveStatus}</span>
              {subscription.isLive && (
                <span style={{ color: "var(--text-faint)", fontSize: ".85rem" }}>
                  باقي {subscription.daysRemaining} {subscription.daysRemaining === 1 ? "يوم" : "أيام"}
                </span>
              )}
            </div>
            {subscription.endsAt && (
              <p style={{ color: "var(--text-faint)", fontSize: ".85rem" }}>تاريخ الانتهاء: {new Date(subscription.endsAt).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" })}</p>
            )}
            {subscription.status === "rejected" && subscription.adminNote && <p style={{ color: "#ff6b6b", fontSize: ".85rem", marginTop: 8 }}>سبب الرفض: {subscription.adminNote}</p>}
          </>
        ) : (
          <p style={{ color: "var(--text-faint)" }}>مفيش اشتراك مسجل لحسابك لسه.</p>
        )}
      </div>

      {subscription?.status !== "pending_payment" && (
        <div className="owner-card">
          <h2 className="owner-card-title">جدّد اشتراكك</h2>
          <SubscriptionRenewForm ownerId={user.id} />
        </div>
      )}

      {history.length > 1 && (
        <div className="owner-card">
          <h2 className="owner-card-title">سجل الاشتراكات</h2>
          {history.map((h) => (
            <div key={h.id} className="owner-venue-row">
              <span className="owner-venue-row-name">{new Date(h.createdAt).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span className={`owner-status-badge ${h.status}`}>{STATUS_LABELS[h.status] || h.status}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
