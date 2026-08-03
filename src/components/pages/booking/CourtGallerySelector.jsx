export default function CourtGallerySelector({ subCourts, selectedId, onSelect }) {
  return (
    <section className="court-gallery">
      <div className="section-title">
        <button type="button" className="cal-icon-btn"><i className="fa-regular fa-calendar" /></button>
        <h2>اي ملعب عاوز تحجز فيه؟</h2>
        <span>اضغط لاختيار الملعب</span>
      </div>

      <div className="row g-4">
        {subCourts.map((sc) => (
          <div className="col-md-6" key={sc.id}>
            <div
              className={`img-details ${selectedId === sc.id ? "court-selected" : ""} ${sc.isFullyBookedToday ? "court-full" : ""}`}
              onClick={() => onSelect(sc)}
            >
              <img src={sc.image} alt="" />
              <div className="hero-details">
                <span className="court-number">
                  <i className="fa-solid fa-table-tennis-paddle-ball" /> ملعب {sc.id.slice(0, 4)}
                </span>
                {sc.isFullyBookedToday && (
                  <span className="court-full-badge">
                    <i className="fa-solid fa-circle-xmark" /> محجوز بالكامل اليوم
                  </span>
                )}
                <h2>{sc.name}</h2>
                <p>{sc.description}</p>
                <div className="court-features">
                  {sc.tags.map((t) => (
                    <span key={t.label}><i className={`fa-solid ${t.icon}`} /> {t.label}</span>
                  ))}
                </div>
                <p style={{ marginTop: 10, color: "var(--accent)", fontWeight: 700, fontSize: ".9rem" }}>
                  {sc.pricePerHour} جنيه / ساعة
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}