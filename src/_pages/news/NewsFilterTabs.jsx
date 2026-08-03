"use client";

const CATEGORIES = [
  { key: "all", label: "الكل" },
  { key: "tournament", label: "بطولة" },
  { key: "announcement", label: "إعلان" },
  { key: "maintenance", label: "صيانة" },
  { key: "partnership", label: "شراكة" },
];

export default function NewsFilterTabs({ active, onChange }) {
  return (
    <div className="news-filter-row">
      {CATEGORIES.map((c) => (
        <span key={c.key} className={`chip-option ${active === c.key ? "is-active" : ""}`} onClick={() => onChange(c.key)}>
          {c.label}
        </span>
      ))}
    </div>
  );
}
