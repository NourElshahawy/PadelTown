import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookingHistorySection from "@/components/pages/profile/BookingHistorySection";
import TournamentsSection from "@/components/pages/profile/TournamentsSection";
import PartnerRequestsSection from "@/components/pages/profile/PartnerRequestsSection";
import { getMyTournaments, getMyPartnerRequests } from "@/services/profileService";
import AvatarEditor from "@/components/pages/profile/AvatarEditor";
import PhoneEditor from "@/components/pages/profile/PhoneEditor";
// import "@/styles/pages/profile.css";

export const metadata = { title: "الملف الشخصي — InstaPadel" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("name, phone, role, avatar_url").eq("id", user.id).single();
  const [{ data: bookings }, tournaments, partnerRequests] = await Promise.all([
    supabase.from("bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    getMyTournaments(user.id),
    getMyPartnerRequests(user.id),
  ]);

  return (
    <div className="profile-page" dir="rtl">
      <div className="profile-header">
        <AvatarEditor userId={user.id} name={profile?.name} avatarUrl={profile?.avatar_url} />
        <div>
          <h1>{profile?.name}</h1>
          <p>
            {user.email} · <PhoneEditor userId={user.id} phone={profile?.phone} />
          </p>
        </div>
      </div>

      <BookingHistorySection bookings={bookings || []} currentUserId={user.id} />
      <TournamentsSection tournaments={tournaments} />
      <PartnerRequestsSection requests={partnerRequests} />
    </div>
  );
}
