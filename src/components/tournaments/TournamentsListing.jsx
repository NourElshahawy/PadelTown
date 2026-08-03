"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import TournamentFilterBar from "./TournamentFilterBar";
import EmptyState from "@/components/shared/EmptyState";
import ListingHero from "@/components/shared/ListingHero";

const STATUS_LABELS = {
  registration: "التسجيل مفتوح",
  ready: "التسجيل اكتمل",
  live: "جارية الآن",
  completed: "انتهت",
};

const DEFAULT_FILTERS = { venue: "all", date: "", status: "active" };

export default function TournamentsListing({ tournaments }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const venues = useMemo(() => [...new Set(tournaments.map((t) => t.venue))], [tournaments]);

  const filtered = useMemo(() => {
    return tournaments.filter((t) => {
      const matchesVenue = filters.venue === "all" || t.venue === filters.venue;
      const matchesDate = !filters.date || t.date === filters.date;
      const matchesStatus = filters.status === "all" || (filters.status === "active" && t.status !== "completed") || (filters.status === "completed" && t.status === "completed");
      return matchesVenue && matchesDate && matchesStatus;
    });
  }, [tournaments, filters]);

  return (
    <>
      <ListingHero title="بطولات البادل في المنصورة" count={filtered.length} breadcrumbLabel="البطولات" />

      <section className="courts-section section" id="tournaments">
        <div className="courts-overlay" />
        <div className="container">
          <TournamentFilterBar venues={venues} filters={filters} setFilters={setFilters} />

          {filtered.length > 0 ? (
            <div className="row g-4">
              {filtered.map((t) => (
                <div className="col-md-6 col-lg-4" key={t.id} data-aos="fade-up">
                  <div className="tournament-list-card">
                    <span className={`tournament-list-badge ${t.status}`}>{STATUS_LABELS[t.status]}</span>
                    <h3>{t.name}</h3>
                    <div className="tournament-list-meta">
                      <span>
                        <i className="fa-solid fa-location-dot" /> {t.venue}
                      </span>
                      <span>
                        <i className="fa-solid fa-calendar-days" />{" "}
                        {new Date(t.date).toLocaleDateString("ar-EG", {
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                      <span>
                        <i className="fa-solid fa-users"></i> {t.teams.length} / {t.maxTeams} فرق
                      </span>
                    </div>
                    <Link href={`/tournaments/${t.id}`} className="btn btn-accent btn-sm btn-block">
                      {t.status === "completed" ? "شوف البطل والنتيجة" : "التفاصيل"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="مفيش بطولات مطابقة دلوقتي" text="جرب تغيّر الفلاتر، أو كن أول واحد ينشئ بطولة لهذا الملعب." buttonLabel="مسح الفلاتر" onClear={() => setFilters(DEFAULT_FILTERS)} />
          )}

          <div className="text-center mt-5">
            <Link href="/tournaments/create" className="btn btn-ghost">
              أنشئ بطولتك <i className="fa-solid fa-arrow-left" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
