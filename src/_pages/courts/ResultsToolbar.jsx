"use client";

const SORT_OPTIONS = [
  { value: "recommended", label: "ترتيب حسب: الموصى بها" },
  { value: "price-asc", label: "ترتيب حسب: السعر (من الأقل للأعلى)" },
  { value: "price-desc", label: "ترتيب حسب: السعر (من الأعلى للأقل)" },
  { value: "rating", label: "ترتيب حسب: الأعلى تقييماً" },
];

export default function ResultsToolbar({ count, sortMode, setSortMode }) {
  return (
    <div className="results-toolbar">
      <span className="count">
        <b>{count}</b> ملاعب متاحة
      </span>
      <select className="sort-select" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
