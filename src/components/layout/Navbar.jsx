"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStickyNavbar } from "@/hooks/useStickyNavbar";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { signOut } from "@/services/authClient";
import { useRouter } from "next/navigation";
import ProfileMenu from "./ProfileMenu";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
// import ThemeToggle from "@/components/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/#courts", label: "الملاعب" },
  { href: "/tournaments", label: "البطولات" },
  { href: "/find-partner", label: "دور على شريك" },
  { href: "/#news", label: "اخبار البادل" },
  // { href: "/#contact", label: "تواصل معنا" },
];

export default function Navbar() {
  const isScrolled = useStickyNavbar();
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, loading } = useAuth();
  const notif = useNotifications(user?.id);
  const router = useRouter();

  const closeMenu = () => setIsOpen(false);

  const handleMobileLogout = async () => {
    await signOut();
    closeMenu();
    router.push("/");
    router.refresh();
  };

  return (
    <header className={`navbar-ph ${isScrolled ? "is-scrolled" : ""}`}>
      <div className="container d-flex align-items-center justify-content-between">
        <Link href="/" className="brand">
          <Image src="/assets/imgs/logo1-removebg-preview.png" alt="InstaPadel" width={56} height={56} priority />
        </Link>

        <nav className={`nav-links ${isOpen ? "is-open" : ""}`} id="navLinks">
          <button className="nav-close-btn d-lg-none" onClick={closeMenu} aria-label="إغلاق القائمة">
            <i className="fa-solid fa-xmark"></i>
          </button>

          <Link href="/" className="brand logo-mobil" onClick={closeMenu}>
            <Image src="/assets/imgs/logo1-removebg-preview.png" alt="InstaPadel" width={56} height={56} />
          </Link>

          <div className="nav-links-primary">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={closeMenu}>
                {link.label}
              </Link>
            ))}
            {/* <ThemeToggle /> */}
          </div>

          {!loading && (
            <div className="nav-account-mobile d-lg-none">
              {user ? (
                <>
                  <div className="nav-account-header">
                    <span className="profile-menu-avatar">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                      ) : (
                        profile?.name?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </span>
                    <span className="nav-account-name">{profile?.name || "مستخدم"}</span>
                    <NotificationBell {...notif} />
                    <ThemeToggle />
                  </div>

                  {profile?.role === "owner" && (
                    <Link href="/owner/dashboard" className="nav-account-link" onClick={closeMenu}>
                      <i className="fa-solid fa-table-columns"></i> لوحة التحكم
                    </Link>
                  )}
                  <Link href="/profile" className="nav-account-link" onClick={closeMenu}>
                    <i className="fa-solid fa-user"></i> الملف الشخصي
                  </Link>
                  <button className="nav-account-link danger" onClick={handleMobileLogout}>
                    <i className="fa-solid fa-sign-out-alt"></i> تسجيل خروج
                  </button>
                </>
              ) : (
                <div className="d-flex gap-3">
                  <Link href="/login" className="btn btn-ghost btn-sm" onClick={closeMenu}>
                    تسجيل دخول
                  </Link>
                  <Link href="/register" className="btn btn-accent btn-sm" onClick={closeMenu}>
                    انشاء حساب
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
        <div className="navbar-cta">
          {loading ? null : user ? (
            <div className="d-none d-lg-flex align-items-center gap-2">
              <NotificationBell {...notif} />
              <ProfileMenu name={profile?.name} role={profile?.role} avatarUrl={profile?.avatar_url} />
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                تسجيل دخول
              </Link>
              <Link href="/register" className="btn btn-ghost btn-sm">
                انشاء حساب
              </Link>
              <ThemeToggle />
            </>
          )}
          <button className="nav-toggle" aria-label="Toggle menu" onClick={() => setIsOpen((v) => !v)}>
            <i className={`fa-solid ${isOpen ? "fa-xmark" : "fa-bars"}`}></i>
          </button>
        </div>
      </div>
    </header>
  );
}
