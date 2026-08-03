import Link from "next/link";
import Image from "next/image";

const STEPS = [
  { id: 1, title: "معلومات المكان", sub: "الاسم، الموقع، وبيانات الاتصال" },
  { id: 2, title: "إعداد الملاعب", sub: "الأنواع والأسعار لكل ملعب" },
  { id: 3, title: "الصور", sub: "تحميل صور لكل ملعب" },
  { id: 4, title: "المرافق", sub: "المرافق وساعات العمل" },
  { id: 5, title: "مراجعة", sub: "تأكيد وإرسال" },
];

export default function WizardSideNav({ currentStep }) {
  return (
    <div className="wizard-side d-none d-lg-flex">
      <div className="wizard-steps-nav">
        {STEPS.map((step, i) => (
          <div key={step.id}>
            <div className={`wnav-item ${currentStep === step.id ? "is-active" : ""} ${currentStep > step.id ? "is-done" : ""}`}>
              <span className="wnav-num">{step.id}</span>
              <div className="wnav-label">
                <b>{step.title}</b>
                <span>{step.sub}</span>
              </div>
            </div>
            {i < STEPS.length - 1 && <div className={`wnav-connector ${currentStep > step.id ? "is-done" : ""}`} />}
          </div>
        ))}
      </div>

      <p className="wizard-side-note">
        <i className="fa-solid fa-circle-check"></i>
        يراجع فريقنا كل طلب خلال 24 ساعة قبل نشره.
      </p>
    </div>
  );
}
