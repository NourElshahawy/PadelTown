export default function RegistrationProgress({ current, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  const complete = current >= max;

  return (
    <section className="td-progress">
      <div className="td-progress-track">
        <div className="td-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="td-progress-label">{complete ? "✅ اكتمل التسجيل" : `${current} من ${max} فرق`}</p>
    </section>
  );
}
