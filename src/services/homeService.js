import { getAllNews } from "./newsService";

export async function getHomeNews() {
  const news = await getAllNews();
  if (news.length === 0) return null;

  const featured = news[0];
  const items = news.slice(1, 4);

  return {
    featured: { ...featured, href: `/news/${featured.slug}` },
    items: items.map((n) => ({ ...n, href: `/news/${n.slug}` })),
  };
}
