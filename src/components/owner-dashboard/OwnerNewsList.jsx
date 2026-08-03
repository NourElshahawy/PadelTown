"use client";
import { useState } from "react";
import { deleteOwnerNews } from "@/services/ownerNewsClient";

export default function OwnerNewsList({ initialNews }) {
  const [news, setNews] = useState(initialNews);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("متأكد إنك عايز تمسح الخبر ده؟ الخطوة دي مش هترجع.")) return;
    setDeletingId(id);
    try {
      await deleteOwnerNews(id);
      setNews((prev) => prev.filter((n) => n.id !== id));
    } catch {
      alert("حصل خطأ أثناء الحذف");
    } finally {
      setDeletingId(null);
    }
  };

  if (news.length === 0) {
    return <p className="owner-table-empty">لسه معملتش أي خبر.</p>;
  }

  return (
    <>
      {news.map((n) => (
        <div key={n.id} className="owner-venue-row">
          <span className="owner-venue-row-name">{n.title}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className={`owner-status-badge ${n.status === "published" ? "approved" : "pending"}`}>{n.status === "published" ? "منشور" : n.status === "rejected" ? "مرفوض" : "قيد المراجعة"}</span>
            <button onClick={() => handleDelete(n.id)} disabled={deletingId === n.id} className="owner-btn-cancel-booking" style={{ padding: "6px 12px" }}>
              {deletingId === n.id ? "..." : "حذف"}
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
