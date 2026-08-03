"use client";
import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/services/authClient";
// import "@/styles/pages/forgot-password.css";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | sent
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      await requestPasswordReset(email);
      setStatus("sent");
    } catch {
      setError("حصل خطأ، تأكد من صحة الإيميل وحاول تاني.");
      setStatus("idle");
    }
  };

  if (status === "sent") {
    return (
      <div className="auth-form-col">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <i className="fa-solid fa-envelope-open-text forgot-success-icon"></i>
          <h1>تفقد بريدك الإلكتروني</h1>
          <p className="auth-sub">بعتنالك رابط لإعادة تعيين كلمة المرور على {email} — افتحه من جهازك ده عشان يشتغل صح.</p>
          <Link href="/login" className="auth-link">رجوع لتسجيل الدخول</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form-col">
      <div className="auth-card">
        <h1>نسيت كلمة المرور؟</h1>
        <p className="auth-sub">اكتب إيميلك وهنبعتلك رابط لإعادة تعيين كلمة المرور.</p>

        {error && <p style={{ color: "#ff6b6b", fontSize: ".85rem", marginBottom: 16 }}>{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="resetEmail">البريد الإلكتروني</label>
            <div className="field-input-wrap">
              <i className="fa-solid fa-envelope field-icon" />
              <input
                className="field-input" type="email" id="resetEmail"
                placeholder="nour123@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-accent btn-block" disabled={status === "loading"}>
            {status === "loading" ? "جاري الإرسال…" : "إرسال رابط إعادة التعيين"}
          </button>
        </form>

        <p className="auth-switch">
          تذكرت كلمة المرور؟ <Link href="/login" className="auth-link">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}