const STEPS = [
  { id: 1, label: "اختر الملعب" },
  { id: 2, label: "اختر اليوم" },
  { id: 3, label: "اختر الوقت" },
];

export default function StepBar({ hasCourtSub, hasDate, hasTime }) {
  const doneFlags = [hasCourtSub, hasDate, hasTime];

  return (
    <div className="step-bar">
      {STEPS.map((step, i) => (
        <div key={step.id} style={{ display: "contents" }}>
          <div className={`step-item ${!doneFlags[i] && (i === 0 || doneFlags[i - 1]) ? "active" : ""} ${doneFlags[i] ? "done" : ""}`}>
            <div className="step-circle">{step.id}</div>
            <span>{step.label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`step-line ${doneFlags[i] ? "done" : ""}`} />}
        </div>
      ))}
    </div>
  );
}
