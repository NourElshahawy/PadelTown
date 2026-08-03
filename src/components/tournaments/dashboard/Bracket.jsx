export default function Bracket({ rounds = [], matches = [] }) {
  if (rounds.length === 0) return null;

  const winnerOfRound = (round) => {
    const done = matches.filter((m) => m.round === round && m.isDone);
    if (done.length === 0) return null;
    return done.map((m) => (m.scoreA > m.scoreB ? m.teamA : m.teamB)).join(" · ");
  };

  return (
    <section className="td-bracket">
      <h3 className="td-section-title">🏆 مسار البطولة</h3>
      <div className="td-bracket-rail">
        {rounds.map((round, i) => (
          <div key={round} className="td-bracket-step">
            <div className={`td-bracket-card ${i === rounds.length - 1 ? "is-final" : ""}`}>
              <span className="td-bracket-round">{round}</span>
              <span className="td-bracket-result">{winnerOfRound(round) || "لم تُحسم بعد"}</span>
            </div>
            {i < rounds.length - 1 && (
              <span className="td-bracket-arrow" aria-hidden="true">
                ↓
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
