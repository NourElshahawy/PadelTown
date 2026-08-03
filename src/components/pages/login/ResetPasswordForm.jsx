"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordField from "@/components/shared/PasswordField";
import { updatePassword } from "@/services/authClient";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("كلمة المرور غير متطابقة");
      return;
    }
    if (password.length < 6) {
      setError("كلمة المرور لازم تكون 6 حروف على الأقل");
      return;
    }

    setStatus("loading");
    try {
      await updatePassword(password);
      router.push("/login?reset=success");
    } catch {
      setError("حصل خطأ، الرابط ممكن يكون منتهي الصلاحية. جرب تطلب رابط جديد.");
      setStatus("idle");
    }
  };

  return (
    <div className="auth-form-col">
      <div className="auth-card">
        <h1>إعادة تعيين كلمة المرور</h1>
        <p className="auth-sub">اختار كلمة مرور جديدة لحسابك.</p>

        {error && <p style={{ color: "#ff6b6b", fontSize: ".85rem", marginBottom: 16 }}>{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <PasswordField id="newPassword" label="كلمة المرور الجديدة" placeholder="أدخل كلمة مرور جديدة" value={password} onChange={(e) => setPassword(e.target.value)} />
          <PasswordField id="confirmNewPassword" label="تأكيد كلمة المرور" placeholder="أعد إدخال كلمة المرور" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

          <button type="submit" className="btn btn-accent btn-block" disabled={status === "loading"}>
            {status === "loading" ? "جاري الحفظ…" : "حفظ كلمة المرور الجديدة"}
          </button>
        </form>
      </div>
    </div>
  );
}