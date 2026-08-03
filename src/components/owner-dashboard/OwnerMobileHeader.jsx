"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NotificationBell from "@/components/layout/NotificationBell";
import { signOut } from "@/services/authClient";
import { OWNER_NAV_LINKS } from "./ownerNavLinks";

export default function OwnerMobileHeader({ ownerName, notifState }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = notifState;

  const handleLogout = async () => {
    setOpen(false);
    await signOut();
    router.push("/login");
  };
  return (
    <div className="owner-mobile-header" style={{ position: "relative" }}>
      <span className="owner-mobile-header-title">لوحة {ownerName}</span>
      <div className="d-flex align-items-center gap-2">
        <NotificationBell notifications={notifications} unreadCount={unreadCount} loading={loading} markAsRead={markAsRead} markAllAsRead={markAllAsRead} />
        <button className="owner-mobile-toggle" onClick={() => setOpen((v) => !v)}>
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="owner-mobile-menu">
          <nav className="owner-nav">
            {OWNER_NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="owner-nav-link" onClick={() => setOpen(false)}>
                {link.icon} {link.label}
              </Link>
            ))}
          </nav>
          <button type="button" onClick={handleLogout} className="owner-nav-link" style={{ background: "none", border: "none", width: "100%", textAlign: "start", cursor: "pointer" }}>
            🚪 تسجيل الخروج
          </button>
          <Link href="/" className="owner-sidebar-back">
            ← رجوع للموقع
          </Link>
        </div>
      )}
    </div>
  );
}
