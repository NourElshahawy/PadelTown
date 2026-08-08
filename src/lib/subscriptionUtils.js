// دالة نقية من غير أي استيراد server-only، عشان تتستخدم من client وserver components
// من غير ما تجر معاها next/headers (اللي بتكسر الـ client bundle لو اتحطت في نفس
// ملف subscriptionService.js اللي بيستورد createClient من lib/supabase/server).
export function mapSubscription(row) {
  const endsAt = row.ends_at ? new Date(row.ends_at) : null;
  const isLive = ["trial", "active"].includes(row.status) && endsAt && endsAt.getTime() > Date.now();
  const daysRemaining = isLive ? Math.ceil((endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  return {
    id: row.id,
    status: row.status,
    isLive,
    effectiveStatus: !isLive && ["trial", "active"].includes(row.status) ? "expired" : row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    daysRemaining,
    paymentMethod: row.payment_method,
    paymentProofUrl: row.payment_proof_url,
    adminNote: row.admin_note,
    createdAt: row.created_at,
  };
}
