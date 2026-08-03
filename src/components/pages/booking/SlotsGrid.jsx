export default function SlotsGrid({ slots, selectedTimes, onToggle, locked }) {
  const lastSlot = slots[slots.length - 1];
  const showCrossDayHint = lastSlot && lastSlot.end === "12:00 ص" && lastSlot.status === "available";

  return (
    <section className={`booking-slots ${locked ? "section-locked" : ""}`} data-requires="اليوم">
      <div className="section-title">
        <h2>اختر الموعد المناسب</h2>
        <span>اضغط لاختيار الموعد</span>
      </div>

      <div className="slots-legend">
        <span>
          <em className="leg-dot available" /> متاح
        </span>
        <span>
          <em className="leg-dot booked" /> محجوز
        </span>
      </div>
      <div className="slots-legend">
        <span>
          <em className="leg-dot available" /> متاح اختيار اكثر من ساعة
        </span>
      </div>

      <div className="slots-grid">
        {slots.map((slot) => {
          const isBooked = slot.status === "booked";
          const isBlocked = slot.status === "blocked";
          const isPast = slot.status === "past";
          const isDisabled = isBooked || isBlocked || isPast;
          const isSelected = selectedTimes.includes(slot.start);

          return (
            <button
              key={slot.start}
              type="button"
              className={`slot-card ${isBooked ? "booked" : isBlocked ? "booked" : isPast ? "past" : "available"} ${isSelected ? "selected" : ""}`}
              disabled={isDisabled}
              onClick={() => onToggle(slot)}>
              <span className="slot-status" />
              {isSelected && (
                <span className="slot-check">
                  <i className="fa-solid fa-check" />
                </span>
              )}
              <h3>{slot.start}</h3>
              <h3>الي</h3>
              <h3>{slot.end}</h3>
              {isBooked && <p>محجوز</p>}
              {isBlocked && <p>{slot.blockReason || "غير متاح"}</p>}
              {isPast && <p>فات الموعد</p>}
            </button>
          );
        })}
      </div>

      {showCrossDayHint && (
        <div className="cross-day-hint">
          <i className="fa-solid fa-moon"></i>
          عايز تكمل حجزك بعد نص الليل؟ تقدر تختار الساعة اللي بعدها من تاب اليوم اللي جاي
        </div>
      )}
    </section>
  );
}
