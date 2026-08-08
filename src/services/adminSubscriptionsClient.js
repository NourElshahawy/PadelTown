"use client";
import { createClient } from "@/lib/supabase/client";

export async function approveSubscription(subscriptionId, days) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date();
  const endsAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      status: "active",
      starts_at: now.toISOString(),
      ends_at: endsAt.toISOString(),
      reviewed_by: user?.id,
      reviewed_at: now.toISOString(),
    })
    .eq("id", subscriptionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function rejectSubscription(subscriptionId, note) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      status: "rejected",
      admin_note: note || null,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
