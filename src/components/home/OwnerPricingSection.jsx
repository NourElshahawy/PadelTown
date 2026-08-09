import Link from "next/link";
import "../../styles/home/owner-pricing.css";

export default function OwnerPricingSection() {
  return (
    <section className="section" id="owner-pricing">
      <div className="container">
        <div className="text-center mx-auto" style={{ maxWidth: 620 }} data-aos="fade-up">
          <span className="eyebrow justify-content-center">لأصحاب الملاعب</span>
          <h2 className="section-title mt-3">سجّل ملعبك على InstaPadel</h2>
          <p className="section-sub mx-auto mt-3">إدارة كاملة لملاعبك وحجوزاتك من مكان واحد، بسعر ثابت وبساطة تسجيل حساب.</p>
        </div>

        <div className="row g-4 mt-3 justify-content-center">
          <div className="col-md-6 col-lg-5" data-aos="fade-up">
            <div className="owner-pricing-card">
              <span className="owner-pricing-badge">ابدأ مجانًا</span>
              <h3 className="owner-pricing-title">تجربة مجانية</h3>
              <p className="owner-pricing-amount">
                7 أيام <span>من غير أي التزام</span>
              </p>
              <p className="owner-pricing-desc">جرّب المنصة كاملة لمدة أسبوع — أضف ملاعبك واستقبل حجوزات حقيقية، وقرّر بعدها.</p>
              <ul className="owner-pricing-features">
                <li>
                  <i className="fa-solid fa-check"></i> كل المزايا متاحة من غير قيود
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> من غير بيانات دفع مقدمًا
                </li>
              </ul>
            </div>
          </div>

          <div className="col-md-6 col-lg-5" data-aos="fade-up" data-aos-delay="80">
            <div className="owner-pricing-card is-featured">
              <span className="owner-pricing-badge">الاشتراك الشهري</span>
              <h3 className="owner-pricing-title">سعر ثابت واحد</h3>
              <p className="owner-pricing-amount">
                1500 ج.م <span>/ الشهر</span>
              </p>
              <p className="owner-pricing-desc">كل حاجة محتاجها عشان تدير ملاعبك أونلاين، من غير عمولة على كل حجز.</p>
              <ul className="owner-pricing-features">
                <li>
                  <i className="fa-solid fa-check"></i> عدد ملاعب غير محدود
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> حجوزات أونلاين على مدار الساعة
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> لوحة تحكم كاملة للحجوزات والعملاء والإيرادات
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> جدولة وقفل ساعات يدويًا
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-4" data-aos="fade-up">
          <Link href="/register/owner" className="btn btn-accent">
            سجّل كصاحب ملعب
          </Link>
        </div>
      </div>
    </section>
  );
}
