function groupByRound(matches = []) {
  return matches.reduce((acc, m) => {
    acc[m.round] = acc[m.round] || [];
    acc[m.round].push(m);
    return acc;
  }, {});
}

export default function MatchesList({ matches = [], stage }) {
  const grouped = groupByRound(matches);
  const rounds = Object.keys(grouped);

  if (rounds.length === 0) {
    return (
      <section className="td-matches">
        <h3 className="td-section-title">Round 1</h3>
        <p className="td-empty">
          لم يتم إنشاء المباريات بعد.
          <br />
          سيتم توليد الجدول تلقائياً عند اكتمال الفرق.
        </p>
      </section>
    );
  }

  return (
    <section className="td-matches">
      <h3 className="td-section-title">{stage === "completed" ? "النتائج النهائية" : "المباريات"}</h3>
      {rounds.map((round) => (
        <div key={round} className="td-round">
          <h4 className="td-round-title">{round}</h4>
          <div className="td-round-matches">
            {grouped[round].map((m) => (
              <div key={m.id} className={`td-match-card ${m.isLive ? "is-live" : ""}`}>
                {m.isLive && (
                  <span className="td-match-live-tag">
                    <span className="td-live-dot" aria-hidden="true" />
                    مباشر
                  </span>
                )}
                <div className="td-match-row">
                  <span className="td-match-team team1">{m.teamA}</span>
                  {m.isDone || m.isLive ? (
                    <span className="td-match-score">
                      {m.scoreA} : {m.scoreB}
                    </span>
                  ) : (
                    <span className="td-match-vs">VS</span>
                  )}
                  <span className="td-match-team team2">{m.teamB}</span>
                </div>
                {!m.isDone && !m.isLive && m.time && <span className="td-match-time">🕗 {m.time}</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
