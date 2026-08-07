const CANCELLATION_LABELS = {
  flexible: "مرن — إلغاء قبل 6 ساعات",
  moderate: "معتدل — إلغاء قبل 24 ساعة",
  strict: "صارم — لا يُسمح بالإلغاء",
};

export default function Step5Review({ venue, courts, amenities, cancellationPolicy, agreeTerms, setAgreeTerms }) {
  const amenityLabels = {
    parking: "موقف سيارات مجاني",
    cafeteria: "كافتيريا",
    showers: "حمامات / دُش",
    lockers: "خزائن",
    wifi: "واي فاي مجاني",
    proshop: "متجر المحترفين",
    floodlights: "أضواء كاشفة",
    academy: "أكاديمية / تدريب",
  };

  return (
    <div className="wizard-step is-active">
      <div className="step-header">
        <span className="eyebrow">الخطوة 5 من 5</span>
        <h2 className="mt-2">مراجعة القائمة</h2>
        <p>كل شيء على ما يرام؟ سيتحقق فريقنا وينشر ملاعبك خلال 24 ساعة.</p>
      </div>

      <div className="review-card">
        <div className="review-section">
          <h4>الملعب</h4>
          <div className="review-row">
            <span>الاسم</span>
            <span>{venue.name || "—"}</span>
          </div>
          <div className="review-row">
            <span>العنوان</span>
            <span>{venue.address || "—"}</span>
          </div>
          <div className="review-row">
            <span>رقم التواصل</span>
            <span>{venue.phone || "—"}</span>
          </div>
          <div className="review-row">
            <span>الايميل</span>
            <span>{venue.email || "—"}</span>
          </div>
        </div>

        <div className="review-section">
          <h4>ملاعب ({courts.length})</h4>
          {courts.map((c, i) => (
            <div className="review-row" key={c.id}>
              <span>{c.name || `ملعب ${i + 1}`}</span>
              <span>{c.price ? `${c.price} جنيه/ساعة` : "—"}</span>
            </div>
          ))}
        </div>

        <div className="review-section">
          <h4>المرافق</h4>
          <div className="review-row">
            <span>Available</span>
            <span>{amenities.length ? amenities.map((a) => amenityLabels[a]).join("، ") : "None selected"}</span>
          </div>
        </div>

        <div className="review-section">
          <h4>سياسة الإلغاء</h4>
          <div className="review-row">
            <span>الإلغاء</span>
            <span>{CANCELLATION_LABELS[cancellationPolicy]}</span>
          </div>
        </div>
      </div>

      <div className="review-agree">
        <input type="checkbox" id="agreeTerms" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
        <label htmlFor="agreeTerms">
          أؤكد أن جميع المعلومات دقيقة وأوافق على{" "}
          <a href="/legal" className="auth-link">
            شروط InstaPadel لأصحاب الملاعب
          </a>
          .
        </label>
      </div>
    </div>
  );
}
