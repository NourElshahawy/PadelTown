"use client";
import { useState } from "react";
import { signUpOwner } from "@/services/authClient";
import { createVenueWithCourts } from "@/services/venueClient";
import { useRouter } from "next/navigation";
import WizardSideNav from "./WizardSideNav";
import WizardTopbar from "./WizardTopbar";
import Step1VenueInfo from "./steps/Step1VenueInfo";
import Step2Courts from "./steps/Step2Courts";
import Step3Photos from "./steps/Step3Photos";
import Step4Amenities from "./steps/Step4Amenities";
import Step5Review from "./steps/Step5Review";
import "@/styles/pages/owner-register.css";

const TOTAL_STEPS = 5;
let nextCourtId = 1;

export default function OwnerWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const [venue, setVenue] = useState({ name: "", address: "", phone: "", email: "", description: "" });
  const [courts, setCourts] = useState([{ id: nextCourtId++, name: "", type: "regular", price: "" }]);
  const [photosByCourtId, setPhotosByCourtId] = useState({});
  const [amenities, setAmenities] = useState([]);
  const [hours, setHours] = useState({ weekdayOpen: "08:00", weekdayClose: "24:00", fridayOpen: "10:00", fridayClose: "24:00" });
  const [cancellationPolicy, setCancellationPolicy] = useState("flexible");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const updateVenue = (patch) => setVenue((v) => ({ ...v, ...patch }));

  const updateCourt = (id, updated) => setCourts((cs) => cs.map((c) => (c.id === id ? updated : c)));
  const addCourt = () => setCourts((cs) => (cs.length >= 20 ? cs : [...cs, { id: nextCourtId++, name: "", type: "regular", price: "" }]));
  const removeCourt = (id) => {
    setCourts((cs) => cs.filter((c) => c.id !== id));
    setPhotosByCourtId((p) => {
      const next = { ...p };
      delete next[id];
      return next;
    });
  };

  const addPhoto = (courtId, photo) => setPhotosByCourtId((p) => ({ ...p, [courtId]: [...(p[courtId] || []), photo] }));
  const removePhoto = (courtId, photoId) => setPhotosByCourtId((p) => ({ ...p, [courtId]: (p[courtId] || []).filter((ph) => ph.id !== photoId) }));

  const toggleAmenity = (value) => setAmenities((a) => (a.includes(value) ? a.filter((x) => x !== value) : [...a, value]));
  const updateHours = (patch) => setHours((h) => ({ ...h, ...patch }));

  const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  const isValidEgyptianPhone = (phone) => /^01[0125]\d{8}$/.test(phone.trim());

  const canGoNext = () => {
    if (currentStep === 1) return venue.name.trim().length >= 2 && isValidEgyptianPhone(venue.phone) && isValidEmail(venue.email);
    if (currentStep === 2) return courts.every((c) => c.name.trim() && c.price);
    return true;
  };

  const goNext = () => canGoNext() && setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!agreeTerms) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const { user } = await signUpOwner({
        name: venue.name,
        email: venue.email,
        phone: venue.phone,
        password: venue.password,
      });

      await createVenueWithCourts({
        ownerId: user.id,
        venue,
        courts,
        photosByCourtId,
        amenities,
        hours,
        cancellationPolicy,
      });

      setSubmitted(true);
      setTimeout(() => router.push("/owner/dashboard"), 1800);
    } catch (err) {
      setSubmitError("حصل خطأ أثناء إنشاء الحساب: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wizard-shell">
      <WizardSideNav currentStep={currentStep} />

      <div className="wizard-form-col">
        <WizardTopbar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        <div className="wizard-inner">
          {currentStep === 1 && <Step1VenueInfo venue={venue} updateVenue={updateVenue} />}
          {currentStep === 2 && <Step2Courts courts={courts} updateCourt={updateCourt} addCourt={addCourt} removeCourt={removeCourt} />}
          {currentStep === 3 && <Step3Photos courts={courts} photosByCourtId={photosByCourtId} addPhoto={addPhoto} removePhoto={removePhoto} />}
          {currentStep === 4 && (
            <Step4Amenities
              amenities={amenities}
              toggleAmenity={toggleAmenity}
              hours={hours}
              updateHours={updateHours}
              cancellationPolicy={cancellationPolicy}
              setCancellationPolicy={setCancellationPolicy}
            />
          )}
          {currentStep === 5 && <Step5Review venue={venue} courts={courts} amenities={amenities} cancellationPolicy={cancellationPolicy} agreeTerms={agreeTerms} setAgreeTerms={setAgreeTerms} />}

          <div className="wizard-nav">
            {currentStep > 1 ? (
              <button type="button" className="btn btn-ghost" onClick={goBack} disabled={submitting}>
                السابق <i className="fa-solid fa-arrow-left" />
              </button>
            ) : (
              <span />
            )}

            {currentStep < TOTAL_STEPS ? (
              <button type="button" className="btn btn-accent" onClick={goNext} disabled={!canGoNext()}>
                <i className="fa-solid fa-arrow-right" /> التالي
              </button>
            ) : (
              // <button type="button" className="btn btn-accent" onClick={handleSubmit} disabled={!agreeTerms || submitting}>
              //   <i className="fa-solid fa-circle-check" />
              //   {submitted ? "تم الإرسال ✓" : submitting ? "جاري الإرسال…" : "إرسال القائمة"}
              //   </button>
              <button type="button" className="btn btn-accent" onClick={handleSubmit} disabled={!agreeTerms || submitting}>
                <i className="fa-solid fa-circle-check" />
                {submitError ? submitError : submitted ? "تم الإرسال ✓" : submitting ? "جاري الإرسال…" : "إرسال القائمة"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
