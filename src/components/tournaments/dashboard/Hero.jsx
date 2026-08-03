const STAGE_BADGE = {
  registration: { text: "التسجيل مفتوح", tone: "open" },
  ready: { text: "التسجيل اكتمل", tone: "ready" },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" });
}

export default function Hero({ tournament, stage }) {
  if (stage === "completed" && tournament.champion) {
    return (
      <section className="td-hero td-hero--champion">
        <div className="td-hero-glow" aria-hidden="true" />
        <span className="td-eyebrow">🏆 البطل</span>
        <h1 className="td-champion-name">{tournament.champion.teamName}</h1>
        <p className="td-champion-sub">مبروك الفوز ببطولة {tournament.name}</p>

        {tournament.topThree?.length > 0 && (
          <ol className="td-podium">
            {tournament.topThree.map((t) => (
              <li key={t.rank} className={`td-podium-item td-podium-item--${t.rank}`}>
                <span>{t.rank === 1 ? "🥇" : t.rank === 2 ? "🥈" : "🥉"}</span>
                <span className="td-podium-name">{t.teamName}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    );
  }

  if (stage === "live") {
    const liveMatch = tournament.matches?.find((m) => m.isLive);
    return (
      <section className="td-hero td-hero--live">
        <div className="td-live-tag">
          <span className="td-live-dot" aria-hidden="true" />
          مباشر
        </div>
        <h1 className="td-hero-title">{tournament.name}</h1>
        {liveMatch ? (
          <div className="td-live-score">
            <span className="td-live-round">{liveMatch.round}</span>
            <div className="td-live-score-row">
              <span className="td-live-team">{liveMatch.teamA}</span>
              <span className="td-live-score-num">{liveMatch.scoreA}</span>
              <span>:</span>
              <span className="td-live-score-num">{liveMatch.scoreB}</span>
              <span className="td-live-team">{liveMatch.teamB}</span>
            </div>
          </div>
        ) : (
          <p className="td-hero-meta">جاري تجهيز المباراة القادمة…</p>
        )}
      </section>
    );
  }

  const badge = STAGE_BADGE[stage] ?? STAGE_BADGE.registration;

  return (
    <section className="td-hero">
      <span className={`td-badge td-badge--${badge.tone}`}>
        <span className="td-badge-dot" aria-hidden="true" />
        {badge.text}
      </span>
      <h1 className="td-hero-title">{tournament.name}</h1>
      <div className="td-hero-meta-row">
        <span className="td-hero-meta">📅 {formatDate(tournament.date)}</span>
        <span className="td-hero-meta">📍 {tournament.venue}</span>
      </div>
      <div className="td-hero-meta-row">
        <span className="td-hero-meta">
          👥 {tournament.teams?.length ?? 0} / {tournament.maxTeams} فرق
        </span>
      </div>
    </section>
  );
}
