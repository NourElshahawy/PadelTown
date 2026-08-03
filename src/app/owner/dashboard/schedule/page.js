import { createClient } from "@/lib/supabase/server";
import { getOwnerScheduleData } from "@/services/ownerScheduleService";
import ScheduleManager from "@/components/owner-dashboard/ScheduleManager";

export default async function OwnerSchedulePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { courts, days, bookings, blockedSlots } = await getOwnerScheduleData(user.id);

  return (
    <>
      <h1 className="owner-page-title">الجدول</h1>
      <div className="owner-card">
        <p style={{ color: "var(--text-faint)", fontSize: ".85rem", marginBottom: 16 }}>
          اقفل أي ساعة يدويًا (صيانة، مناسبة خاصة...) والزباين مش هيقدروا يحجزوها. الساعات المحجوزة فعليًا من الزباين مش قابلة للتعديل من هنا.
        </p>
        <ScheduleManager courts={courts} days={days} initialBookings={bookings} initialBlockedSlots={blockedSlots} />
      </div>
    </>
  );
}
