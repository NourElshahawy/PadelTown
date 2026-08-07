import { Suspense } from "react";
import AuthVisual from "@/components/shared/AuthVisual";
import LoginForm from "@/_pages/login/LoginForm";

export const metadata = {
  title: "تسجيل الدخول — InstaPadel",
};

const FEATURES = [
  { icon: "bolt", text: "توفر المواعيد في الوقت الفعلي" },
  { icon: "verified_user", text: "ملعبين احترافيين معتمدين" },
  { icon: "lock", text: "دفع إلكتروني آمن" },
];

const QUOTE = {
  text: "كنت أتصل بثلاثة أندية قبل أن أجد ملعبًا متاحًا. الآن أتحقق من InstaPadel وألعب بعد عشرين دقيقة.",
  author: "أحمد سعيد، لاعب أسبوعي",
};

export default function LoginPage() {
  return (
    <div className="auth-shell">
      <AuthVisual heading="ملعب InstaPadel، بلمسة واحدة." features={FEATURES} />
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
