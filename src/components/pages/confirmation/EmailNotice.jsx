export default function EmailNotice({ email, onDismiss }) {
  return (
    <div className="email-notice">
      <div className="email-icon">
        <i className="fa-solid fa-envelope-open-text"></i>
      </div>
      <div>
        <b>تم إرسال التأكيد إلى بريدك الإلكتروني</b>
        <span>{email}</span>
      </div>
      <button className="email-dismiss" aria-label="إغلاق" onClick={onDismiss}>
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
}
