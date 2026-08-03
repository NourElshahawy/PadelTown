"use client";

const PERIODS = [
  { key: "", label: "أي وقت", range: null },
  { key: "morning", label: " صباحًا", range: "8ص - 12ظ" },
  { key: "noon", label: " ظهرًا", range: "12ظ - 4م" },
  { key: "afternoon", label: " عصرًا", range: "4م - 7م" },
  { key: "evening", label: " مساءً", range: "7م - 12م" },
  { key: "night", label: " ليلاً", range: "12م - 4ص" },
];

export default function TimePeriodChips({ value, onChange }) {
  return (
    <div className="time-chips-row">
      {PERIODS.map((p) => (
        <button key={p.key} type="button" className={`time-chip ${value === p.key ? "is-active" : ""}`} onClick={() => onChange(p.key)}>
          <span className="time-chip-label">{p.label}</span>
          {p.range && <span className="time-chip-range">{p.range}</span>}
        </button>
      ))}
    </div>
  );
}
