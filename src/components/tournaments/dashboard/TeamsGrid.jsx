export default function TeamsGrid({ teams = [] }) {
  if (teams.length === 0) {
    return (
      <section className="td-teams">
        <h3 className="td-section-title">👥 الفرق المشاركة</h3>
        <p className="td-empty">لسه محدش اشترك، كن أول فريق ينضم للبطولة.</p>
      </section>
    );
  }

  return (
    <section className="td-teams">
      <h3 className="td-section-title">👥 الفرق المشاركة</h3>
      <div className="td-teams-grid">
        {teams.map((team) => (
          <div key={team.id} className="td-team-card">
            <div className="td-team-head">
              <span className="td-team-name">{team.name}</span>
              <span className={`td-team-status td-team-status--${team.status === "confirmed" ? "ok" : "pending"}`}>{team.status === "confirmed" ? "جاهز" : "بانتظار التأكيد"}</span>
            </div>
            <p className="td-team-captain">الكابتن: {team.captainName}</p>
            <div className="td-team-rating">
              {"⭐".repeat(Math.round(team.rating || 0))}
              {"☆".repeat(5 - Math.round(team.rating || 0))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
