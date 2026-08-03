import CourtRow from "../CourtRow";

export default function Step2Courts({ courts, updateCourt, addCourt, removeCourt }) {
  return (
    <div className="wizard-step is-active">
      <div className="step-header">
        <span className="eyebrow">الخطوة 2 من 5</span>
        <h2 className="mt-2">إعداد الملاعب</h2>
        <p>أضف كل ملعب على حدة — الاسم، النوع، والسعر للساعة.</p>
      </div>

      {courts.map((court, i) => (
        <CourtRow key={court.id} court={court} index={i} canRemove={courts.length > 1} onChange={(updated) => updateCourt(court.id, updated)} onRemove={() => removeCourt(court.id)} />
      ))}

      <button type="button" className="btn-add-court" onClick={addCourt} disabled={courts.length >= 20}>
        <i className="fa-solid fa-circle-plus"></i>
        أضف ملعباً آخر
      </button>
    </div>
  );
}
