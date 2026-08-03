export default function TeamsManageList({ teams }) {
  return (
    <div className="manage-section">
      <h3>👥 الفرق المسجلة ({teams.length})</h3>
      {teams.length === 0 ? (
        <p style={{ color: "var(--text-faint)", fontSize: ".86rem" }}>لسه محدش سجل.</p>
      ) : (
        teams.map((t) => (
          <div className="manage-team-row" key={t.id}>
            <b>{t.name}</b>
            <span>{t.captainPhone}</span>
          </div>
        ))
      )}
    </div>
  );
}
