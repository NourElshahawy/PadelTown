export default function DaySelector({ days, selectedDate, onSelect, locked, daysWithSelections = [] }) {
  return (
    <section className={`booking-days ${locked ? "section-locked" : ""}`} data-requires="الملعب">
      <div className="section-title">
        <button type="button" className="cal-icon-btn">
          <i className="fa-regular fa-calendar" />
        </button>
        <h2>إمتى تحب تلعب؟</h2>
        <span>اضغط لاختيار اليوم</span>
      </div>

      <div className="days-slider">
        {days.map((d) => (
          <button key={d.date} type="button" className={`day-card ${selectedDate === d.date ? "active" : ""}`} onClick={() => onSelect(d)}>
            {daysWithSelections.includes(d.date) && <span className="day-card-selection-dot" />}
            <small>{d.dow}</small>
            <strong>{d.dom}</strong>
            <span>{d.month}</span>
          </button>
        ))}
      </div>

      <div className="live-indicator">
        <span className="live-dot" /> المواعيد بتتحدث لحظيًا
      </div>
    </section>
  );
}
