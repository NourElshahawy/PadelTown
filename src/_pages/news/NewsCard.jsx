import Link from "next/link";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

export default function NewsCard({ article }) {
  return (
    <Link href={`/news/${article.slug}`} className="news-card">
      <div className="news-card-media">
        <span className={`news-tag news-tag-${article.category}`}>{article.categoryLabel}</span>
        <ImageWithFallback src={article.image} alt={article.title} />
      </div>
      <div className="news-card-body">
        <h3>{article.title}</h3>
        <p className="news-card-excerpt">{article.excerpt}</p>
        <div className="news-card-foot">
          <span className="news-date">{article.date}</span>
          <span className="read-more-link">
            اقرأ <i className="fa-solid fa-arrow-right"></i>
          </span>
        </div>
      </div>
    </Link>
  );
}
