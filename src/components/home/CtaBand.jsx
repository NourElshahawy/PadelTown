import Link from "next/link";
import "../../styles/home/cta.css"
import ParallaxBg from "../ui/ParallaxBg";

export default function CtaBand() {
  return (
    <section className="news-section section">
      <ParallaxBg image="/assets/imgs/courts-bg.png" />
      <div className="container">
        <div className="cta-band" data-aos="zoom-in">
          <span className="eyebrow justify-content-center">جاهزون عندما تكون أنت جاهزاً</span>
          <h2 className="mt-3">جاهز للعب؟</h2>
          <p>ملعب InstaPadel على بُعد ضغطة واحدة. احجز مكانك وانضم إلينا النهاردة.</p>{" "}
          <div className="cta-buttons d-flex gap-3 justify-content-center mt-4 flex-column flex-md-row">
            <Link href="/find-partner" className="btn btn-accent">
              البحث عن شريك <i className="fa-solid fa-circle-arrow-left" style={{ color: "#000" }} />
            </Link>
            <Link href="/tournaments" className="btn btn-accent">
              <i className="fa-solid fa-circle-arrow-right" style={{ color: "#000" }} /> انضم او انشاء بطولة
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
