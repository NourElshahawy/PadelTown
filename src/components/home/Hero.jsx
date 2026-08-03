"use client";
import Image from "next/image";
import "../../styles/home/hero.css";
import "../../styles/home/search.css";
import ParallaxBg from "../ui/ParallaxBg";
import { useState, useMemo } from "react";
import { buildDefaultSlots, buildNextSevenDays } from "@/services/courtLogic";
import QuickBookModal from "./QuickBookModal";

function addDaysISO(iso, days) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().split("T")[0];
}

const SLOTS = buildDefaultSlots(0);
// نرتب المواعيد تبدأ من 12 الضهر لحد 11 صباح اليوم اللي بعده، عشان أغلب حجوزات البادل بالليل
const ROTATED_SLOTS = [...SLOTS.slice(12), ...SLOTS.slice(0, 12)];

const DAYS = buildNextSevenDays(14);

const SPORTS = [
  { value: "all", label: "أي رياضة" },
  { value: "padel", label: "بادل" },
  { value: "football", label: "كورة قدم" },
  { value: "tennis", label: "تنس" },
];

export default function Hero() {
  const [dayIndex, setDayIndex] = useState(0);
  const [startIndex, setStartIndex] = useState(null);
  const [endIndex, setEndIndex] = useState(null);
  const [sportType, setSportType] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const selectedDay = DAYS[dayIndex];
  const hasValidRange = startIndex !== null && endIndex !== null;
  const spansNextDay = hasValidRange && endIndex >= 12;

  const selectedSlots = useMemo(() => {
    if (!selectedDay || !hasValidRange) return [];
    return ROTATED_SLOTS.slice(startIndex, endIndex + 1).map((s, i) => {
      const rotatedIndex = startIndex + i;
      const slotDate = rotatedIndex >= 12 ? addDaysISO(selectedDay.date, 1) : selectedDay.date;
      return { ...s, date: slotDate };
    });
  }, [selectedDay, startIndex, endIndex, hasValidRange]);

  const handleStartChange = (value) => {
    const i = value === "" ? null : Number(value);
    setStartIndex(i);
    if (i !== null && (endIndex === null || endIndex < i)) setEndIndex(i);
  };

  const handleEndChange = (value) => {
    setEndIndex(value === "" ? null : Number(value));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!hasValidRange) return;
    setShowModal(true);
  };

  return (
    <section className="hero">
      <span className="hero-shape s1" />
      <span className="hero-shape s2" />
      <span className="hero-shape s3" />
      <span className="hero-shape s4" />
      <ParallaxBg image="/assets/imgs/courts-bg.png" />

      <div className="container hero-content">
        <span className="hero-badge" data-aos="fade-up">
          <Image src="/assets/imgs/logo1-removebg-preview.png" className="pulse-img" alt="" width={20} height={20} />
          ملعب احترافي في قلب المنصورة
        </span>

        <h1 data-aos="fade-up" data-aos-delay="80">
          احجز ملعبك في
          <br />
          <span className="accent-underline">Ace Town</span>
        </h1>

        <p className="hero-sub" data-aos="fade-up" data-aos-delay="160">
          ملعبين بادل احترافيين، شوف المواعيد المتاحة فورًا واحجز مكانك في ثوانٍ.
        </p>

        <div className="search-card" data-aos="fade-up" data-aos-delay="240">
          <div className="search-card-label">
            <span className="pulse-dot" />
            ابحث عن ملعب متاح دلوقتي
          </div>

          <div className="search-grid">
            <div className="search-field">
              <label>
                <i className="fa-solid fa-person-running" /> الرياضة
              </label>
              <select value={sportType} onChange={(e) => setSportType(e.target.value)}>
                {SPORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="search-field">
              <label>
                <i className="fa-solid fa-calendar-days" /> اليوم
              </label>
              <select value={dayIndex} onChange={(e) => setDayIndex(Number(e.target.value))}>
                {DAYS.map((d, i) => (
                  <option key={d.date} value={i}>
                    {i === 0 ? "النهاردة" : i === 1 ? "بكرة" : `${d.dow} ${d.dom} ${d.month}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="search-field">
              <label>
                <i className="fa-solid fa-clock" /> من الساعة
              </label>
              <select value={startIndex ?? ""} onChange={(e) => handleStartChange(e.target.value)}>
                <option value="" disabled>
                  اختر الساعة
                </option>
                {ROTATED_SLOTS.map((s, i) => (
                  <option key={s.start} value={i}>
                    {s.start}
                  </option>
                ))}
              </select>
            </div>

            <div className="search-field">
              <label>
                <i className="fa-solid fa-clock" /> لحد الساعة
              </label>
              <select value={endIndex ?? ""} onChange={(e) => handleEndChange(e.target.value)}>
                <option value="" disabled>
                  اختر الساعة
                </option>
                {ROTATED_SLOTS.map((s, i) => (
                  <option key={s.end} value={i} disabled={startIndex !== null && i < startIndex}>
                    {s.end}
                  </option>
                ))}
              </select>
              {spansNextDay && <span className="search-field-hint">هيمتد بعد نص الليل لليوم اللي بعده</span>}
            </div>

            <button type="button" className="search-submit" onClick={handleSearch} disabled={!hasValidRange}>
              <i className="fa-solid fa-table-tennis-paddle-ball submit-icon"></i>
              <span className="submit-text">دور على ملعب</span>
            </button>
          </div>
        </div>
      </div>

      {showModal && <QuickBookModal slots={selectedSlots} sportType={sportType} onClose={() => setShowModal(false)} />}
    </section>
  );
}
