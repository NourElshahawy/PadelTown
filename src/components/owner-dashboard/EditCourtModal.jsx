"use client";
import { useState } from "react";
import { updateCourt } from "@/services/ownerVenuesClient";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import "../../styles/shared/owner-modal.css";

export default function EditCourtModal({ court, venueId, onClose, onSaved }) {
  useLockBodyScroll(true);
  const [name, setName] = useState(court.name);
  const [type, setType] = useState(court.type || "regular");
  const [sportType, setSportType] = useState(court.sport_type || "padel");
  const [price, setPrice] = useState(String(court.price_per_hour));
  const [existingImages, setExistingImages] = useState(court.images || []);
  const [newPhotos, setNewPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const removeExistingImage = (url) => setExistingImages((prev) => prev.filter((i) => i !== url));
  const removeNewPhoto = (id) => setNewPhotos((prev) => prev.filter((p) => p.id !== id));

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) => setNewPhotos((prev) => [...prev, { id: Date.now() + Math.random(), dataUrl: ev.target.result }]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const updated = await updateCourt(court.id, venueId, {
        name,
        type,
        sportType,
        price,
        existingImages,
        newPhotos,
      });
      onSaved(updated);
      onClose();
    } catch {
      setError("حصل خطأ أثناء حفظ التعديلات، حاول تاني");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop-ph show" onClick={onClose}>
      <div className="modal-dialog-ph" onClick={(e) => e.stopPropagation()}>
        <div className="owner-modal-content">
          <button type="button" className="btn-close-ph" aria-label="إغلاق" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>

          <div className="owner-modal-body">
            <h3 style={{ fontSize: "1.15rem" }}>تعديل الملعب</h3>

            <form onSubmit={handleSubmit} className="row g-2" style={{ marginTop: 8 }}>
              <div className="col-12">
                <label className="edit-court-label">اسم الملعب</label>
                <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="col-md-6">
                <label className="edit-court-label">الرياضة</label>
                <select className="field-input" value={sportType} onChange={(e) => setSportType(e.target.value)}>
                  <option value="padel">بادل</option>
                  <option value="football">كورة قدم</option>
                  <option value="tennis">تنس</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="edit-court-label">النوع</label>
                <select className="field-input" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="regular">عادي</option>
                  <option value="panoramic">بانوراما</option>
                  <option value="indoor">مغطى</option>
                  <option value="outdoor">مكشوف</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="edit-court-label">السعر/ساعة</label>
                <input className="field-input" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>

              <div className="col-12">
                <label className="edit-court-label">صور الملعب الحالية</label>
                {existingImages.length === 0 ? (
                  <p style={{ fontSize: ".8rem", color: "var(--text-faint)" }}>مفيش صور مضافة.</p>
                ) : (
                  <div className="photo-previews">
                    {existingImages.map((url) => (
                      <div className="photo-preview-item" key={url}>
                        <img src={url} alt="" />
                        <button type="button" className="remove-photo" onClick={() => removeExistingImage(url)}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="col-12">
                <label className="edit-court-label">إضافة صور جديدة</label>
                <div className="photo-drop-zone" style={{ padding: 16 }}>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoChange} />
                  <i className="fa-solid fa-image" style={{ fontSize: 24 }}></i>
                  <p style={{ fontSize: ".8rem", margin: 0 }}>اضغط لإضافة صور</p>
                </div>
                {newPhotos.length > 0 && (
                  <div className="photo-previews">
                    {newPhotos.map((p) => (
                      <div className="photo-preview-item" key={p.id}>
                        <img src={p.dataUrl} alt="" />
                        <button type="button" className="remove-photo" onClick={() => removeNewPhoto(p.id)}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && <p style={{ color: "#ff6b6b", fontSize: ".82rem", marginTop: 4 }}>{error}</p>}

              <div className="col-12" style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button type="submit" className="owner-btn-save" disabled={saving}>
                  {saving ? "جاري الحفظ…" : "حفظ التعديلات"}
                </button>
                <button type="button" className="owner-btn-cancel" onClick={onClose}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
