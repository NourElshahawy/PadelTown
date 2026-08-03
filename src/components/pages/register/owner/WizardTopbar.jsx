import Link from "next/link";

export default function WizardTopbar({ currentStep, totalSteps }) {
  return (
    <>
      <div className="wizard-topbar d-flex d-lg-none">
        <Link href="/" className="brand">
          Ace Town
        </Link>
        <span className="wizard-mobile-step">
          الخطوة <b>{currentStep}</b> من {totalSteps}
        </span>
      </div>
      <div className="wizard-progress d-lg-none">
        <div className="wizard-progress-fill" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
      </div>
    </>
  );
}
