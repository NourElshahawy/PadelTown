"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitSubscriptionPayment } from "@/services/subscriptionClient";
import { useToast } from "@/components/shared/ToastProvider";

export default function SubscriptionRenewForm({ ownerId }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [proofFile, setProofFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofFile) return;
    setSubmitting(true);
    try {
      await submitSubscriptionPayment(ownerId, proofFile, paymentMethod);
      setSent(true);
      showToast("تم إرسال طلب الاشتراك، هنراجعه ونرد عليك قريب", "success");
      router.refresh();
    } catch {
      showToast("حصل خطأ أثناء إرسال الطلب، حاول تاني", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return <p style={{ color: "var(--accent)", fontSize: ".9rem" }}>✓ طلبك بانتظار مراجعة الإدارة.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field-group">
        <label>طريقة الدفع</label>
        <select className="field-input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="bank_transfer">تحويل بنكي</option>
          <option value="vodafone_cash">فودافون كاش</option>
        </select>
      </div>

      <div className="field-group">
        <label>إثبات الدفع</label>
        <label className="instapay-upload">
          <input type="file" accept="image/*" onChange={handleFileChange} hidden />
          {previewUrl ? (
            <img src={previewUrl} alt="إثبات الدفع" className="instapay-upload-preview" />
          ) : (
            <>
              <i className="fa-solid fa-camera"></i>
              <span>ارفع صورة إثبات التحويل</span>
            </>
          )}
        </label>
      </div>

      <button type="submit" className="owner-btn-save" disabled={submitting || !proofFile}>
        {submitting ? "جاري الإرسال…" : "إرسال للمراجعة"}
      </button>
    </form>
  );
}
