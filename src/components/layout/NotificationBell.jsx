"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "دلوقتي";
  if (mins < 60) return `من ${mins} ${mins === 1 ? "دقيقة" : "دقايق"}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `من ${hours} ${hours === 1 ? "ساعة" : "ساعات"}`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `من ${days} ${days === 1 ? "يوم" : "أيام"}`;
  return new Date(dateStr).toLocaleDateString("ar-EG", { day: "numeric", month: "long" });
}

export default function NotificationBell({ notifications, unreadCount, loading, markAsRead, markAllAsRead }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const handleItemClick = (n) => {
    if (!n.is_read) markAsRead(n.id);
    setOpen(false);
  };

  return (
    <div className="notif-bell-wrapper" ref={wrapperRef}>
      <button type="button" className="notif-bell-btn" aria-label="الإشعارات" onClick={() => setOpen((v) => !v)}>
        <i className="fa-solid fa-bell"></i>
        {unreadCount > 0 && <span className="notif-bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <span>الإشعارات</span>
            {unreadCount > 0 && (
              <button type="button" className="notif-mark-all" onClick={markAllAsRead}>
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          <div className="notif-panel-body">
            {loading ? (
              <div className="notif-empty">جاري التحميل...</div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty">
                <i className="fa-regular fa-bell-slash"></i>
                <span>مفيش إشعارات لسه</span>
              </div>
            ) : (
              notifications.map((n) => {
                const content = (
                  <>
                    <span className={`notif-dot ${n.is_read ? "" : "is-unread"}`}></span>
                    <div className="notif-item-text">
                      <p className="notif-item-title">{n.title}</p>
                      {n.body && <p className="notif-item-body">{n.body}</p>}
                      <span className="notif-item-time">{timeAgo(n.created_at)}</span>
                    </div>
                  </>
                );

                return n.link ? (
                  <Link key={n.id} href={n.link} className={`notif-item ${n.is_read ? "" : "is-unread"}`} onClick={() => handleItemClick(n)}>
                    {content}
                  </Link>
                ) : (
                  <div key={n.id} className={`notif-item ${n.is_read ? "" : "is-unread"}`} onClick={() => handleItemClick(n)} role="button" tabIndex={0}>
                    {content}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
