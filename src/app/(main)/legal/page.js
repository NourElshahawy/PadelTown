import { TERMS_SECTIONS, PRIVACY_SECTIONS } from "@/services/legalContent";

export const metadata = {
  title: "الشروط والخصوصية — InstaPadel",
  description: "شروط الخدمة وسياسة الخصوصية الخاصة بمنصة InstaPadel.",
};

export default function LegalPage() {
  return (
    <div className="legal-shell">
      <aside className="legal-toc">
        <p className="toc-label">المحتويات</p>
        <a href="#terms" className="toc-link">
          شروط الخدمة
        </a>
        {TERMS_SECTIONS.map((s) => (
          <a key={s.title} href={`#terms-${slug(s.title)}`} className="toc-link toc-sub">
            {s.title}
          </a>
        ))}
        <a href="#privacy" className="toc-link" style={{ marginTop: 14 }}>
          سياسة الخصوصية
        </a>
        {PRIVACY_SECTIONS.map((s) => (
          <a key={s.title} href={`#privacy-${slug(s.title)}`} className="toc-link toc-sub">
            {s.title}
          </a>
        ))}
      </aside>

      <div className="legal-content">
        <div className="legal-hero">
          <h1>الشروط والخصوصية</h1>
          <div className="legal-meta">
            <span>
              <i className="fa-solid fa-calendar-days"></i> آخر تحديث: 20 يوليو 2026
            </span>

            <span>
              <i className="fa-solid fa-scale-balanced"></i> يسري في الدول العربية
            </span>
          </div>
          <div className="legal-intro-box">
            <i className="fa-solid fa-circle-info"></i>
            <p>باستخدامك لمنصة InstaPadel، فإنك توافق على شروط الخدمة وسياسة الخصوصية الموضحة أدناه. يرجى قراءتها بعناية قبل إنشاء حسابك.</p>
          </div>
        </div>

        <section id="terms">
          <div className="legal-section-title">
            <h2>شروط الخدمة</h2>
          </div>
          {TERMS_SECTIONS.map((s, i) => (
            <div className="legal-section" id={`terms-${slug(s.title)}`} key={s.title}>
              <h3>
                <span className="section-num">{i + 1}</span> {s.title.replace(/^\d+\.\s*/, "")}
              </h3>
              <p>{s.body}</p>
            </div>
          ))}
        </section>

        <div className="legal-divider" />

        <section id="privacy">
          <div className="legal-section-title">
            <h2>سياسة الخصوصية</h2>
          </div>
          {PRIVACY_SECTIONS.map((s, i) => (
            <div className="legal-section" id={`privacy-${slug(s.title)}`} key={s.title}>
              <h3>
                <span className="section-num">{i + 1}</span> {s.title.replace(/^\d+\.\s*/, "")}
              </h3>
              <p>{s.body}</p>
            </div>
          ))}
        </section>

        <div className="legal-footer-note">
          <i className="fa-solid fa-envelope"></i>
          <p>
            لأي استفسار بخصوص الشروط أو سياسة الخصوصية، أو لطلب حذف بياناتك، تواصل معنا على{" "}
            <a href="mailto:Enour1847@gmail.com" className="legal-link">
              Enour1847@gmail.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function slug(str) {
  return str.toLowerCase().replace(/[^\w\s]/g, "").trim().replace(/\s+/g, "-");
}