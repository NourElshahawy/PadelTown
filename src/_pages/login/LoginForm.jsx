"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PasswordField from "@/components/shared/PasswordField";
import { signInWithPassword, signInWithGoogle } from "@/services/authClient";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const { user } = await signInWithPassword({
        email: form.email,
        password: form.password,
      });

      const supabase = createClient();
      const { data: profile } = await supabase.from("profiles").select("role, avatar_url").eq("id", user.id).single();

      if (redirectTo) {
        router.push(redirectTo);
      } else if (profile?.role === "owner") {
        router.push("/owner/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err) {
      if (err.message?.includes("Email not confirmed")) {
        setError("لازم تأكد إيميلك الأول من الرسالة اللي بعتناها لك وقت التسجيل.");
      } else {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }
      setStatus("idle");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch {
      setError("حصل خطأ أثناء تسجيل الدخول بجوجل");
    }
  };

  return (
    <div className="auth-form-col">
      <div className="auth-topbar d-flex d-lg-none">
        <Link href="/" className="brand">
          <Image src="/assets/imgs/logo1-removebg-preview.png" alt="PadelTown" width={56} height={56} />
        </Link>
      </div>

      <div className="auth-card">
        <h1>مرحبًا بعودتك</h1>
        <p className="auth-sub">سجّل الدخول لتحجز ملعبك التالي في أقل من دقيقة.</p>

        <button type="button" className="social-btn" onClick={handleGoogleLogin}>
          <i className="fa-brands fa-google" />
          تابع باستخدام Google
        </button>

        <div className="auth-divider">أو سجّل الدخول بالبريد الإلكتروني</div>

        {error && <p style={{ color: "#ff6b6b", fontSize: ".85rem", marginBottom: 16 }}>{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="loginEmail">البريد الإلكتروني</label>
            <div className="field-input-wrap">
              <i className="fa-solid fa-envelope field-icon" />
              <input className="field-input" type="email" id="loginEmail" name="email" placeholder="nour123@gmail.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <PasswordField id="loginPassword" label="كلمة المرور" placeholder="أدخل كلمة المرور" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />

          <div className="field-row-between">
            <label className="remember-check">
              <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} />
              تذكرني
            </label>
            <Link href="/forgot-password" className="auth-link">
              نسيت كلمة المرور؟
            </Link>
          </div>

          <button type="submit" className="btn btn-accent btn-block" disabled={status === "loading"}>
            {status === "loading" ? "جاري تسجيل الدخول…" : "تسجيل الدخول"}
          </button>
        </form>

        <p className="auth-switch">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="auth-link">
            أنشئ واحدًا
          </Link>
        </p>
      </div>
    </div>
  );
}
