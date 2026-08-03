export default function Step1VenueInfo({ venue, updateVenue }) {
  const phoneValid = !venue.phone || /^01[0125]\d{8}$/.test(venue.phone.trim());
  const emailValid = !venue.email || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(venue.email.trim());

  return (
    <div className="wizard-step is-active">
      <div className="step-header">
        <span className="eyebrow">الخطوة 1 من 5</span>
        <h2 className="mt-2">أخبرنا عن مكانك</h2>
        <p>المعلومات الأساسية التي سيراها اللاعبون عند العثور على ناديك في Ace Town.</p>
      </div>

      <div className="field-group">
        <label>اسم المكان</label>
        <div className="field-input-wrap">
          <i className="fa-solid fa-store field-icon"></i>
          <input className="field-input" type="text" placeholder="مثال: بادل أرينا المنصورة" value={venue.name} onChange={(e) => updateVenue({ name: e.target.value })} required />
        </div>
      </div>

      <div className="field-group">
        <label>العنوان الكامل</label>
        <div className="field-input-wrap">
          <i className="fa-solid fa-map field-icon"></i>
          <input className="field-input" type="text" placeholder="اسم الشارع، رقم المبنى…" value={venue.address} onChange={(e) => updateVenue({ address: e.target.value })} />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="field-group mb-0">
            <label>رقم الهاتف</label>
            <div className="field-input-wrap">
              <i className="fa-solid fa-phone field-icon"></i>
              <input className="field-input phone-rtl-fix" type="tel" placeholder="01xx xxx xxxx" value={venue.phone} onChange={(e) => updateVenue({ phone: e.target.value })} required />
            </div>
            {!phoneValid && <span style={{ color: "#ff6b6b", fontSize: ".76rem", marginTop: 4, display: "block" }}>رقم مصري غير صحيح (لازم يبدأ بـ 010، 011، 012، أو 015 ويكون 11 رقم)</span>}
          </div>
        </div>
        <div className="col-md-6">
          <div className="field-group mb-0">
            <label>البريد الإلكتروني</label>
            <div className="field-input-wrap">
              <i className="fa-solid fa-envelope field-icon"></i>
              <input className="field-input" type="email" placeholder="name@example.com" value={venue.email} onChange={(e) => updateVenue({ email: e.target.value })} required />
            </div>
            {!emailValid && <span style={{ color: "#ff6b6b", fontSize: ".76rem", marginTop: 4, display: "block" }}>الإيميل غير صحيح</span>}
          </div>
        </div>
      </div>

      <div className="field-group">
        <label>
          نبذة عن مكانك <span className="label-optional">اختياري</span>
        </label>
        <textarea
          className="field-input field-textarea"
          placeholder="اكتب وصفاً للنادي، ما الذي يجعله مميزاً، مواقف السيارات، معالم قريبة…"
          value={venue.description}
          onChange={(e) => updateVenue({ description: e.target.value })}
        />
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="field-group mb-0">
            <label>كلمة المرور</label>
            <div className="field-input-wrap">
              <i className="fa-solid fa-lock field-icon"></i>
              <input className="field-input" type="password" value={venue.password} onChange={(e) => updateVenue({ password: e.target.value })} placeholder="لحساب الدخول" required />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
