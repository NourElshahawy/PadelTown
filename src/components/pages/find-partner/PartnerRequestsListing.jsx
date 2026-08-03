"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import PartnerFilterBar from "./PartnerFilterBar";
import PartnerRequestCard from "./PartnerRequestCard";
import EmptyState from "@/components/shared/EmptyState";
// import "@/styles/pages/find-partner.css";
import ParallaxBg from "@/components/ui/ParallaxBg";
import ListingHero from "@/components/shared/ListingHero";

const DEFAULT_FILTERS = { courtId: "all", date: "", level: "all", status: "active" };

export default function PartnerRequestsListing({ requests, courts }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchesCourt = filters.courtId === "all" || r.courtId === filters.courtId;
      const matchesDate = !filters.date || r.date === filters.date;
      const matchesLevel = filters.level === "all" || r.level === filters.level;
      const matchesStatus = filters.status === "all" || (filters.status === "active" && r.status !== "matched") || (filters.status === "completed" && r.status === "matched");
      return matchesCourt && matchesDate && matchesLevel && matchesStatus;
    });
  }, [requests, filters]);

  return (
    <>
      <ListingHero titlehead="البحث عن شريك" title="دور على شريك للعب" count={filtered.length} />

      <section className="courts-section section">
        <ParallaxBg image="/assets/imgs/courts-bg.png" />
        <div className="courts-overlay" />
        <div className="container">
          <PartnerFilterBar courts={courts} filters={filters} setFilters={setFilters} />

          {filtered.length > 0 ? (
            <div className="row g-4">
              {filtered.map((r) => (
                <div className="col-md-6 col-lg-4" key={r.id} data-aos="fade-up">
                  <PartnerRequestCard request={r} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="مفيش طلبات مطابقة دلوقتي" text="جرب تغيّر الفلاتر، أو كن أول واحد ينشئ طلب لهذا الموعد." buttonLabel="مسح الفلاتر" onClear={() => setFilters(DEFAULT_FILTERS)} />
          )}
        </div>
      </section>

      <Link href="/find-partner/create" className="create-request-fab">
        <i className="fa-solid fa-plus" style={{ color: "#000" }} /> إنشاء طلب
      </Link>
    </>
  );
}
