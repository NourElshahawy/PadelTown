"use client";
import Link from "next/link";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { useLiveSlots } from "@/hooks/useLiveSlots";
// import "@/styles/courts/card.css";

export default function CourtCard({ court }) {
  const { slots, label } = useLiveSlots(court.todaySlots); // مش .map(s => s.time) — هي أصلاً array نصوص

  return (
    <div className="court-card">
      <div className="court-media">
        <span className="court-badge-live">
          <span className="pulse-dot" /> {court.isLive ? "Live" : "مغلق"}
        </span>
        {court.sportTypeLabel && <span className="court-badge-sport">{court.sportTypeLabel}</span>}
        {court.isDemo && <span className="court-badge-demo">تجريبي</span>}
        <span className="court-rating">
          <i className="fa-solid fa-star"></i> {court.rating > 0 ? court.rating : "جديد"}
        </span>
        <ImageWithFallback src={court.image} alt={`${court.name} court`} />
        <span className="court-price-tag">
          {court.priceRangeLabel} جنية <span>/ ساعة</span>
        </span>
      </div>

      <div className="court-body">
        <h3 className="court-name">{court.name}</h3>

        {court.locationLink ? (
          <a href={court.locationLink} target="_blank" rel="noreferrer" className="court-loc-inline">
            <i className="fa-solid fa-location-dot" /> {court.location}
          </a>
        ) : (
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(court.location)}`} target="_blank" rel="noopener noreferrer" className="court-loc">
            <i className="fa-solid fa-location-dot"></i> {court.location}
          </a>
        )}

        <div className="court-stats">
          <div className="stat">
            <b>{court.typeLabel || "—"}</b>
            <span>النوع</span>
          </div>
          <div className="stat">
            <b>{court.rating > 0 ? court.rating : "جديد"}</b>
            <span>التقييم</span>
          </div>
          <div className="stat">
            <b>{court.bookingsCount}</b>
            <span>الحجوزات</span>
          </div>
        </div>

        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span
              style={{
                fontSize: "0.78rem",
                color: "var(--text-faint)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}>
              المواعيد المتاحة اليوم
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>{label}</span>
          </div>
          <div className="slot-row">
            {slots.map((s) => (
              <span key={s.time} className={`slot-chip ${s.taken ? "is-taken" : ""} ${s.leaving ? "is-leaving" : ""}`}>
                {s.time}
              </span>
            ))}
          </div>
        </div>

        <div className="court-foot">
          <Link href={`/booking/${court.slug}?subCourtId=${court.subCourtId}`} className="btn btn-accent btn-sm btn-block">
            احجز الان
          </Link>
        </div>
      </div>
    </div>
  );
}
