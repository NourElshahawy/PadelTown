// دوال مشتركة لإنشاء إشعارات داخل التطبيق.
// مصممة تشتغل مع أي supabase client (browser أو server)، فمفيش "use client"/"use server" هنا.

export async function insertNotification(supabase, { userId, type, title, body = null, link = null }) {
  if (!userId || !type || !title) return;

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body,
    link,
  });

  if (error) {
    console.error("insertNotification failed:", error.message);
  }
}

export async function insertNotifications(supabase, userIds, { type, title, body = null, link = null }) {
  const uniqueIds = [...new Set((userIds || []).filter(Boolean))];
  if (uniqueIds.length === 0 || !type || !title) return;

  const rows = uniqueIds.map((userId) => ({ user_id: userId, type, title, body, link }));
  const { error } = await supabase.from("notifications").insert(rows);

  if (error) {
    console.error("insertNotifications (bulk) failed:", error.message);
  }
}
