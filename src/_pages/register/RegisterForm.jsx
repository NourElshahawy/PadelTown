"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PasswordField from "@/components/shared/PasswordField";
import AccountTypeSelector from "./AccountTypeSelector";
import { signUpPlayer, signInWithGoogle } from "@/services/authClient";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!avatarFile) {
      setError("الصورة الشخصية إجبارية عشان يبقى في ثقة بينك وبين باقي اللاعبين.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("كلمة المرور غير متطابقة");
      return;
    }
    if (!/^01[0125]\d{8}$/.test(form.phone.trim())) {
      setError("رقم الهاتف لازم يكون رقم مصري صحيح (01 وبعده 9 أرقام)");
      return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email.trim())) {
      setError("الإيميل غير صحيح، اكتب إيميل حقيقي (زي name@example.com)");
      return;
    }

    setStatus("loading");
    try {
      const data = await signUpPlayer({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        avatarFile,
      });

      if (data.session) {
        router.push("/");
        router.refresh();
      } else {
        setStatus("check-email");
      }
    } catch (err) {
      if (err.message?.includes("already registered") || err.message?.includes("already exists") || err.message?.includes("مسجل بالفعل")) {
        setError("الإيميل ده مسجل بالفعل، جرب تسجل الدخول بدل كده.");
      } else {
        setError("حصل خطأ أثناء إنشاء الحساب، حاول تاني.");
      }
      setStatus("idle");
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
    } catch {
      setError("حصل خطأ أثناء التسجيل بجوجل");
    }
  };

  if (status === "check-email") {
    return (
      <div className="auth-form-col">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <i className="fa-solid fa-envelope-open-text" style={{ fontSize: 48, color: "var(--accent)" }}></i>
          <h1 style={{ marginTop: 16 }}>تأكد من إيميلك</h1>
          <p className="auth-sub">بعتنالك رابط تفعيل على {form.email} — افتحه عشان تكمّل تسجيل حسابك.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form-col">
      <div className="auth-topbar d-flex d-lg-none">
        <Link href="/" className="brand">
          <Image src="/assets/imgs/logo1-removebg-preview.png" alt="InstaPadel" width={56} height={56} />
        </Link>
      </div>

      <div className="auth-card">
        <h1>أنشئ حسابك</h1>
        <p className="auth-sub">انضم إلى InstaPadel واحجز ملعبك الأول في دقائق.</p>

        <AccountTypeSelector />

        {/* ===== رفع الصورة الشخصية ===== */}
        <div className="avatar-upload-field">
          <label htmlFor="avatarInput" className="avatar-upload-circle">
            {avatarPreview ? <img src={avatarPreview} alt="" /> : <i className="fa-solid fa-camera"></i>}
          </label>
          <input id="avatarInput" type="file" accept="image/*" onChange={handleAvatarChange} hidden />
          <p className="avatar-upload-hint">صورة شخصية واضحة — إجبارية عشان تبني ثقة مع باقي اللاعبين</p>
        </div>

        <button type="button" className="social-btn" onClick={handleGoogleSignup}>
          <i className="fa-brands fa-google" />
          تابع باستخدام Google
        </button>

        <div className="auth-divider">أو سجل بالبريد الإلكتروني</div>

        {error && <p style={{ color: "#ff6b6b", fontSize: ".85rem", marginBottom: 16 }}>{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="regName">الاسم الكامل</label>
            <div className="field-input-wrap">
              <i className="fa-solid fa-circle-user field-icon" />
              <input className="field-input" type="text" id="regName" name="name" placeholder="اسمك الكامل" value={form.name} onChange={handleChange} required />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="regEmail">البريد الإلكتروني</label>
            <div className="field-input-wrap">
              <i className="fa-solid fa-envelope field-icon" />
              <input className="field-input" type="email" id="regEmail" name="email" placeholder="nour123@gmail.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="regPhone">رقم الهاتف</label>
            <div className="field-input-wrap">
              <i className="fa-solid fa-phone field-icon" />
              <input className="field-input phone-rtl-fix" type="tel" id="regPhone" name="phone" placeholder="01xx xxx xxxx" value={form.phone} onChange={handleChange} required />
            </div>
          </div>

          <PasswordField id="regPassword" label="كلمة المرور" placeholder="أنشئ كلمة مرور" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          <PasswordField
            id="regConfirm"
            label="تأكيد كلمة المرور"
            placeholder="أعد إدخال كلمة المرور"
            value={form.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
          />

          <div className="terms-row">
            <input type="checkbox" id="regTerms" name="agreeTerms" checked={form.agreeTerms} onChange={handleChange} required />
            <label htmlFor="regTerms">
              أوافق على{" "}
              <Link href="/legal#terms" className="auth-link">
                شروط الخدمة
              </Link>{" "}
              و{" "}
              <Link href="/legal#privacy" className="auth-link">
                سياسة الخصوصية
              </Link>{" "}
              الخاصة بـ InstaPadel.
            </label>
          </div>

          <button type="submit" className="btn btn-accent btn-block" disabled={status === "loading"}>
            {status === "loading" ? "جاري الإنشاء…" : "أنشئ الحساب"}
          </button>
        </form>

        <p className="auth-switch">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="auth-link">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
