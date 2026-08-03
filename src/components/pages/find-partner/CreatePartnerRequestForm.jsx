"use client";
import Link from "next/link";
import { useState } from "react";
import { createPartnerRequest } from "@/services/partnerRequestClient";
import GuideModal from "@/components/shared/GuideModal";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

const LEVELS = ["مبتدئ", "متوسط", "محترف"];

const PARTNER_GUIDE_STEPS = [
  { icon: "fa-location-dot", title: "اختار الملعب والموعد", text: "حدد الملعب، التاريخ، ومن الساعة لحد الساعة اللي عايز تلعب فيها." },
  { icon: "fa-chart-simple", title: "مستوى اللعب وعدد اللاعبين", text: "حدد مستوى اللعب المناسب، وكام لاعب محتاج تنضم لفريقك." },
  {
    icon: "fa-bell",
    title: "هتوصلك التحديثات أول بأول",
    text: "الطلب هيظهر لكل اللاعبين المهتمين. لما حد يطلب الانضمام هتقدر تقبله أو ترفضه، ولما الفريق يكتمل هيتحدّث الخبر تلقائيًا في صفحة الأخبار.",
  },
];

export default function CreatePartnerRequestForm({
  courts,
  // currentUser,
  onClose,
  hostId,
}) {
  const [form, setForm] = useState({
    courtId: courts[0]?.id || "",
    date: "",
    timeFrom: "",
    timeTo: "",
    level: "متوسط",
    playersNeeded: 1,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const timeConflict = form.timeFrom && form.timeTo && form.timeFrom >= form.timeTo;
  const canSubmit = form.courtId && form.date && form.timeFrom && form.timeTo && !timeConflict;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const court = courts.find((c) => c.id === form.courtId);
      const timeLabel = `${formatTime(form.timeFrom)} - ${formatTime(form.timeTo)}`;
      await createPartnerRequest({ ...form, time: timeLabel, courtName: court?.name || "" }, hostId);
      setSubmitted(true);
    } catch (err) {
      console.error("PARTNER REQUEST ERROR:", err);
      alert("حصل خطأ أثناء نشر الطلب");
    } finally {
      setSubmitting(false);
    }
  };
  if (submitted) {
    return (
      <div className="form-success-card">
        <i className="fa-solid fa-circle-check"></i>
        <h3>تم نشر طلبك</h3>
        <p>هيظهر لكل اللاعبين دلوقتي، وهيوصلك إشعار أول ما حد يبعت طلب انضمام.</p>
        <Link href="/find-partner" className="btn btn-accent btn-sm">
          رجوع لكل الطلبات
        </Link>
      </div>
    );
  }

  return (
    <>
      {showGuide && <GuideModal steps={PARTNER_GUIDE_STEPS} onClose={() => setShowGuide(false)} finalLabel="يلا ننشئ الطلب" />}
      <div className="partner-form-card">
        <Link href="/find-partner" type="button" className="btn-close-ph" aria-label="إغلاق" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </Link>
        <h2>إنشاء طلب شريك</h2>
        <p>حدد تفاصيل الماتش وهنعرضه لكل اللاعبين المهتمين.</p>

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label>الملعب</label>
            <div className="field-input-wrap">
              <i className="fa-solid fa-location-dot field-icon"></i>
              <select className="field-input" value={form.courtId} onChange={(e) => update({ courtId: e.target.value })}>
                {courts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <div className="field-group mb-0">
                <label>التاريخ</label>
                <div className="field-input-wrap">
                  <input type="date" className="field-input" value={form.date} onChange={(e) => update({ date: e.target.value })} required />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="field-group mb-0">
                    <label>من الساعة</label>
                    <div className="field-input-wrap">
                      <input type="time" className="field-input" value={form.timeFrom} onChange={(e) => update({ timeFrom: e.target.value })} required />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="field-group mb-0">
                    <label>إلى الساعة</label>
                    <div className="field-input-wrap">
                      <input type="time" className="field-input" value={form.timeTo} onChange={(e) => update({ timeTo: e.target.value })} required />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {form.timeFrom && form.timeTo && form.timeFrom >= form.timeTo && (
              <p
                style={{
                  color: "#ff6b6b",
                  fontSize: ".8rem",
                  marginTop: -8,
                  marginBottom: 12,
                }}>
                وقت النهاية لازم يكون بعد وقت البداية
              </p>
            )}
          </div>

          <div className="field-group">
            <label>مستوى اللعب</label>
            <div className="level-radio-pills">
              {LEVELS.map((l) => (
                <button type="button" key={l} className={`level-radio-pill ${form.level === l ? "active" : ""}`} onClick={() => update({ level: l })}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="field-group">
            <label>عدد اللاعبين المطلوبين</label>
            <div className="players-stepper">
              <button type="button" onClick={() => update({ playersNeeded: Math.max(1, form.playersNeeded - 1) })} disabled={form.playersNeeded <= 1}>
                −
              </button>
              <span>{form.playersNeeded}</span>
              <button type="button" onClick={() => update({ playersNeeded: Math.min(3, form.playersNeeded + 1) })} disabled={form.playersNeeded >= 3}>
                +
              </button>
            </div>
          </div>

          <div className="field-group">
            <label>
              ملاحظات <span className="label-optional">اختياري</span>
            </label>
            <textarea className="field-input field-textarea" placeholder="مستوى اللعب، لو محتاجين لاعب معين، إلخ..." value={form.notes} onChange={(e) => update({ notes: e.target.value })} />
          </div>

          <button type="submit" className="btn btn-accent btn-block" disabled={timeConflict || submitting}>
            {submitting ? "جاري النشر…" : "نشر الطلب"}
          </button>
        </form>
      </div>
    </>
  );
}

function formatTime(time24) {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "م" : "ص";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}