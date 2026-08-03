"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/services/authClient";
import ThemeToggle from "./ThemeToggle";

export default function ProfileMenu({ name, role, avatarUrl }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  const initial = name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="profile-menu" ref={menuRef}>
      <button type="button" className="profile-menu-trigger" onClick={() => setOpen((v) => !v)}>
        <span className="profile-menu-avatar">{avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : initial}</span>
      </button>


      {open && (
        <div className="profile-menu-dropdown">
          <div className="profile-menu-header">
            <span className="profile-menu-avatar">{avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : initial}</span>
            <span className="profile-menu-name">{name || "مستخدم"}</span>

            <ThemeToggle />
          </div>

          {role === "owner" && (
            <Link href="/owner/dashboard" className="profile-menu-item profile-menu-item--highlight" onClick={() => setOpen(false)}>
              <i className="fa-solid fa-table-columns"></i> لوحة التحكم
            </Link>
          )}

          <Link href="/profile" className="profile-menu-item" onClick={() => setOpen(false)}>
            <i className="fa-solid fa-user"></i> الملف الشخصي
          </Link>
          <button type="button" className="profile-menu-item danger" onClick={handleLogout}>
            <i className="fa-solid fa-sign-out-alt"></i> تسجيل خروج
          </button>
        </div>
      )}
    </div>
  );
}