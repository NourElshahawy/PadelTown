export default function StatusTimeline({ steps = [] }) {
  if (steps.length === 0) return null;

  return (
    <section className="td-timeline">
      <h3 className="td-section-title">مراحل البطولة</h3>
      <ol className="td-timeline-list">
        {steps.map((step, i) => (
          <li key={i} className={`td-timeline-item ${step.done ? "is-done" : step.active ? "is-active" : "is-pending"}`}>
            <span aria-hidden="true">{step.done ? "✅" : step.active ? "🟢" : "⌛"}</span>
            <span className="td-timeline-text">{step.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
