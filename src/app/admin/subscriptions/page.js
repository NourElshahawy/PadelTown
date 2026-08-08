import { getAllSubscriptions } from "@/services/adminSubscriptionsService";
import AdminSubscriptionsManager from "@/components/admin/AdminSubscriptionsManager";

export default async function AdminSubscriptionsPage() {
  const subscriptions = await getAllSubscriptions();

  return (
    <>
      <h1 className="owner-page-title">طلبات الاشتراك</h1>
      <AdminSubscriptionsManager initialSubscriptions={subscriptions} />
    </>
  );
}
