import "../../styles/home/why-us.css";
import ParallaxBg from "../ui/ParallaxBg";

const FEATURES = [
  { icon: "bolt", title: "التوافر في الوقت الفعلي", text: "يتم تحديث الجداول فور حجز أي شخص، لذلك لن تحضر أبدًا إلى ملعب مشغول بالفعل." },
  { icon: "bolt-lightning", title: "حجز فوري", text: "اختر موعدًا واحجزه فورًا - بدون مكالمات هاتفية، وبدون انتظار رد من النادي" },
  { icon: "shield-halved", title: "مدفوعات آمنة", text: "ادفع عبر الإنترنت من خلال عملية دفع مشفرة، وسيتم إرسال التأكيد مباشرة إلى هاتفك." },
  { icon: "user-check", title: "الملاعب المعتمدة", text: "يتم زيارة كل نادٍ على موقع InstaPadel والتحقق منه، لذا فإن الصور تتطابق دائمًا مع المكان الذي تدخل إليه." },
];

export default function WhyUs() {
  return (
    <section className="news-section section" id="how-it-works">
      <ParallaxBg image="/assets/imgs/courts-bg.png" />
      <div className="container">
        <div className="text-center mx-auto" style={{ maxWidth: 620 }} data-aos="fade-up">
          <span className="eyebrow justify-content-center">لماذا InstaPadel</span>
          <h2 className="section-title mt-3">صُممت لإزالة كل عذر لعدم اللعب</h2>
          <p className="section-sub mx-auto mt-3">من البحث الأول إلى صافرة النهاية، تم تصميم كل خطوة لتكون أسرع من الاتصال بنادٍ.</p>
        </div>

        <div className="row g-4 mt-3">
          {FEATURES.map((f, i) => (
            <div className="col-sm-6 col-lg-3" data-aos="fade-up" data-aos-delay={i * 80} key={f.title}>
              <div className="feature-card">
                <span className="icon-circle">
                  <i className={`fa-solid fa-${f.icon}`}></i>
                </span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
