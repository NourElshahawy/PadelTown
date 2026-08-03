import PhotoDropZone from "../PhotoDropZone";

export default function Step3Photos({ courts, photosByCourtId, addPhoto, removePhoto }) {
  return (
    <div className="wizard-step is-active">
      <div className="step-header">
        <span className="eyebrow">الخطوة 3 من 5</span>
        <h2 className="mt-2">تحميل صور الملاعب</h2>
        <p>الصور الجيدة تزيد الحجوزات حتى 3 مرات. أضف صورة واحدة على الأقل لكل ملعب.</p>
      </div>

      {courts.map((court, i) => (
        <PhotoDropZone
          key={court.id}
          courtName={court.name || `ملعب ${i + 1}`}
          photos={photosByCourtId[court.id] || []}
          onAddFiles={(photo) => addPhoto(court.id, photo)}
          onRemovePhoto={(photoId) => removePhoto(court.id, photoId)}
        />
      ))}
    </div>
  );
}
