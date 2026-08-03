import Link from "next/link";
// import "@/styles/pages/courts.css";

export default function ListingHero({ title, count, breadcrumbLabel }) {
  return (
    <section className="listing-hero">
      <div className="container">
        <div className="breadcrumb-ph" data-aos="fade-up">
          <Link href="/">الرئيسية</Link>
          <i className="fa-solid fa-chevron-right"></i>
          <span>{breadcrumbLabel}</span>
        </div>
        <h1 data-aos="fade-up">{title}</h1>
        <p className="results-count">
          <b>{count}</b> {count === 1 ? "نتيجة متاحة" : "نتائج متاحة"}
        </p>
      </div>
    </section>
  );
}
