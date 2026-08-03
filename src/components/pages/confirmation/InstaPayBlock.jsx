"use client";
import { useEffect, useState } from "react";
import { markPaymentSent } from "@/services/bookingClient";

const INSTAPAY_NUMBER = "01065801252";
const HOLD_MINUTES = 15;

export default function InstaPayBlock({ amount, bookingId, displayId, onMarkPaid }) {
  const [secondsLeft, setSecondsLeft] = useState(HOLD_MINUTES * 60);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!proofFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(proofFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [proofFile]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(INSTAPAY_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setProofFile(file);
  };

  const handleMarkSent = async () => {
    if (!proofFile) {
      alert("لازم ترفع صورة سكرين شوت التحويل الأول");
      return;
    }
    setSaving(true);
    try {
      await markPaymentSent(bookingId, proofFile);
      onMarkPaid();
    } catch {
      alert("حصل خطأ أثناء تسجيل الدفع، حاول تاني");
    } finally {
      setSaving(false);
    }
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="instapay-block">
      <div className="instapay-amount">
        <span>المبلغ المستحق</span>
        <b>{amount} ج.م</b>
      </div>

      <div className="instapay-steps">
        <div className="instapay-step">
          <span className="instapay-num">1</span>
          <span>افتح تطبيق البنك أو InstaPay</span>
        </div>
        <div className="instapay-step">
          <span className="instapay-num">2</span>
          <span>
            أرسل <b>{amount} ج.م</b> إلى رقم InstaPay
          </span>
        </div>
        <div className="instapay-step">
          <span className="instapay-num">3</span>
          <span>
            استخدم معرف الحجز <b>{displayId}</b> كملاحظة التحويل
          </span>
        </div>
        <div className="instapay-step">
          <span className="instapay-num">4</span>
          <span>ارفع صورة سكرين شوت التحويل</span>
        </div>
      </div>

      <div className="instapay-number-box">
        <i className="fa-solid fa-mobile-screen"></i>
        <div>
          <span className="inp-label">رقم InstaPay</span>
          <b className="inp-num">{INSTAPAY_NUMBER}</b>
        </div>
        <button className="btn-copy" onClick={handleCopy} aria-label="نسخ الرقم">
          <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`}></i>
        </button>
      </div>

      <label className="instapay-upload">
        <input type="file" accept="image/*" onChange={handleFileChange} hidden />
        {previewUrl ? (
          <img src={previewUrl} alt="إثبات الدفع" className="instapay-upload-preview" />
        ) : (
          <>
            <i className="fa-solid fa-camera"></i>
            <span>ارفع صورة إثبات التحويل (إجباري)</span>
          </>
        )}
      </label>

      <button className="btn btn-accent btn-block" onClick={handleMarkSent} disabled={saving || !proofFile}>
        {saving ? "جاري الحفظ..." : "لقد قمت بإرسال الدفع"}
      </button>

      <p className="instapay-note">
        <i className="fa-solid fa-circle-info"></i>
        يتم التحقق من الدفع يدوياً. تم حجز ملعبك لمدة{" "}
        <b>
          {mm}:{ss}
        </b>
        .
      </p>
    </div>
  );
}
