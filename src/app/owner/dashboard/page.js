import { createClient } from "@/lib/supabase/server";
import { getOwnerOverview } from "@/services/ownerDashboardService";
import RevenueChart from "@/components/owner-dashboard/RevenueChart";
import RevenueMonthlyChart from "@/components/owner-dashboard/RevenueMonthlyChart";
import ExportButtons from "@/components/owner-dashboard/ExportButtons";

export default async function OwnerOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const stats = await getOwnerOverview(user.id);

  const monthlyExportRows = stats.revenueByMonth.map((m) => [m.month, m.bookings, m.revenue]);

  return (
    <>
      <h1 className="owner-page-title">نظرة عامة</h1>

      <div className="owner-stats-grid">
        <StatCard label="إيرادات مقبوضة فعليًا" value={`${stats.collectedRevenue} ج.م`} />
        <StatCard label="إيرادات متوقعة (شاملة الغير مدفوع)" value={`${stats.expectedRevenue} ج.م`} />
        <StatCard label="عدد الحجوزات" value={stats.totalBookings} />
        <StatCard label="عدد الملاعب" value={stats.totalCourts} />
      </div>

      <div className="owner-card">
        <h2 className="owner-card-title">الإيرادات آخر 7 أيام</h2>
        <RevenueChart data={stats.revenueByDay} />
      </div>

      <div className="owner-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
          <h2 className="owner-card-title" style={{ marginBottom: 0 }}>
            مقارنة الإيرادات آخر 6 شهور
          </h2>
          <ExportButtons title="مقارنة الإيرادات الشهرية" headers={["الشهر", "عدد الحجوزات", "الإيرادات (ج.م)"]} rows={monthlyExportRows} filenameBase="الإيرادات-الشهرية" />
        </div>
        <RevenueMonthlyChart data={stats.revenueByMonth} />
      </div>

      <div className="owner-card">
        <h2 className="owner-card-title">أماكنك</h2>
        {stats.venues.map((v) => (
          <div key={v.id} className="owner-venue-row">
            <span className="owner-venue-row-name">{v.name}</span>
            <span className={`owner-status-badge ${v.status}`}>{v.status === "approved" ? "معتمد" : "قيد المراجعة"}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="owner-stat-card">
      <p className="owner-stat-label">{label}</p>
      <p className="owner-stat-value">{value}</p>
    </div>
  );
}
