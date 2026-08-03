import PaymentMethodChoice from "../booking/confirmation/PaymentMethodChoice";

export default function StatusTracker({ booking, isPaid, isClaimed, onMarkPaid }) {
  const isCancelled = booking.status === "cancelled";
  const paymentDone = isPaid;
  const paymentPending = !isPaid && isClaimed;

  return (
    <div className="tracker-card">
      <h3>حالة الحجز</h3>
      <div className="tracker">
        <div className="tracker-step is-done">
          <div className="ts-icon">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div className="ts-body">
            <b>تم تأكيد الحجز</b>
            <span>تم حجز الفترة الخاصة بك في {booking.venueName}</span>
            <span className="ts-time">{booking.createdAt}</span>
          </div>
        </div>

        <div className="tracker-step is-done">
          <div className="ts-icon">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div className="ts-body">
            <b>تم إرسال البريد الإلكتروني</b>
            <span>تم إرسال التأكيد إلى {booking.email}</span>
            <span className="ts-time">{booking.createdAt}</span>
          </div>
        </div>

        {isCancelled ? (
          <div className="tracker-step is-cancelled">
            <div className="ts-icon">
              <i className="fa-solid fa-circle-xmark"></i>
            </div>
            <div className="ts-body">
              <b>الحجز اتلغى</b>
              <span>الحجز ده اتلغى ومحتاجش دفع</span>
            </div>
          </div>
        ) : (
          <div className={`tracker-step ${paymentDone ? "is-done" : "is-pending"}`}>
            <div className="ts-icon">
              <i className="fa-solid fa-credit-card"></i>
            </div>
            <div className="ts-body">
              <b>الدفع</b>
              <span>{paymentDone ? "تم استلام الدفع" : paymentPending ? "تم إرسال الدفع — قيد المراجعة" : "في انتظار الدفع عبر InstaPay"}</span>
              <span className="ts-time">{paymentDone ? "تم" : paymentPending ? "قيد المراجعة" : "—"}</span>
              <PaymentMethodChoice
                amount={booking.price}
                bookingId={booking.groupId || booking.id}
                displayId={booking.displayId}
                isPaid={paymentDone}
                isClaimed={isClaimed}
                onMarkPaid={onMarkPaid}
                userName={booking.userName}
                userEmail={booking.email}
                venueName={booking.venueName}
              />
            </div>
          </div>
        )}

        <div className="tracker-step is-upcoming">
          <div className="ts-icon">
            <i className="fa-solid fa-table-tennis-paddle-ball"></i>
          </div>
          <div className="ts-body">
            <b>توجه إلى الملعب</b>
            <span>أظهر معرف الحجز عند المدخل</span>
            <span className="ts-time">
              {booking.date} · {booking.time}
            </span>
          </div>
        </div>

        <div className="tracker-step is-upcoming">
          <div className="ts-icon">
            <i className="fa-solid fa-trophy"></i>
          </div>
          <div className="ts-body">
            <b>العب واستمتع</b>
            <span>
              {booking.subCourtName} · {booking.venueName}
            </span>
            <span className="ts-time">{booking.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
