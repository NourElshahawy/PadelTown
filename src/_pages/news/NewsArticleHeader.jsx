export default function NewsArticleHeader({ article }) {
  return (
    <div className="article-header" data-aos="fade-up">
      <span className={`news-tag news-tag-${article.category}`}>{article.categoryLabel}</span>
      <h1 className="mt-3">{article.title}</h1>
      <div className="details-meta mt-3">
        <span className="item">
          <i className="fa-solid fa-calendar-days" /> {article.date}
        </span>
        {article.meta?.location && (
          <span className="item">
            <i className="fa-solid fa-location-dot" /> {article.meta.location}
          </span>
        )}
        {article.meta?.readTime && (
          <span className="item">
            <i className="fa-regular fa-clock"></i>
            {article.meta.readTime}
          </span>
        )}
      </div>
    </div>
  );
}
