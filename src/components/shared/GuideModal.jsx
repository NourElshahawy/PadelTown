"use client";
import { useState } from "react";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

/**
 * كومبوننت عام قابل لإعادة الاستخدام لأي بوب أب إرشادي بخطوات،
 * بنفس شكل وسلوك BookingGuideModal بالظبط.
 *
 * الاستخدام:
 * <GuideModal steps={[{ icon: "fa-...", title: "...", text: "..." }]} onClose={...} finalLabel="يلا نبدأ" />
 */
export default function GuideModal({ steps, onClose, finalLabel = "يلا نبدأ" }) {
  useLockBodyScroll(true);
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="booking-guide-overlay">
      <div className="booking-guide-card">
        <button className="booking-guide-skip" onClick={onClose}>
          تخطي
        </button>
        <i className={`booking-guide-icon fa-solid ${steps[step].icon}`}></i>
        <h3>{steps[step].title}</h3>
        <p>{steps[step].text}</p>
        <div className="booking-guide-dots">
          {steps.map((_, i) => (
            <span key={i} className={`booking-guide-dot ${i === step ? "is-active" : ""}`} />
          ))}
        </div>
        <button className="btn btn-accent btn-block" onClick={handleNext}>
          {isLast ? finalLabel : "التالي"}
        </button>
      </div>
    </div>
  );
}
