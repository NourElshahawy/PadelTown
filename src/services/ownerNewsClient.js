"use client";
import { createClient } from "@/lib/supabase/client";

export async function submitOwnerNews(authorId, title, body, imageFile) {
  const supabase = createClient();

  let imageUrl = null;
  if (imageFile) {
    const path = `news/${Date.now()}-${Math.random().toString(36).slice(2)}.${imageFile.name.split(".").pop() || "jpg"}`;
    const { error: uploadError } = await supabase.storage.from("venue-photos").upload(path, imageFile);
    if (!uploadError) {
      const { data: publicUrl } = supabase.storage.from("venue-photos").getPublicUrl(path);
      imageUrl = publicUrl.publicUrl;
    }
  }

  const { data, error } = await supabase
    .from("news")
    .insert({
      source_type: "owner_post",
      author_id: authorId,
      title,
      body,
      category: "maintenance",
      status: "published",
      image_url: imageUrl,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function deleteOwnerNews(newsId) {
  const supabase = createClient();
  const { error } = await supabase.from("news").delete().eq("id", newsId);
  if (error) throw error;
}