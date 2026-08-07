import NewsListing from "@/_pages/news/NewsListing";
import { getAllNews } from "@/services/newsService";

export const metadata = {
  title: "الأخبار والبطولات — InstaPadel",
  description: "آخر أخبار وتحديثات ملاعب البادل في المنصورة.",
};

export default async function NewsPage() {
  const news = await getAllNews();
  return <NewsListing news={news} />;
}
