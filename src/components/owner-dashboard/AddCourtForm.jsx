"use client";
import { useState } from "react";
import { addCourtToVenue } from "@/services/ownerVenuesClient";

export default function AddCourtForm({ venueId, onAdded }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("regular");
  const [price, setPrice] = useState("");
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) => setPhotos((prev) => [...prev, { id: Date.now() + Math.random(), dataUrl: ev.target.result }]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removePhoto = (id) => setPhotos((prev) => prev.filter((p) => p.id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newCourt = await addCourtToVenue(venueId, { name, type, price }, photos);
      onAdded(newCourt);
      setOpen(false);
      setName("");
      setType("regular");
      setPrice("");
      setPhotos([]);
    } catch {
      alert("حصل خطأ أثناء إضافة الملعب");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button type="button" className="owner-court-edit-btn" onClick={() => setOpen(true)} style={{ marginTop: 10 }}>
        + أضف ملعب فرعي هنا
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 12, padding: 12, background: "var(--bg-secondary)", borderRadius: "var(--r-sm)" }}>
      <div className="row g-2">
        <div className="col-12">
          <input className="field-input" placeholder="اسم الملعب" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="col-md-6">
          <select className="field-input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="regular">عادي</option>
            <option value="panoramic">بانوراما</option>
            <option value="indoor">مغطى</option>
            <option value="outdoor">مكشوف</option>
          </select>
        </div>
        <div className="col-md-6">
          <input className="field-input" type="number" placeholder="السعر/ساعة" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div className="col-12">
          <label style={{ fontSize: ".82rem", color: "var(--light-gray)", marginBottom: 6, display: "block" }}>صور الملعب</label>
          <div className="photo-drop-zone" style={{ padding: 16 }}>
            <input type="file" accept="image/*" multiple onChange={handlePhotoChange} />
            <i className="fa-solid fa-image" style={{ fontSize: 24 }}></i>
            <p style={{ fontSize: ".8rem", margin: 0 }}>اضغط لإضافة صور</p>
          </div>
          {photos.length > 0 && (
            <div className="photo-previews">
              {photos.map((p) => (
                <div className="photo-preview-item" key={p.id}>
                  <img src={p.dataUrl} alt="" />
                  <button type="button" className="remove-photo" onClick={() => removePhoto(p.id)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button type="submit" className="owner-btn-save" disabled={submitting}>
          {submitting ? "جاري الإضافة…" : "إضافة"}
        </button>
        <button type="button" className="owner-btn-cancel" onClick={() => setOpen(false)}>
          إلغاء
        </button>
      </div>
    </form>
  );
}
