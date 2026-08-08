import { createClient } from "@/lib/supabase/server";
import { mapSubscription } from "./subscriptionService";

export async function getAllSubscriptions() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("subscriptions").select("*, profiles(name, email, phone)").order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    ...mapSubscription(row),
    ownerId: row.owner_id,
    ownerName: row.profiles?.name || "—",
    ownerEmail: row.profiles?.email || "—",
    ownerPhone: row.profiles?.phone || "—",
  }));
}
