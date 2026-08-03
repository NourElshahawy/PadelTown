"use client";

const LEVELS = ["الكل", "مبتدئ", "متوسط", "محترف"];

export default function PartnerFilterBar({ courts, filters, setFilters }) {
  return (
    <div className="partner-filter-bar">
      <div className="field-input-wrap">
        <select className="field-input" value={filters.courtId} onChange={(e) => setFilters((f) => ({ ...f, courtId: e.target.value }))}>
          <option value="all">كل الملاعب</option>
          {courts.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field-input-wrap">
        <input type="date" className="field-input" value={filters.date} onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))} />
      </div>

      <div className="field-input-wrap">
        <select className="field-input" value={filters.level} onChange={(e) => setFilters((f) => ({ ...f, level: e.target.value }))}>
          {LEVELS.map((l) => (
            <option key={l} value={l === "الكل" ? "all" : l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div className="field-input-wrap">
        <select className="field-input" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
          <option value="active">الطلبات النشطة فقط</option>
          <option value="completed">المكتملة فقط</option>
          <option value="all">الكل</option>
        </select>
      </div>
    </div>
  );
}
