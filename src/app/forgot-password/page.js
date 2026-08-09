import AuthVisual from "@/components/shared/AuthVisual";
import ForgotPasswordForm from "@/components/pages/login/ForgotPasswordForm";

export const metadata = { title: "استعادة كلمة المرور — PadelTown" };

const FEATURES = [
  { icon: "bolt", text: "توفر المواعيد في الوقت الفعلي" },
  { icon: "verified_user", text: "ملعبين احترافيين معتمدين" },
  { icon: "lock", text: "دفع إلكتروني آمن" },
];

export default function ForgotPasswordPage() {
  return (
    <div className="auth-shell">
      <AuthVisual heading="ملعب PadelTown، بلمسة واحدة." features={FEATURES} />
      <ForgotPasswordForm />
    </div>
  );
}
