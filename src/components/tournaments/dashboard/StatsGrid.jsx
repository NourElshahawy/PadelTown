export default function StatsGrid({ tournament }) {
  const stats = [
    { icon: "👥", value: tournament.teams?.length ?? 0, label: "فرق" },
    { icon: "🎾", value: tournament.matches?.length ?? 0, label: "مباريات" },
    { icon: "🏆", value: tournament.champion?.teamName ?? "—", label: "البطل" },
    { icon: "⏳", value: tournament.matches?.filter((m) => !m.isDone).length ?? 0, label: "متبقي" },
  ];

  return (
    <section className="td-stats">
      {stats.map((s) => (
        <div key={s.label} className="td-stat-card">
          <span className="td-stat-icon" aria-hidden="true">
            {s.icon}
          </span>
          <span className="td-stat-value">{s.value}</span>
          <span className="td-stat-label">{s.label}</span>
        </div>
      ))}
    </section>
  );
}
