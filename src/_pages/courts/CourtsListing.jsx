"use client";
import { useMemo, useState } from "react";
import CourtCard from "@/components/courts/CourtCard";
import ListingHero from "../../components/shared/ListingHero";
import FilterSidebar from "./FilterSidebar";
import ResultsToolbar from "./ResultsToolbar";
import Pagination from "@/components/shared/Pagination";
import EmptyState from "@/components/shared/EmptyState";
// import "@/styles/pages/courts.css";
import ParallaxBg from "@/components/ui/ParallaxBg";

const PAGE_SIZE = 6;
const DEFAULT_FILTERS = { maxPrice: 300, minRating: 0, sportType: "all" };

export default function CourtsListing({ courts , searchFilters }) {
  const highestPrice = Math.max(...courts.map((c) => c.pricePerHour), 200);

  const [filters, setFilters] = useState({
    maxPrice: highestPrice,
    minRating: 0,
    searchQuery: "",
    sportType: "all",
  });
  const [sortMode, setSortMode] = useState("recommended");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCourts = useMemo(() => {
    const query = filters.searchQuery.trim().toLowerCase();
    let list = courts.filter((c) => {
      const matchesPrice = c.pricePerHour <= filters.maxPrice;
      const matchesRating = c.rating >= filters.minRating;
      const matchesSearch = !query || c.name.toLowerCase().includes(query);
      const matchesSport = filters.sportType === "all" || c.sportType === filters.sportType;
      return matchesPrice && matchesRating && matchesSearch && matchesSport;
    });

    if (sortMode === "price-asc") list = [...list].sort((a, b) => a.pricePerHour - b.pricePerHour);
    if (sortMode === "price-desc") list = [...list].sort((a, b) => b.pricePerHour - a.pricePerHour);
    if (sortMode === "rating") list = [...list].sort((a, b) => b.rating - a.rating);

    return list;
  }, [courts, filters, sortMode]);

  const totalPages = Math.max(1, Math.ceil(filteredCourts.length / PAGE_SIZE));
  const paginatedCourts = filteredCourts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSetFilters = (updater) => {
    setFilters(updater);
    setCurrentPage(1);
  };

  const handleSetSort = (mode) => {
    setSortMode(mode);
    setCurrentPage(1);
  };

  const clearAll = () => {
    setFilters({ maxPrice: highestPrice, minRating: 0, searchQuery: "", sportType: "all" });
    setSortMode("recommended");
    setCurrentPage(1);
  };

// const PERIOD_LABELS = { morning: "صباحًا", noon: "ظهرًا", afternoon: "عصرًا", evening: "مساءً", night: "ليلاً" };
  return (
    <>
      <ListingHero title="ملاعب InstaPadel" count={filteredCourts.length} breadcrumbLabel="الملاعب" />
      {searchFilters?.date && (
        <div className="container" style={{ marginTop: -20, marginBottom: 20 }}>
          <div style={{ background: "var(--accent-soft)", border: "1px solid rgba(0,214,143,.3)", borderRadius: "var(--r-md)", padding: "12px 18px", fontSize: ".88rem", color: "var(--white)" }}>
            🔍 بتشوف الملاعب المتاحة يوم <b>{new Date(searchFilters.date).toLocaleDateString("ar-EG", { day: "numeric", month: "long" })}</b>
          </div>
        </div>
      )}

      <section className="courts-section section" id="courts">
        <ParallaxBg image="/assets/imgs/courts-bg.png" />
        <div className="courts-overlay" />
        <div className="container">
          <button className="filter-toggle-mobile mb-4" onClick={() => setIsFilterOpen((v) => !v)}>
            <i className="fa-solid fa-sliders"></i>
            الفلترة
          </button>

          <div className="row g-4">
            <FilterSidebar filters={filters} setFilters={handleSetFilters} onClear={clearAll} isOpen={isFilterOpen} />

            <div className="col-lg-9">
              <ResultsToolbar count={filteredCourts.length} sortMode={sortMode} setSortMode={handleSetSort} />

              {paginatedCourts.length > 0 ? (
                <div className="row g-4">
                  {paginatedCourts.map((court, i) => (
                    <div className="col-md-6 col-xl-4" data-aos="fade-up" data-aos-delay={(i % 3) * 60} key={court.id}>
                      <CourtCard court={court} />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="لا توجد ملاعب تطابق هذه الفلترة" text="حاول توسيع نطاق السعر أو إلغاء أحد الفلاتر — يتم إضافة ملاعب جديدة إلى InstaPadel كل أسبوع." onClear={clearAll} />
              )}

              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
