import { createClient } from "@/lib/supabase/server";
import { getOwnerCustomers } from "@/services/ownerCustomersService";
import CustomersTable from "@/components/owner-dashboard/CustomersTable";

export default async function OwnerCustomersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const customers = await getOwnerCustomers(user.id);
  const returningCount = customers.filter((c) => c.isReturning).length;

  return (
    <>
      <h1 className="owner-page-title">العملاء ({customers.length})</h1>

      <div className="owner-stats-grid">
        <div className="owner-stat-card">
          <p className="owner-stat-label">إجمالي العملاء</p>
          <p className="owner-stat-value">{customers.length}</p>
        </div>
        <div className="owner-stat-card">
          <p className="owner-stat-label">عملاء دائمين</p>
          <p className="owner-stat-value">{returningCount}</p>
        </div>
      </div>

      <div className="owner-card">
        <CustomersTable customers={customers} />
      </div>
    </>
  );
}
