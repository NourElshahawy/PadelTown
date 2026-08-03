import { createClient } from "@/lib/supabase/server";
import OwnerNewsManager from "@/components/owner-dashboard/OwnerNewsManager";

export default async function OwnerNewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: myNews } = await supabase.from("news").select("*").eq("author_id", user.id).eq("source_type", "owner_post").order("created_at", { ascending: false });

  return (
    <>
      <h1 className="owner-page-title">الأخبار والإعلانات</h1>
      <OwnerNewsManager authorId={user.id} initialNews={myNews || []} />
    </>
  );
}
