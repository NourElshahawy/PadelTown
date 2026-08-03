"use client";
import InstaPayBlock from "../../confirmation/InstaPayBlock";

export default function PaymentMethodChoice({ amount, bookingId, displayId, isPaid, isClaimed, onMarkPaid, userName, userEmail, venueName }) {
  if (isPaid) {
    return (
      <div className="paid-badge">
        <i className="fa-solid fa-circle-check"></i>
        تم تأكيد استلام الدفع
      </div>
    );
  }

  if (isClaimed) {
    return (
      <div className="paid-badge">
        <i className="fa-solid fa-hourglass-half"></i>
        تم إرسال الدفع — قيد المراجعة من الملعب
      </div>
    );
  }

  return <InstaPayBlock amount={amount} bookingId={bookingId} displayId={displayId} onMarkPaid={onMarkPaid} userName={userName} userEmail={userEmail} venueName={venueName} />;
}
