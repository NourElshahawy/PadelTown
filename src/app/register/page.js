import AuthVisual from "@/components/shared/AuthVisual";
import RegisterForm from "@/_pages/register/RegisterForm";
// import "@/styles/pages/register.css";

export const metadata = {
  title: "إنشاء حساب — Ace Town",
};

const FEATURES = [
  { icon: "bolt", text: "حجز فوري، بدون مكالمات هاتفية" },
  { icon: "verified_user", text: "لاعبين بيحجزوا كل يوم" },
  { icon: "star", text: "متوسط تقييم الملاعب 4.9" },
];

const QUOTE = {
  text: "المواعيد المتاحة المباشرة هي المكسب الحقيقي. مجموعتي تلعب في اللحظة الأخيرة أيام الجمعة ودائمًا نجد ملعبًا متاحًا.",
  author: "نورهان عادل، لاعبة منتظمة",
};

export default function RegisterPage() {
  return (
    <div className="auth-shell">
      <AuthVisual heading="انضم إلى مجتمع البادل الأسرع نمواً في المنصورة." features={FEATURES} quote={QUOTE} />
      <RegisterForm />
    </div>
  );
}
