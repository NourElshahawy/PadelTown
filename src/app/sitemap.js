import { getAllCourts } from "@/services/courtService";
import { getAllNews } from "@/services/newsService";
import { SITE_URL } from "@/lib/siteConfig";

const BASE_URL = SITE_URL;

export default async function sitemap() {
  const courts = (await getAllCourts()) ?? [];
  const news = (await getAllNews()) ?? [];

  const staticRoutes = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/courts`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tournaments`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/find-partner`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

const uniqueSlugs = [...new Set(courts.map((c) => c.slug))];
const courtRoutes = uniqueSlugs.map((slug) => ({
  url: `${BASE_URL}/booking/${slug}`,
  lastModified: new Date(),
  changeFrequency: "daily",
  priority: 0.7,
}));

  const newsRoutes = news.map((article) => ({
    url: `${BASE_URL}/news/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [...staticRoutes, ...courtRoutes, ...newsRoutes];
}