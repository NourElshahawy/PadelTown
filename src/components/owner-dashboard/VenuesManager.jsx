"use client";
import { useState } from "react";
import AddCourtForm from "./AddCourtForm";
import EditCourtModal from "./EditCourtModal";

export default function VenuesManager({ venues }) {
  const [localVenues, setLocalVenues] = useState(venues);
  const [editingCourt, setEditingCourt] = useState(null); // { venueId, court }

  const handleCourtAdded = (venueId, newCourt) => {
    setLocalVenues((prev) => prev.map((v) => (v.id === venueId ? { ...v, courts: [...v.courts, newCourt] } : v)));
  };

  const handleCourtSaved = (venueId, updatedCourt) => {
    setLocalVenues((prev) => prev.map((v) => (v.id === venueId ? { ...v, courts: v.courts.map((c) => (c.id === updatedCourt.id ? { ...c, ...updatedCourt } : c)) } : v)));
  };

  if (localVenues.length === 0) return <p className="owner-table-empty">مفيش ملاعب مسجلة بعد.</p>;

  return (
    <>
      {localVenues.map((venue) => (
        <div key={venue.id} className="owner-venue-block">
          <div className="owner-venue-block-header">
            <span className="owner-venue-row-name" style={{ fontWeight: 700 }}>
              {venue.name}
            </span>
            <span className={`owner-status-badge ${venue.status}`}>{venue.status === "approved" ? "معتمد" : "قيد المراجعة"}</span>
          </div>

          {venue.courts.map((court) => (
            <div key={court.id} className="owner-court-row">
              <span className="owner-court-name">{court.name}</span>
              <div className="owner-court-edit-group">
                <span className="owner-court-price">{court.price_per_hour} ج.م/ساعة</span>
                <button onClick={() => setEditingCourt({ venueId: venue.id, court })} className="owner-court-edit-btn">
                  تعديل
                </button>
              </div>
            </div>
          ))}

          <AddCourtForm venueId={venue.id} onAdded={(newCourt) => handleCourtAdded(venue.id, newCourt)} />
        </div>
      ))}

      {editingCourt && (
        <EditCourtModal court={editingCourt.court} venueId={editingCourt.venueId} onClose={() => setEditingCourt(null)} onSaved={(updated) => handleCourtSaved(editingCourt.venueId, updated)} />
      )}
    </>
  );
}
