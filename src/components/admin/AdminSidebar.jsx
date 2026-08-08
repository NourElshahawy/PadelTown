"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/services/authClient";

const ADMIN_NAV_LINKS = [{ href: "/admin/subscriptions", label: "طلبات الاشتراك", icon: "💳" }];

export default function AdminSidebar({ adminName }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="owner-sidebar">
      <div>
        <p className="owner-sidebar-greeting">لوحة الإدارة</p>
        <p className="owner-sidebar-name">{adminName}</p>
      </div>

      <nav className="owner-nav">
        {ADMIN_NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={`owner-nav-link ${pathname === link.href ? "is-active" : ""}`}>
            <span>{link.icon}</span> {link.label}
          </Link>
        ))}
      </nav>

      <button type="button" onClick={handleLogout} className="owner-nav-link" style={{ background: "none", border: "none", width: "100%", textAlign: "start", cursor: "pointer" }}>
        <span>🚪</span> تسجيل الخروج
      </button>
      <Link href="/" className="owner-sidebar-back">
        ← رجوع للموقع
      </Link>
    </aside>
  );
}
