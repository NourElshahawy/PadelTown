export default function VenueSummaryCard({ court }) {
  return (
    <section className="court-card">
      <div className="card-bg">
        <img src={court.coverImage || court.image} alt={court.name} />
      </div>
      <div className="card-overlay" />
      <div className="court-header">
        <div className="court-logo">
          <img src={court.logo || court.image} alt="" />
        </div>
        <div className="court-content">
          <h1>{court.name}</h1>
          <div className="court-meta-row">
            <span className="court-rating-inline">
              <i className="fa-solid fa-star" /> {court.rating > 0 ? court.rating : "جديد"}
              {court.reviewsCount && <small>({court.reviewsCount})</small>}
            </span>
            {court.locationLink ? (
              <a href={court.locationLink} target="_blank" rel="noreferrer" className="court-loc-inline">
                <i className="fa-solid fa-location-dot" /> {court.location}
              </a>
            ) : (
              <span className="court-loc-inline">
                <i className="fa-solid fa-location-dot" /> {court.location}
              </span>
            )}
          </div>
          {court.amenities?.length > 0 && (
            <div className="court-features">
              {court.amenities.map((a) => (
                <span className="feature" key={a.label}>
                  <i className={`fa-solid ${a.icon}`} /> {a.label}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="court-price-box">
          <strong>{court.pricePerHour}</strong>
          <span>جنيه / ساعة</span>
        </div>
      </div>

      <div className="trust-row">
        <div className="trust-item">
          <i className="fa-solid fa-circle-check" /> حجز فوري
        </div>
        <div className="trust-item">
          <i className="fa-solid fa-bolt" /> تأكيد خلال ثوانٍ
        </div>
        <div className="trust-item">
          <i className="fa-solid fa-shield" /> دفع آمن
        </div>
      </div>
    </section>
  );
}
