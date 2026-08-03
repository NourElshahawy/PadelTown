import Link from "next/link";
import CourtCard from "@/components/courts/CourtCard";
import { getFeaturedCourts } from "@/services/courtService";
import "../../styles/home/featured-courts.css";
import ParallaxBg from "../ui/ParallaxBg";

export default async function FeaturedCourts() {
  const courts = await getFeaturedCourts();

  return (
    <section className="courts-section section" id="courts">
      <ParallaxBg image="/assets/imgs/courts-bg.png" />
      <div className="courts-overlay" />
      <div className="container">
        <div className="section-head">
          <div data-aos="fade-up">
            <span className="eyebrow">الملاعب المميزة</span>
            <h2 className="section-title mt-3">
              ملاعب البادل الأعلى <span className="accent-underline">تصنيفاً</span>
            </h2>
            <p className="section-sub" data-aos="fade-up" data-aos-delay="80">
              نوادي مختارة بعناية مع مرافق موثقة، وأسعار شفافة، يتم تحديثها فور حجز أي شخص.
            </p>
          </div>
          <div data-aos="fade-up">
            <div className="hero-meta" data-aos="fade-up" data-aos-delay="320">
              <span className="meta-item">
                <i className="fa-regular fa-circle-check" /> ملاعب معتمدة
              </span>
              <span className="meta-item">
                <i className="fa-solid fa-calendar-check"></i>
                حجز فوري
              </span>
              <span className="meta-item">
                <i className="fa-solid fa-shield-halved"></i>
                دفع آمن
              </span>
            </div>
          </div>
        </div>

        <div className="courts-grid">
          <div className="row g-4">
            {courts?.length > 0 ? (
              courts.slice(0, 3).map((court) => (
                <div className="col-md-6 col-lg-4" key={court.id}>
                  <CourtCard court={court} />
                </div>
              ))
            ) : (
              <p>لا توجد ملاعب حالياً</p>
            )}
          </div>

          <div className="text-center mt-5" data-aos="fade-up">
            <Link href="/courts" className="btn btn-ghost">
              اكتشف جميع الملاعب <i className="fa-solid fa-arrow-left" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
