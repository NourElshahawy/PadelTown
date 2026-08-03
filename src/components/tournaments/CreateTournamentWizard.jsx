"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createTournament } from "@/services/tournamentClient";
import GuideModal from "@/components/shared/GuideModal";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

// import "@/styles/pages/tournament-wizard.css";

const TOURNAMENT_GUIDE_STEPS = [
  { icon: "fa-pen", title: "اكتب بيانات البطولة", text: "حدد اسم البطولة، نوعها (فردي أو زوجي)، وعدد الفرق." },
  { icon: "fa-location-dot", title: "اختار الملعب", text: "حدد الملعب اللي البطولة هتقام فيه." },
  { icon: "fa-calendar-days", title: "حدد المواعيد", text: "اختار تاريخ بداية البطولة، وممكن تحدد آخر موعد للتسجيل." },
  {
    icon: "fa-bell",
    title: "التحديثات تلقائية",
    text: 'لما عدد الفرق يكتمل، تقدر تدوس "ابدأ البطولة" ويتولّد الجدول تلقائيًا. وهيتحدّث خبر البطولة في صفحة الأخبار مع كل مرحلة: بداية التسجيل، بدء البطولة، وإعلان البطل في النهاية.',
  },
];

const TEAM_OPTIONS = [4, 8, 16, 32];
const STEPS = [
  { id: 1, label: "البيانات الأساسية" },
  { id: 2, label: "اختيار الملعب" },
  { id: 3, label: "الموعد" },
  { id: 4, label: "المراجعة" },
];

const INITIAL_DATA = {
  name: "",
  type: "single",
  teamsCount: 8,
  courtId: null,
  courtName: "",
  startDate: "",
  entryFee: "",
  registrationDeadline: "",
};

export default function CreateTournamentWizard({ courts = [], organizerId }) {
      useLockBodyScroll(true);

  const [step, setStep] = useState(1);
  const [data, setData] = useState(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showGuide, setShowGuide] = useState(true);

  const updateData = (patch) => setData((prev) => ({ ...prev, ...patch }));

  const canGoNext = useMemo(() => {
    if (step === 1) return data.name.trim().length >= 3;
    if (step === 2) return !!data.courtId;
    if (step === 3) {
      if (!data.startDate) return false;
      if (data.registrationDeadline && data.registrationDeadline >= data.startDate) return false;
      return true;
    }
    return true;
  }, [step, data]);

  const goNext = () => canGoNext && setStep((s) => Math.min(s + 1, 4));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));
  const router = useRouter();

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const tournament = await createTournament(data, organizerId);
      router.push(`/tournaments/${tournament.id}`);
    } catch (err) {
      setError("حصل خطأ أثناء إنشاء البطولة، حاول تاني.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {showGuide && <GuideModal steps={TOURNAMENT_GUIDE_STEPS} onClose={() => setShowGuide(false)} finalLabel="يلا ننشئ البطولة" />}
      <section className="wizard-section section">
        <div className="container">
          <div className="wizard-steps mb-4">
            {STEPS.map((s) => (
              <div key={s.id} className={`wizard-step-pill ${step === s.id ? "active" : ""} ${step > s.id ? "done" : ""}`}>
                <span className="wizard-step-num">{step > s.id ? <i className="fa-solid fa-check"></i> : s.id}</span>
                <span className="wizard-step-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="wizard-card">
            {step === 1 && <StepBasicInfo data={data} updateData={updateData} />}
            {step === 2 && <StepCourtSelect courts={courts} data={data} updateData={updateData} />}
            {step === 3 && <StepSchedule data={data} updateData={updateData} />}
            {step === 4 && <StepReview data={data} />}

            {error && <p className="wizard-error">{error}</p>}

            <div className="wizard-actions">
              {step > 1 && (
                <button className="btn btn-ghost btn-sm" onClick={goBack} disabled={submitting}>
                  <i className="fa-solid fa-arrow-right"></i> السابق
                </button>
              )}

              {step < 4 ? (
                <button className="btn btn-ghost btn-sm" onClick={goNext} disabled={!canGoNext}>
                  التالي <i className="fa-solid fa-arrow-left"></i>
                </button>
              ) : (
                <button className="btn btn-ghost btn-sm" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "جاري الإنشاء..." : "إنشاء البطولة"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function StepBasicInfo({ data, updateData }) {
  const currentIndex = TEAM_OPTIONS.indexOf(data.teamsCount);

  const decrease = () => {
    if (currentIndex > 0) updateData({ teamsCount: TEAM_OPTIONS[currentIndex - 1] });
  };
  const increase = () => {
    if (currentIndex < TEAM_OPTIONS.length - 1) updateData({ teamsCount: TEAM_OPTIONS[currentIndex + 1] });
  };

  return (
    <div className="wizard-step-content">
      <h4 className="wizard-step-title">
        <i className="fa-solid fa-trophy"></i> إنشاء بطولة جديدة
      </h4>

      <div className="form-group mb-3">
        <label>اسم البطولة</label>
        <input type="text" className="form-control" placeholder="مثال: Summer Cup" value={data.name} onChange={(e) => updateData({ name: e.target.value })} />
      </div>

      <div className="form-group mb-3">
        <label>نوع البطولة</label>
        <div className="radio-pills">
          <button type="button" className={`radio-pill ${data.type === "single" ? "active" : ""}`} onClick={() => updateData({ type: "single" })}>
            فردي
          </button>
          <button type="button" className={`radio-pill ${data.type === "double" ? "active" : ""}`} onClick={() => updateData({ type: "double" })}>
            زوجي
          </button>
        </div>
      </div>

      <div className="form-group mb-3">
        <label>عدد الفرق</label>
        <div className="team-stepper">
          <button type="button" onClick={decrease} disabled={currentIndex === 0} aria-label="تقليل عدد الفرق">
            −
          </button>
          <span>{data.teamsCount} فريق</span>
          <button type="button" onClick={increase} disabled={currentIndex === TEAM_OPTIONS.length - 1} aria-label="زيادة عدد الفرق">
            +
          </button>
        </div>
        <small className="wizard-hint">عدد الفرق لازم يكون قوة لـ 2 (4، 8، 16، 32) عشان جدول المباريات يقفل صح</small>
      </div>

      <div className="wizard-preview">
        <span>
          <i className="fa-solid fa-location-dot"></i> ملاعب متاحة
        </span>
        <span>
          <i className="fa-solid fa-users"></i> {data.teamsCount} فرق
        </span>
      </div>
    </div>
  );
}

function StepCourtSelect({ courts, data, updateData }) {
  return (
    <div className="wizard-step-content">
      <h4 className="wizard-step-title">
        <i className="fa-solid fa-map-location-dot"></i> اختر الملعب
      </h4>

      {courts.length === 0 ? (
        <p className="wizard-hint">لا توجد ملاعب متاحة حاليًا.</p>
      ) : (
        <div className="row g-4">
          {courts.map((court) => (
            <div className="col-md-6 col-lg-4" key={court.id}>
              <button type="button" className={`court-pick-card ${data.courtId === court.id ? "selected" : ""}`} onClick={() => updateData({ courtId: court.id, courtName: court.name })}>
                <div className="court-pick-image" style={{ backgroundImage: `url(${court.image})` }} />
                <div className="court-pick-body">
                  <h6>{court.name}</h6>
                  <div className="court-pick-meta">
                    <span>
                      <i className="fa-solid fa-star"></i> {court.rating > 0 ? court.rating : "جديد"}
                    </span>
                    <span>
                      <i className="fa-solid fa-location-dot"></i> {court.location}
                    </span>
                  </div>
                </div>
                {data.courtId === court.id && (
                  <span className="court-pick-check">
                    <i className="fa-solid fa-check"></i>
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepSchedule({ data, updateData }) {
  const todayISO = new Date().toISOString().split("T")[0];

  // آخر موعد ممكن للتسجيل هو يوم قبل بداية البطولة (لو محدد تاريخ بداية أصلاً)
  const maxDeadline = data.startDate ? addDaysISO(data.startDate, -1) : undefined;

  const deadlineTooLate = data.registrationDeadline && data.startDate && data.registrationDeadline >= data.startDate;

  const handleStartDateChange = (value) => {
    updateData({ startDate: value });
    // لو آخر موعد للتسجيل بقى بعد تاريخ البداية الجديد (أو نفسه)، امسحه عشان نمنع تعارض
    if (data.registrationDeadline && value && data.registrationDeadline >= value) {
      updateData({ startDate: value, registrationDeadline: "" });
    }
  };

  return (
    <div className="wizard-step-content">
      <h4 className="wizard-step-title">
        <i className="fa-solid fa-calendar-days"></i> موعد البداية
      </h4>

      <div className="form-group mb-3">
        <label>تاريخ بداية البطولة</label>
        <input type="date" className="form-control" min={todayISO} value={data.startDate} onChange={(e) => handleStartDateChange(e.target.value)} />
        <small className="wizard-hint">مواعيد المباريات بالساعة هتتحدد لاحقًا بعد تأكيد البطولة والملعب</small>
      </div>

      <div className="form-group mb-3">
        <label>آخر موعد للتسجيل (اختياري)</label>
        <input
          type="date"
          className="form-control"
          min={todayISO}
          max={maxDeadline}
          disabled={!data.startDate}
          value={data.registrationDeadline}
          onChange={(e) => updateData({ registrationDeadline: e.target.value })}
        />
        {!data.startDate ? <small className="wizard-hint">حدد تاريخ بداية البطولة الأول</small> : <small className="wizard-hint">لازم يكون قبل تاريخ بداية البطولة بيوم على الأقل</small>}
        {deadlineTooLate && <p style={{ color: "#ff6b6b", fontSize: ".8rem", marginTop: 6 }}>آخر موعد للتسجيل لازم يكون قبل تاريخ بداية البطولة</p>}
      </div>

      <div className="form-group mb-3">
        <label>رسوم الاشتراك بالجنيه (اختياري)</label>
        <input type="number" className="form-control" placeholder="0" value={data.entryFee} onChange={(e) => updateData({ entryFee: e.target.value })} />
      </div>
    </div>
  );
}

function addDaysISO(dateISO, days) {
  const d = new Date(dateISO);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function StepReview({ data }) {
  const rows = [
    { label: "اسم البطولة", value: data.name },
    { label: "النوع", value: data.type === "single" ? "فردي" : "زوجي" },
    { label: "الملعب", value: data.courtName },
    { label: "عدد الفرق", value: data.teamsCount },
    { label: "موعد البداية", value: data.startDate },
    ...(data.registrationDeadline ? [{ label: "آخر موعد للتسجيل", value: data.registrationDeadline }] : []),
    ...(data.entryFee ? [{ label: "رسوم الاشتراك", value: `${data.entryFee} جنيه` }] : []),
  ];

  return (
    <div className="wizard-step-content">
      <h4 className="wizard-step-title">
        <i className="fa-solid fa-list-check"></i> مراجعة البطولة
      </h4>

      <div className="wizard-review-list">
        {rows.map((row) => (
          <div className="wizard-review-row" key={row.label}>
            <span className="wizard-review-label">{row.label}</span>
            <span className="wizard-review-value">{row.value || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
