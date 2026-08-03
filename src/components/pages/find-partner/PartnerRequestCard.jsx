import Link from "next/link";

const STATUS_LABELS = {
  open: "مفتوح للانضمام",
  partially_filled: "محتاج لاعبين كمان",
  matched: "اكتمل الفريق",
};

export default function PartnerRequestCard({ request }) {
  const joinedCount = request.playersJoined.filter(
    (p) => p.status === "accepted",
  ).length;
  const remaining = request.playersNeeded - joinedCount;

  return (
    <div className="partner-card">
      <div className="partner-card-head">
        <div className="partner-host">
          <span className="partner-avatar">{request.hostAvatarUrl ? <img src={request.hostAvatarUrl} alt="" /> : request.hostName.charAt(0)}</span>
          <div>
            <span className="partner-host-name">{request.hostName}</span>
            {request.hostRating && <span style={{ fontSize: ".72rem", color: "#ffc453", marginRight: 6 }}>★ {request.hostRating}</span>}
          </div>
        </div>  
        <span className={`level-badge ${request.level}`}>{request.level}</span>
      </div>

      <div className="partner-card-meta">
        <span className="meta-row">
          <i className="fa-solid fa-location-dot" /> {request.courtName}
        </span>
        <span className="meta-row">
          <i className="fa-solid fa-calendar-days" /> {request.dateLabel}
        </span>
        <span className="meta-row">
          <i className="fa-regular fa-clock" /> {request.time}
        </span>
      </div>

      <span className="partner-need-badge">
        <i className="fa-solid fa-user-plus"></i>
        محتاج {remaining} {remaining === 1 ? "لاعب" : "لاعبين"}
      </span>

      {request.notes && <p className="partner-card-notes">{request.notes}</p>}

      <div className="partner-card-foot">
        <span className={`partner-status-tag ${request.status}`}>{request.status === "matched" ? "✓ اكتمل الفريق" : STATUS_LABELS[request.status]}</span>
        <Link href={`/find-partner/${request.id}`} className="btn btn-accent btn-sm">
          التفاصيل
        </Link>
      </div>
    </div>
  );
}
