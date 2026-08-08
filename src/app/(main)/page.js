import Hero from "@/components/home/Hero";
import FeaturedCourts from "@/components/home/FeaturedCourts";
import NewsSection from "@/components/home/NewsSection";
import CtaBand from "@/components/home/CtaBand";
import WhyUs from "@/components/home/WhyUs";
import OwnerPricingSection from "@/components/home/OwnerPricingSection";

export const metadata = {
  title: "حجز ملعب بادل في المنصورة | InstaPadel",
  description: "احجز ملعبك في InstaPadel أونلاين في ثوانٍ. ملعبين بادل احترافيين في المنصورة، شوف المواعيد المتاحة فورًا واحجز مكانك بدفع آمن.",
  keywords: [
    "حجز ملعب بادل المنصورة",
    "ملاعب بادل المنصورة",
    "ملعب بادل المنصورة",
    "بادل المنصورة",
    "حجز بادل المنصورة",
    "حجز ملعب بادل",
    "أقرب ملعب بادل من موقعي",
    "Padel Mansoura",
    "Padel Courts Mansoura",
  ],
};
export default function HomePage() {
  return (
    <>
      <link rel="preload" as="image" href="/assets/imgs/courts-bg.png" fetchPriority="high" />
      <Hero />
      <FeaturedCourts />
      <CtaBand />
      <NewsSection />
      <WhyUs />
      <OwnerPricingSection />
    </>
  );
}
