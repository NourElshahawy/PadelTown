import Link from "next/link";

const STATUS_LABELS = { registration: "التسجيل مفتوح", ready: "جاهزة", live: "جارية الآن", completed: "انتهت" };
const STATUS_CLASS = { registration: "open", ready: "partially_filled", live: "matched", completed: "matched" };

export default function TournamentsSection({ tournaments }) {
  return (
    <div className="profile-section">
      <h2>
        <i className="fa-solid fa-trophy"></i> بطولاتي
      </h2>

      {tournaments.length === 0 ? (
        <div className="profile-empty-card">
          <i className="fa-solid fa-trophy"></i>
          لسه معملتش ولا اشتركتش في أي بطولة.{" "}
          <Link href="/tournaments" className="auth-link">
            اكتشف البطولات
          </Link>
        </div>
      ) : (
        tournaments.map((t) => (
          <Link href={`/tournaments/${t.id}`} key={t.id} className="booking-history-card" style={{ textDecoration: "none" }}>
            <div className="bhc-info">
              <b>
                {t.name} {t.role === "organizer" && <span style={{ color: "var(--accent)", fontSize: ".72rem" }}>(منظّم)</span>}
              </b>
              <span>
                {t.venue} · {new Date(t.date).toLocaleDateString("ar-EG", { day: "numeric", month: "long" })}
                {t.teamName && ` · فريقك: ${t.teamName}`}
              </span>
            </div>
            <span className={`partner-status-tag ${STATUS_CLASS[t.status]}`}>{t.status === "completed" && t.champion ? `🏆 ${t.champion}` : STATUS_LABELS[t.status]}</span>
          </Link>
        ))
      )}
    </div>
  );
}
