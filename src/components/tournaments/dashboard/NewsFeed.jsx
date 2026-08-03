export default function NewsFeed({ items = [] }) {
  return (
    <section className="td-news">
      <h3 className="td-section-title">📢 آخر الأخبار</h3>
      <ul className="td-news-list">
        {items.map((item) => (
          <li key={item.id} className="td-news-item">
            <span className="td-news-text">{item.text}</span>
            {item.date && <span className="td-news-date">{item.date}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
