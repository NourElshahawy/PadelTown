import { sendNewsPublishedEmail } from "@/lib/sendEmail";
import { createClient } from "@/lib/supabase/server";
import { insertNotifications } from "@/services/notificationService";

export async function POST(request) {
  const body = await request.json();
  const { title, body: newsBody, newsId } = body;

  const supabase = await createClient();
  const { data: users } = await supabase.from("profiles").select("id, email").not("email", "is", null);

  if (!users || users.length === 0) return Response.json({ success: true, sent: 0 });

  // بعت الإيميلات وحدة وحدة، عشان لو واحد فشل ميوقفش الباقي
  const results = await Promise.allSettled(users.map((u) => sendNewsPublishedEmail(u.email, { title, body: newsBody })));
  const sentCount = results.filter((r) => r.status === "fulfilled").length;

  await insertNotifications(
    supabase,
    users.map((u) => u.id),
    {
      type: "news_published",
      title: `خبر جديد: ${title}`,
      body: (newsBody || "").slice(0, 100),
      link: `/news/${newsId}`,
    },
  );

  return Response.json({ success: true, sent: sentCount, total: users.length });
}
