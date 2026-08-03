import { createClient } from "@/lib/supabase/server";

export async function getAllNews() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("news").select("*").eq("status", "published").order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapNews);
}

export async function getNewsById(id) {
  const supabase = await createClient();
  const { data } = await supabase.from("news").select("*").eq("id", id).eq("status", "published").single();
  return data ? mapNews(data) : null;
}

const CATEGORY_LABELS = { tournament: "بطولة", partnership: "شراكة", announcement: "إعلان", maintenance: "صيانة" };

function mapNews(n) {
  const sourceLink = n.source_type === "partner_request" ? `/find-partner/${n.source_id}`
    : n.source_type === "tournament" ? `/tournaments/${n.source_id}`
    : null;

  return {
    id: n.id,
    slug: n.id,
    category: n.category,
    categoryLabel: CATEGORY_LABELS[n.category] || "إعلان",
    title: n.title,
    excerpt: n.body?.slice(0, 120) || "",
    date: new Date(n.created_at).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }),
    image: n.image_url || "/assets/imgs/courts-bg.png",
    featured: false,
    meta: {},
    body: [{ type: "paragraph", text: n.body || "" }],
    sourceLink, // ← جديد
    sidebar: sourceLink
      ? { title: "تفاصيل الطلب", rows: [], cta: { label: n.source_type === "partner_request" ? "اضغط للانضمام" : "شوف البطولة", href: sourceLink } }
      : null,
  };
}