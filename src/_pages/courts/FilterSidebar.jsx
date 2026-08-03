"use client";

const RATINGS = [0, 4.5, 4.8];

export default function FilterSidebar({
  filters,
  setFilters,
  onClear,
  isOpen,
}) {
  const { maxPrice, minRating, searchQuery } = filters;

  return (
    <div className={`col-lg-3 filter-sidebar-col ${isOpen ? "is-open" : ""}`}>
      <div className="filter-card" data-aos="fade-up">
        <div className="filter-head">
          <h3>الفلترة</h3>
          <span className="clear-filters" onClick={onClear}>
            مسح الكل
          </span>
        </div>

        <div className="filter-group">
          <span className="filter-label">البحث عن ملعب</span>
          <div className="search-input-wrap">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input type="text" className="filter-search-input" placeholder="اكتب اسم الملعب..." value={searchQuery} onChange={(e) => setFilters((f) => ({ ...f, searchQuery: e.target.value }))} />
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">السعر للساعة</span>
          <div className="range-value">
            <span>٢٠٠ ج.م</span>
            <span>{maxPrice} ج.م</span>
          </div>
          <input
            type="range"
            className="range-slider"
            min="0"
            max={filters.maxPossiblePrice || 500}
            step="10"
            value={maxPrice}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
          />{" "}
        </div>

        <div className="filter-group">
          <span className="filter-label">الحد الأدنى للتقييم</span>
          <div className="chip-select">
            {RATINGS.map((r) => (
              <span key={r} className={`chip-option ${minRating === r ? "is-active" : ""}`} onClick={() => setFilters((f) => ({ ...f, minRating: r }))}>
                {r === 0 ? "أي" : `${r}+`}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
