import { sendBookingCancelledEmail } from "@/lib/sendEmail";
import { createClient } from "@/lib/supabase/server";
import { insertNotification } from "@/services/notificationService";

export async function POST(request) {
  const body = await request.json();
  const { email, userId, ...data } = body;

  if (!email) return Response.json({ error: "Missing email" }, { status: 400 });

  await sendBookingCancelledEmail(email, data);

  try {
    const supabase = await createClient();
    if (userId) {
      await insertNotification(supabase, {
        userId,
        type: "booking_cancelled",
        title: `تم إلغاء حجزك في ${data.venueName}`,
        body: `${data.date} · ${data.time}`,
        link: null,
      });
    }
  } catch (err) {
    console.error("Failed to insert cancellation notification:", err);
  }

  return Response.json({ success: true });
}
