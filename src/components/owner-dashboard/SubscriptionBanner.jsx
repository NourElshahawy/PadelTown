import Link from "next/link";

const STATUS_LABELS = {
  trial: "فترة تجريبية",
  active: "نشط",
  pending_payment: "قيد المراجعة",
  expired: "منتهي",
  rejected: "مرفوض",
};

export default function SubscriptionBanner({ subscription }) {
  if (!subscription) return null;

  const { effectiveStatus, daysRemaining, adminNote } = subscription;

  if (effectiveStatus === "active" && daysRemaining > 3) return null;

  let tone = "tone-info";
  let message = null;

  if (effectiveStatus === "expired") {
    tone = "tone-danger";
    message = "اشتراكك خلص — ملاعبك مش ظاهرة في نتائج البحث للاعبين دلوقتي.";
  } else if (effectiveStatus === "rejected") {
    tone = "tone-danger";
    message = adminNote ? `طلب الاشتراك اتراقض: ${adminNote}` : "طلب الاشتراك اتراقض.";
  } else if (effectiveStatus === "pending_payment") {
    tone = "tone-info";
    message = "طلب دفع الاشتراك بتاعك قيد المراجعة من الإدارة.";
  } else if ((effectiveStatus === "trial" || effectiveStatus === "active") && daysRemaining <= 3) {
    tone = "tone-warning";
    message = `${effectiveStatus === "trial" ? "الفترة التجريبية" : "اشتراكك"} هيخلص خلال ${daysRemaining} ${daysRemaining === 1 ? "يوم" : "أيام"}.`;
  }

  if (!message) return null;

  const showRenewButton = effectiveStatus !== "pending_payment";

  return (
    <div className={`subscription-banner ${tone}`}>
      <span className="subscription-banner-text">
        <span className={`owner-status-badge ${effectiveStatus}`} style={{ marginLeft: 8 }}>
          {STATUS_LABELS[effectiveStatus] || effectiveStatus}
        </span>
        {message}
      </span>
      {showRenewButton && (
        <Link href="/owner/dashboard/subscription" className="owner-btn-save" style={{ textDecoration: "none" }}>
          جدّد اشتراكك
        </Link>
      )}
    </div>
  );
}
