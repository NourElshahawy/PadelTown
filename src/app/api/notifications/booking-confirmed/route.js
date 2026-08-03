import { sendBookingConfirmationEmail } from "@/lib/sendEmail";
import { createClient } from "@/lib/supabase/server";
import { insertNotification } from "@/services/notificationService";

export async function POST(request) {
  const body = await request.json();
  const { email, userId, courtId, ...data } = body;

  if (!email) return Response.json({ error: "Missing email" }, { status: 400 });

  await sendBookingConfirmationEmail(email, data);

  // إشعارات داخل الموقع: لليوزر صاحب الحجز ولصاحب الملعب
  try {
    const supabase = await createClient();

    if (userId) {
      await insertNotification(supabase, {
        userId,
        type: "booking_confirmed",
        title: "تم تأكيد حجزك ✅",
        body: `${data.venueName} — ${data.courtName} — ${data.date} الساعة ${data.time}`,
        link: "/profile",
      });
    }

    if (courtId) {
      const { data: courtRow } = await supabase.from("courts").select("venue_id").eq("id", courtId).maybeSingle();
      if (courtRow?.venue_id) {
        const { data: venueRow } = await supabase.from("venues").select("owner_id").eq("id", courtRow.venue_id).maybeSingle();
        if (venueRow?.owner_id) {
          await insertNotification(supabase, {
            userId: venueRow.owner_id,
            type: "new_booking",
            title: "حجز جديد على ملعبك",
            body: `${data.venueName} — ${data.courtName} — ${data.date} الساعة ${data.time}`,
            link: "/owner/dashboard/bookings",
          });
        }
      }
    }
  } catch (e) {
    console.error("booking notification failed:", e.message);
  }

  return Response.json({ success: true });
}
