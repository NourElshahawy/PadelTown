import { createClient } from "@/lib/supabase/server";
import OwnerNewsForm from "@/components/owner-dashboard/OwnerNewsForm";
import OwnerNewsList from "@/components/owner-dashboard/OwnerNewsList";

export default async function OwnerNewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: myNews } = await supabase.from("news").select("*").eq("author_id", user.id).eq("source_type", "owner_post").order("created_at", { ascending: false });

  return (
    <>
      <h1 className="owner-page-title">الأخبار والإعلانات</h1>
      <OwnerNewsForm authorId={user.id} />

      <div className="owner-card">
        <h2 className="owner-card-title">أخباري</h2>
        <OwnerNewsList initialNews={myNews || []} />
      </div>
    </>
  );
}
