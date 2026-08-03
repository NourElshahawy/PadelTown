import Link from "next/link";
import Image from "next/image";
import "../../styles/layout/footer.css";

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 footer-brand" id="about">
            <Link href="/" className="brand">
              <Image src="/assets/imgs/logo1-removebg-preview.png" alt="Ace Town" width={56} height={56} />
            </Link>
            <p>أسرع طريقة للعثور على ملعب بادل وحجزه في المنصورة — مواعيد فورية، أندية موثقة، دفع آمن.</p>
            <div className="social-row">
              <a href="https://www.instagram.com/acetowneg/" target="_blank" rel="noreferrer" aria-label="Instagram">
                <i className="fa-brands fa-instagram" />
              </a>
              <a href="https://wa.me/201000665539" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <i className="fa-brands fa-whatsapp" />
              </a>
            </div>
          </div>

          <div className="col-md-6 col-lg-2 footer-col">
            <h4>المنصة</h4>
            <Link href="/">الرئيسية</Link>
            <Link href="/courts">احجز ملعباً</Link>
            <Link href="/find-partner"> ابحث عن شريك</Link>
            <Link href="/news">أخبار البادل</Link>
          </div>

          <div className="col-md-6 col-lg-2 footer-col">
            <h4>الدعم</h4>
            <Link href="/legal#terms">الشروط والخصوصية</Link>
          </div>

          <div className="col-lg-4 footer-col">
            <h4>تواصل معنا</h4>
            <ul className="footer-contact">
              <li>
                <Link href="https://www.google.com/maps?q=Ace+Town,+Ring+Road+9+Mansoura+city+-+Hod+el+bashtamer+No,+Mansoura+Qism+2,+El+Mansoura+1,+Dakahlia+Governorate+7631122&ftid=0x14f79d58d1ffde1b:0x8d037a877e1e394f" target="_blank" rel="noreferrer">
                  <i className="fa-solid fa-location-dot" /> الطريق الدائري، حوض البشتامر، المنصورة قسم 2، الدقهلية
                </Link>
              </li>
              <li>
                <Link href="tel:+201000665539">
                  <i className="fa-solid fa-phone-volume"></i>
                  +20 100 066 5539
                </Link>
              </li>
              <li>
                <Link href="mailto:Enour1847@gmail.com">
                  <i className="fa-regular fa-envelope"></i>
                  Enour1847@gmail.com
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Ace Town. جميع الحقوق محفوظة.</span>
          <span>
            <Link href="/legal#terms" className="auth-link">
              شروط الخدمة
            </Link>{" "}
            ·{" "}
            <Link href="/legal#privacy" className="auth-link">
              سياسة الخصوصية
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
