"use client";
import { useState } from "react";
import { createVenue } from "@/services/ownerVenuesClient";

const AMENITIES = [
  { value: "parking", label: "موقف سيارات" },
  { value: "cafeteria", label: "كافتيريا" },
  { value: "showers", label: "حمامات / دُش" },
  { value: "lockers", label: "خزائن" },
  { value: "wifi", label: "واي فاي" },
];

export default function AddVenueForm({ ownerId, onCreated }) {
  const [open, setOpen] = useState(false);
  const [venue, setVenue] = useState({ name: "", address: "", phone: "", email: "", description: "", amenities: [] });
  const [courts, setCourts] = useState([{ name: "", type: "regular", price: "" }]);
  const [submitting, setSubmitting] = useState(false);

  const toggleAmenity = (value) => setVenue((v) => ({ ...v, amenities: v.amenities.includes(value) ? v.amenities.filter((a) => a !== value) : [...v.amenities, value] }));

  const updateCourt = (i, patch) => setCourts((cs) => cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const addCourtRow = () => setCourts((cs) => [...cs, { name: "", type: "regular", price: "" }]);
  const removeCourtRow = (i) => setCourts((cs) => cs.filter((_, idx) => idx !== i));

  const canSubmit = venue.name.trim() && venue.phone.trim() && courts.every((c) => c.name.trim() && c.price);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await createVenue(ownerId, venue, courts);
      alert("تم إرسال ملعبك الجديد للمراجعة، هيظهر بعد موافقة الإدارة.");
      setOpen(false);
      setVenue({ name: "", address: "", phone: "", email: "", description: "", amenities: [] });
      setCourts([{ name: "", type: "regular", price: "" }]);
      onCreated?.();
    } catch {
      alert("حصل خطأ أثناء إضافة الملعب");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button className="owner-btn-save" onClick={() => setOpen(true)} style={{ marginBottom: 20 }}>
        + إضافة ملعب جديد
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="owner-card">
      <h2 className="owner-card-title">إضافة ملعب جديد</h2>

      <div className="field-group">
        <label>اسم المكان</label>
        <input className="field-input" value={venue.name} onChange={(e) => setVenue((v) => ({ ...v, name: e.target.value }))} required />
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="field-group mb-0">
            <label>العنوان</label>
            <input className="field-input" value={venue.address} onChange={(e) => setVenue((v) => ({ ...v, address: e.target.value }))} />
          </div>
        </div>
        <div className="col-md-6">
          <div className="field-group mb-0">
            <label>رقم الهاتف</label>
            <input className="field-input phone-rtl-fix" value={venue.phone} onChange={(e) => setVenue((v) => ({ ...v, phone: e.target.value }))} required />
          </div>
        </div>
      </div>

      <div className="field-group">
        <label>المرافق</label>
        <div className="amenity-check-grid">
          {AMENITIES.map((a) => (
            <label className="amenity-check-item" key={a.value}>
              <input type="checkbox" checked={venue.amenities.includes(a.value)} onChange={() => toggleAmenity(a.value)} />
              <span className="ach-box">{a.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="field-group">
        <label>الملاعب</label>
        {courts.map((c, i) => (
          <div key={i} className="court-row">
            <div className="row g-3">
              <div className="col-12">
                <input className="field-input" placeholder="اسم الملعب" value={c.name} onChange={(e) => updateCourt(i, { name: e.target.value })} required />
              </div>
              <div className="col-md-6">
                <select className="field-input" value={c.type} onChange={(e) => updateCourt(i, { type: e.target.value })}>
                  <option value="regular">عادي</option>
                  <option value="panoramic">بانوراما</option>
                  <option value="indoor">مغطى</option>
                  <option value="outdoor">مكشوف</option>
                </select>
              </div>
              <div className="col-md-6">
                <input className="field-input" type="number" placeholder="السعر/ساعة" value={c.price} onChange={(e) => updateCourt(i, { price: e.target.value })} required />
              </div>
            </div>
            {courts.length > 1 && (
              <button type="button" className="btn-remove-court" onClick={() => removeCourtRow(i)}>
                إزالة
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn-add-court" onClick={addCourtRow}>
          + أضف ملعب فرعي
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button type="submit" className="owner-btn-save" disabled={submitting}>
          {submitting ? "جاري الإرسال…" : "إرسال للمراجعة"}
        </button>
        <button type="button" className="owner-btn-cancel" onClick={() => setOpen(false)}>
          إلغاء
        </button>
      </div>
    </form>
  );
}