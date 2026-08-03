export default function BookingSummaryFooter({ date, time, duration, price, onBookNow, disabled }) {
  return (
    <footer className="booking-summary">
      <div className="summary-price">
        <small>السعر</small>
        <h2>
          {price} <span>EGP</span>
        </h2>
      </div>

      <div className="summary-info">
        <div className="summary-locate">
          <span className="si-item">
            <i className="fa-regular fa-calendar" /> <span>{date || "—"}</span>
          </span>
        </div>
        <div className="summary-time">
          <div className="si-item">
            <i className="fa-regular fa-clock" /> <span>{time || "--"}</span>
          </div>
          <div className="si-item">
            <i className="fa-solid fa-hourglass-half" /> <span>{duration || "--"}</span>
          </div>
        </div>
      </div>

      <button type="button" className={`book-now ${disabled ? "disabled" : ""}`} onClick={onBookNow} disabled={disabled}>
        <i className="fa-solid fa-arrow-right" style={{color:"#000"}} /> احجز الان
      </button>
    </footer>
  );
}
