"use client";
import { useEffect, useState } from "react";
import { submitOwnerNews } from "@/services/ownerNewsClient";

export default function OwnerNewsForm({ authorId }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const news = await submitOwnerNews(authorId, title, body, imageFile);
      setStatus("sent");
      setTitle("");
      setBody("");
      setImageFile(null);

      fetch("/api/notifications/news-published", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: news.title, body: news.body, newsId: news.id }),
      }).catch(() => {});
    } catch {
      alert("حصل خطأ أثناء إرسال الخبر");
      setStatus("idle");
    }
  };

  if (status === "sent") {
    return (
      <div className="owner-card">
        <p style={{ color: "var(--accent)", fontSize: ".9rem" }}>✓ تم نشر الخبر، وبيتبعت إشعار لكل المسجلين دلوقتي.</p>
        <button className="owner-btn-save" onClick={() => setStatus("idle")} style={{ marginTop: 10 }}>
          إرسال خبر تاني
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="owner-card">
      <h2 className="owner-card-title">نشر خبر / إعلان</h2>
      <div className="field-group">
        <label>عنوان الخبر</label>
        <input className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: ملعبي هيقفل النهاردة" required />
      </div>
      <div className="field-group">
        <label>التفاصيل</label>
        <textarea className="field-input field-textarea" value={body} onChange={(e) => setBody(e.target.value)} placeholder="تفاصيل إضافية..." />
      </div>
      <div className="field-group">
        <label>صورة الخبر (اختياري)</label>
        <label className="instapay-upload">
          <input type="file" accept="image/*" onChange={handleImageChange} hidden />
          {previewUrl ? (
            <img src={previewUrl} alt="صورة الخبر" className="instapay-upload-preview" />
          ) : (
            <>
              <i className="fa-solid fa-image"></i>
              <span>ارفع صورة للخبر (اختياري)</span>
            </>
          )}
        </label>
      </div>
      <button type="submit" className="owner-btn-save" disabled={status === "loading"}>
        {status === "loading" ? "جاري النشر…" : "نشر الخبر"}
      </button>
    </form>
  );
}
