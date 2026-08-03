"use client";

export default function TournamentFilterBar({ venues, filters, setFilters }) {
  return (
    <div className="partner-filter-bar">
      <div className="field-input-wrap">
        <select className="field-input" value={filters.venue} onChange={(e) => setFilters((f) => ({ ...f, venue: e.target.value }))}>
          <option value="all">كل الملاعب</option>
          {venues.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="field-input-wrap">
        <input type="date" className="field-input" value={filters.date} onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))} />
      </div>

      <div className="field-input-wrap">
        <select className="field-input" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
          <option value="active">البطولات النشطة فقط</option>
          <option value="completed">المنتهية فقط</option>
          <option value="all">الكل</option>
        </select>
      </div>
    </div>
  );
}
