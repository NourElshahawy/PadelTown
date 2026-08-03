"use client";
import { createClient } from "@/lib/supabase/client";
import { insertNotification, insertNotifications } from "@/services/notificationService";

export async function createPartnerRequest(form, hostId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("partner_requests")
    .insert({
      host_id: hostId,
      court_id: form.courtId,
      court_name: form.courtName,
      request_date: form.date,
      time_label: form.time,
      level: form.level,
      players_needed: form.playersNeeded,
      notes: form.notes || null,
    })
    .select()
    .single();

  if (error) throw error;

  const { data: courtRow } = await supabase.from("courts").select("images, venue_id").eq("id", form.courtId).maybeSingle();

  let imageUrl = courtRow?.images?.[0] || null;
  if (!imageUrl && courtRow?.venue_id) {
    const { data: siblings } = await supabase.from("courts").select("images").eq("venue_id", courtRow.venue_id);
    imageUrl = siblings?.find((c) => c.images?.length > 0)?.images?.[0] || null;
  }

  await supabase.from("news").insert({
    source_type: "partner_request",
    source_id: data.id,
    author_id: hostId,
    title: `محتاج ${form.playersNeeded} ${form.playersNeeded === 1 ? "لاعب" : "لاعبين"} في ${form.courtName}`,
    body: `مستوى ${form.level} — ${form.date} الساعة ${form.time}. اضغط للانضمام.`,
    image_url: imageUrl,
    category: "announcement",
    status: "published",
  });

  return data;
}
export async function joinPartnerRequest(requestId, playerId) {
  const supabase = createClient();
  const { error } = await supabase.from("partner_request_joins").insert({ request_id: requestId, player_id: playerId });
  if (error) throw error;

  await supabase.from("partner_requests").update({ status: "partially_filled" }).eq("id", requestId).eq("status", "open");

  // إشعار لصاحب الطلب إن حد طلب الانضمام
  const [{ data: request }, { data: player }] = await Promise.all([
    supabase.from("partner_requests").select("host_id, court_name").eq("id", requestId).single(),
    supabase.from("profiles").select("name").eq("id", playerId).single(),
  ]);

  if (request?.host_id) {
    await insertNotification(supabase, {
      userId: request.host_id,
      type: "partner_join_request",
      title: `${player?.name || "لاعب"} طلب الانضمام لطلبك`,
      body: `طلب الانضمام لملعب ${request.court_name}`,
      link: `/find-partner/${requestId}`,
    });
  }
}

export async function respondToJoin(joinId, requestId, accept, playersNeeded) {
  const supabase = createClient();

  const { data: joinRow } = await supabase.from("partner_request_joins").select("player_id").eq("id", joinId).single();

  // نمنع القبول لو الفريق مكتمل بالفعل
  if (accept) {
    const { count: acceptedCount } = await supabase.from("partner_request_joins").select("*", { count: "exact", head: true }).eq("request_id", requestId).eq("status", "accepted");

    if ((acceptedCount || 0) >= playersNeeded) {
      const err = new Error("الفريق مكتمل بالفعل");
      err.code = "REQUEST_FULL";
      throw err;
    }
  }

  const { error } = await supabase
    .from("partner_request_joins")
    .update({ status: accept ? "accepted" : "rejected" })
    .eq("id", joinId);
  if (error) throw error;

  const { data: request } = await supabase.from("partner_requests").select("court_name").eq("id", requestId).single();

  // إشعار للاعب اللي طلب الانضمام: اتقبل ولا اتراض
  if (joinRow?.player_id) {
    await insertNotification(supabase, {
      userId: joinRow.player_id,
      type: accept ? "partner_join_accepted" : "partner_join_rejected",
      title: accept ? "تم قبولك في الطلب 🎉" : "تم رفض طلب انضمامك",
      body: request?.court_name ? `طلب ملعب ${request.court_name}` : null,
      link: `/find-partner/${requestId}`,
    });
  }

  if (accept) {
    const { count } = await supabase.from("partner_request_joins").select("*", { count: "exact", head: true }).eq("request_id", requestId).eq("status", "accepted");

    if (count >= playersNeeded) {
      const { data: fullRequest } = await supabase.from("partner_requests").select("host_id").eq("id", requestId).single();

      await supabase.from("partner_requests").update({ status: "matched" }).eq("id", requestId);

      // نحدّث الخبر بدل ما يفضل "محتاج لاعب" وهو خلاص اكتمل
      if (request) {
        await supabase
          .from("news")
          .update({ title: `✅ اكتمل الفريق في ${request.court_name}`, body: "تم إيجاد كل اللاعبين المطلوبين لهذا الطلب." })
          .eq("source_type", "partner_request")
          .eq("source_id", requestId);
      }

      // إشعار للمضيف وكل اللاعبين اللي اتقبلوا إن الفريق اكتمل
      const { data: acceptedJoins } = await supabase.from("partner_request_joins").select("player_id").eq("request_id", requestId).eq("status", "accepted");

      const recipientIds = [fullRequest?.host_id, ...(acceptedJoins || []).map((j) => j.player_id)];

      await insertNotifications(supabase, recipientIds, {
        type: "partner_request_matched",
        title: "اكتمل الفريق! 🎉",
        body: request?.court_name ? `الفريق اكتمل في ${request.court_name}` : null,
        link: `/find-partner/${requestId}`,
      });
    }
  }
}
