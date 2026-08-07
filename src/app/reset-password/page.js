import AuthVisual from "@/components/shared/AuthVisual";
import ResetPasswordForm from "@/components/pages/login/ResetPasswordForm";

export const metadata = { title: "إعادة تعيين كلمة المرور — InstaPadel" };

const FEATURES = [
  { icon: "bolt", text: "توفر المواعيد في الوقت الفعلي" },
  { icon: "verified_user", text: "ملعبين احترافيين معتمدين" },
  { icon: "lock", text: "دفع إلكتروني آمن" },
];

export default function ResetPasswordPage() {
  return (
    <div className="auth-shell">
      <AuthVisual heading="ملعب InstaPadel، بلمسة واحدة." features={FEATURES} />
      <ResetPasswordForm />
    </div>
  );
}
