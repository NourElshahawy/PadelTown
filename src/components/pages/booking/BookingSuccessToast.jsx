export default function BookingSuccessToast({ show }) {
  return (
    <div className={`booking-success ${show ? "show" : ""}`}>
      <i className="fa-solid fa-circle-check" />
      <span>تم تأكيد الحجز! جارٍ إعادة التوجيه…</span>
    </div>
  );
}
