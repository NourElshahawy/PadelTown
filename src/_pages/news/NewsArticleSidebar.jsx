import Link from "next/link";

export default function NewsArticleSidebar({ sidebar }) {
  if (!sidebar) return null;

  return (
    <div className="info-card mb-4" data-aos="fade-up">
      <h3>{sidebar.title}</h3>
      {sidebar.rows.map((row) => (
        <div className="summary-row" key={row.label}>
          <span>{row.label}</span>
          <span>{row.value}</span>
        </div>
      ))}
      {sidebar.cta && (
        <Link href={sidebar.cta.href} className="btn btn-accent btn-block mt-4">
          {sidebar.cta.label}
        </Link>
      )}
    </div>
  );
}
