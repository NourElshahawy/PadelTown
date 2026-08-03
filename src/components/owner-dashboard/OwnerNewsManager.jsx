"use client";
import { useState } from "react";
import OwnerNewsForm from "./OwnerNewsForm";
import OwnerNewsList from "./OwnerNewsList";

export default function OwnerNewsManager({ authorId, initialNews }) {
  const [news, setNews] = useState(initialNews);

  const handlePublished = (newItem) => setNews((prev) => [newItem, ...prev]);
  const handleDeleted = (id) => setNews((prev) => prev.filter((n) => n.id !== id));

  return (
    <>
      <OwnerNewsForm authorId={authorId} onPublished={handlePublished} />

      <div className="owner-card">
        <h2 className="owner-card-title">أخباري</h2>
        <OwnerNewsList news={news} onDeleted={handleDeleted} />
      </div>
    </>
  );
}
