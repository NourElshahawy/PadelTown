import Link from "next/link";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

export default function NewsFeatureBanner({ article }) {
  return (
    <div className="news-feature-banner" data-aos="fade-up">
      <div className="news-feature-media">
        <span className={`news-tag news-tag-${article.category}`}>{article.categoryLabel}</span>
        <ImageWithFallback src={article.image} alt={article.title} />
      </div>
      <div className="news-feature-info">
        <span className="eyebrow">مميز</span>
        <h2>{article.title}</h2>
        <p>{article.excerpt}</p>
        <span className="news-date">
          <i className="fa-solid fa-calendar-days" /> {article.date}
        </span>
        <Link href={`/news/${article.slug}`} className="btn btn-accent btn-sm" style={{ width: "fit-content" }}>
          اقرأ القصة كاملة
          <i className="fa-solid fa-arrow-left " style={{color: "#fff" }}></i>
        </Link>
      </div>
    </div>
  );
}
