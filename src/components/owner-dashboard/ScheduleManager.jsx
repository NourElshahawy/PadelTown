"use client";
import { useMemo, useState } from "react";
import { buildDefaultSlots, getEgyptISODate } from "@/services/courtLogic";
import { blockSlots, unblockSlot } from "@/services/ownerScheduleClient";
import BlockSlotModal from "./BlockSlotModal";
import ConfirmModal from "@/components/shared/ConfirmModal";

export default function ScheduleManager({ courts, days, initialBookings, initialBlockedSlots }) {
  const [selectedCourtId, setSelectedCourtId] = useState(courts[0]?.id || null);
  const [selectedDate, setSelectedDate] = useState(days[0]?.date || null);
  const [bookings] = useState(initialBookings);
  const [blockedSlots, setBlockedSlots] = useState(initialBlockedSlots);
  const [selectedStarts, setSelectedStarts] = useState([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [unblockTarget, setUnblockTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedCourt = courts.find((c) => c.id === selectedCourtId);
  const todayISO = getEgyptISODate();

  const slots = useMemo(() => {
    if (!selectedCourt || !selectedDate) return [];

    const bookedStarts = bookings.filter((b) => b.court_id === selectedCourtId && b.date === selectedDate).map((b) => b.time.split(" الي ")[0]);

    const blockedForDay = blockedSlots.filter((b) => b.court_id === selectedCourtId && b.date === selectedDate);
    const blockedStarts = blockedForDay.map((b) => b.time);

    const isToday = selectedDate === todayISO;
    const currentHour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", hour: "numeric", hour12: false }).format(new Date()));

    return buildDefaultSlots(selectedCourt.price_per_hour).map((slot, index) => {
      const isPast = isToday && index <= currentHour;
      const isBooked = bookedStarts.includes(slot.start);
      const blockedRow = blockedForDay.find((b) => b.time === slot.start);

      let status = "available";
      if (isPast) status = "past";
      else if (isBooked) status = "booked";
      else if (blockedRow) status = "blocked";

      return { ...slot, status, blockedRow };
    });
  }, [selectedCourt, selectedCourtId, selectedDate, bookings, blockedSlots, todayISO]);

  const toggleSelect = (slot) => {
    if (slot.status !== "available") return;
    setSelectedStarts((prev) => (prev.includes(slot.start) ? prev.filter((s) => s !== slot.start) : [...prev, slot.start]));
  };

  const handleClickSlot = (slot) => {
    if (slot.status === "blocked") {
      setUnblockTarget(slot.blockedRow);
      return;
    }
    if (slot.status === "available") {
      toggleSelect(slot);
    }
  };

  const handleConfirmBlock = async (reason) => {
    setSubmitting(true);
    try {
      const inserted = await blockSlots(selectedCourtId, selectedDate, selectedStarts, reason);
      setBlockedSlots((prev) => [...prev, ...inserted]);
      setSelectedStarts([]);
      setShowBlockModal(false);
    } catch {
      alert("حصل خطأ أثناء قفل الساعات، حاول تاني");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmUnblock = async () => {
    setSubmitting(true);
    try {
      await unblockSlot(unblockTarget.id);
      setBlockedSlots((prev) => prev.filter((b) => b.id !== unblockTarget.id));
      setUnblockTarget(null);
    } catch {
      alert("حصل خطأ أثناء فتح الساعة، حاول تاني");
    } finally {
      setSubmitting(false);
    }
  };

  if (courts.length === 0) return <p className="owner-table-empty">مفيش ملاعب مسجلة بعد.</p>;

  return (
    <>
      <div className="schedule-controls">
        <select className="field-input" value={selectedCourtId || ""} onChange={(e) => setSelectedCourtId(e.target.value)}>
          {courts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.venueName} — {c.name}
            </option>
          ))}
        </select>

        <div className="schedule-days">
          {days.map((d) => (
            <button
              key={d.date}
              type="button"
              className={`schedule-day-chip ${selectedDate === d.date ? "is-active" : ""}`}
              onClick={() => {
                setSelectedDate(d.date);
                setSelectedStarts([]);
              }}>
              <span>{d.dow}</span>
              <strong>{d.dom}</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="slots-legend" style={{ marginTop: 16 }}>
        <span>
          <em className="leg-dot available" /> متاح
        </span>
        <span>
          <em className="leg-dot booked" /> محجوز (عميل)
        </span>
        <span>
          <em className="leg-dot schedule-blocked" /> مقفول يدويًا
        </span>
      </div>

      <div className="schedule-slots-grid">
        {slots.map((slot) => (
          <button
            key={slot.start}
            type="button"
            className={`schedule-slot ${slot.status} ${selectedStarts.includes(slot.start) ? "selected" : ""}`}
            disabled={slot.status === "past" || slot.status === "booked"}
            onClick={() => handleClickSlot(slot)}
            title={slot.status === "blocked" ? slot.blockedRow?.reason || "مقفول" : ""}>
            <span>{slot.start}</span>
            {slot.status === "booked" && <small>محجوز</small>}
            {slot.status === "blocked" && <small>{slot.blockedRow?.reason || "مقفول"}</small>}
            {slot.status === "past" && <small>فات الموعد</small>}
          </button>
        ))}
      </div>

      {selectedStarts.length > 0 && (
        <div className="schedule-action-bar">
          <span>{selectedStarts.length} ساعة محددة</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="owner-btn-cancel" onClick={() => setSelectedStarts([])}>
              إلغاء التحديد
            </button>
            <button className="owner-btn-save" onClick={() => setShowBlockModal(true)}>
              قفل الساعات المحددة
            </button>
          </div>
        </div>
      )}

      {showBlockModal && <BlockSlotModal count={selectedStarts.length} submitting={submitting} onCancel={() => setShowBlockModal(false)} onConfirm={handleConfirmBlock} />}

      <ConfirmModal
        isOpen={!!unblockTarget}
        title="فتح الساعة دي تاني؟"
        message={unblockTarget?.reason ? `السبب المسجل: ${unblockTarget.reason}` : "هترجع متاحة للحجز تاني."}
        confirmLabel={submitting ? "جاري الفتح…" : "فتح الساعة"}
        onConfirm={handleConfirmUnblock}
        onCancel={() => !submitting && setUnblockTarget(null)}
      />
    </>
  );
}
