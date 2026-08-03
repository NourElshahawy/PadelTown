"use client";
import { useEffect, useRef } from "react";

export default function ParallaxBg({ image, speed = 0.35, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const section = el?.parentElement;
    if (!el || !section) return;

    // مستخدمينش window.matchMedia هنا عشان الرجوع للناس اللي مفضلين تقليل الحركة
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let ticking = false;

    const update = () => {
      const rect = section.getBoundingClientRect();
      // كل ما السكشن يبعد عن أعلى الشاشة، الخلفية تتحرك أبطأ من الصفحة
      const offset = rect.top * speed;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [speed]);

  return <div ref={ref} className={`parallax-bg ${className}`} style={{ backgroundImage: `url(${image})` }} />;
}
