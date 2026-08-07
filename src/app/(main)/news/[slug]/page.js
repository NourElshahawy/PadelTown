import { notFound } from "next/navigation";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import NewsArticleHeader from "@/_pages/news/NewsArticleHeader";
import NewsArticleBody from "@/_pages/news/NewsArticleBody";
import NewsArticleSidebar from "@/_pages/news/NewsArticleSidebar";
import { getAllNews, getNewsById } from "@/services/newsService";
import "@/styles/pages/news.css";
import Link from "next/link";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getNewsById(slug);
  if (!article) return {};
  return {
    title: `${article.title} — InstaPadel`,
    description: article.excerpt,
  };
}

export default async function NewsArticlePage({ params }) {
  const { slug } = await params;
  const article = await getNewsById(slug);
  if (!article) notFound();

  return (
    <main className="details-hero">
      <div className="container">
        <div className="breadcrumb-ph" data-aos="fade-up">
          <Link href="/">الرئيسية</Link>
          <i className="fa-solid fa-angles-right"></i>
          <Link href="/news">الأخبار</Link>
          <i className="fa-solid fa-angles-right"></i>
          <span>{article.title}</span>
        </div>
        <div className="article-layout" data-aos="fade-up">
          <div className="article-layout-image">
            <ImageWithFallback src={article.image} alt={article.title} />
          </div>

          <div className="article-layout-content">
            <NewsArticleHeader article={article} />
            <NewsArticleBody body={article.body} />
            <NewsArticleSidebar sidebar={article.sidebar} />
          </div>
        </div>
      </div>
    </main>
  );
}
