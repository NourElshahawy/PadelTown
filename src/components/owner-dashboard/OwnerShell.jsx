"use client";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import OwnerSidebar from "./OwnerSidebar";
import OwnerMobileHeader from "./OwnerMobileHeader";
import SubscriptionBanner from "./SubscriptionBanner";

export default function OwnerShell({ ownerName, subscription, children }) {
  const { user } = useAuth();
  const notifState = useNotifications(user?.id);

  return (
    <>
      <OwnerSidebar ownerName={ownerName} notifState={notifState} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <OwnerMobileHeader ownerName={ownerName} notifState={notifState} />
        <div className="owner-content">
          <div className="owner-content-inner">
            <SubscriptionBanner subscription={subscription} />
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
