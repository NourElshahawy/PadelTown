import Link from "next/link";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { getHomeNews } from "@/services/homeService";

export default async function NewsSection() {
  const news = await getHomeNews();

  if (!news) return null; // مفيش أخبار خالص، السكشن ميتعرضش

  return (
    <section className="news-section section" id="news">
      <div className="courts-overlay" />
      <div className="container">
        <div className="section-head" data-aos="fade-up">
          <div>
            <span className="eyebrow">الأخبار &amp; البطولات</span>
            <h2 className="section-title mt-3">
              ما الذي يحدث في <span className="accent-underline">الملاعب؟</span>
            </h2>
          </div>
          <p className="section-sub">إعلانات البطولات، وتحديثات الأندية، وأخبار الملاعب من جميع أنحاء المنصورة - يتم نشرها فور حدوثها.</p>
        </div>

        <div className="row g-4 mt-3">
          <div className="col-lg-7" data-aos="fade-up">
            <div className="news-featured">
              <Link href={news.featured.href} className="more-details">
                لتفاصيل اكثر <i className="fa-solid fa-circle-arrow-left" />
              </Link>
              <ImageWithFallback src={news.featured.image} alt={news.featured.title} />
              <div className="news-featured-content">
                <span className={`news-tag news-tag-${news.featured.tag}`}>{news.featured.tagLabel}</span>
                <h3>{news.featured.title}</h3>
                <p>{news.featured.excerpt}</p>
                <span className="news-date">
                  <i className="fa-solid fa-calendar-days" /> {news.featured.date}
                </span>
              </div>
            </div>
          </div>

          <div className="col-lg-5 d-flex flex-column gap-3">
            {news.items.map((item, i) => (
              <Link href={item.href} className="news-item" data-aos="fade-up" data-aos-delay={80 + i * 60} key={item.id}>
                <ImageWithFallback src={item.image} alt={item.title} />
                <div className="news-item-content">
                  <span className={`news-tag news-tag-${item.tag}`}>{item.tagLabel}</span>
                  <h4>{item.title}</h4>
                  <span className="news-date">{item.date}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-5" data-aos="fade-up">
          <Link href="/news" className="btn btn-ghost">
            اكتشف جميع الأخبار <i className="fa-solid fa-arrow-left" />
          </Link>
        </div>
      </div>
    </section>
  );
}
