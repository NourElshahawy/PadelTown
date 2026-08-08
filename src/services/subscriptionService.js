import { createClient } from "@/lib/supabase/server";
import { mapSubscription } from "@/lib/subscriptionUtils";

export { mapSubscription };

// آخر طلب اشتراك لصاحب الملعب ده (تجربة مجانية، طلب دفع معلّق، نشط، أو مرفوض)
export async function getOwnerSubscription(ownerId) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("subscriptions").select("*").eq("owner_id", ownerId).order("created_at", { ascending: false }).limit(1).maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapSubscription(data);
}
