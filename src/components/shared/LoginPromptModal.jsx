"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { createClient } from "@/lib/supabase/client";

export default function LoginPromptModal() {
  const [show, setShow] = useState(false);
  const router = useRouter();
  useLockBodyScroll(show);

  useEffect(() => {
    const check = async () => {
      try {
        if (localStorage.getItem("acetown_login_prompt_shown")) return;
      } catch {
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setShow(true);
      }
    };
    check();
  }, []);

  const markShown = () => {
    try {
      localStorage.setItem("acetown_login_prompt_shown", "1");
    } catch {}
  };

  const handleGoLogin = () => {
    markShown();
    router.push("/login");
  };

  const handleClose = () => {
    markShown();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="booking-guide-overlay" onClick={handleClose}>
      <div className="booking-guide-card" onClick={(e) => e.stopPropagation()}>
        <button className="booking-guide-skip" onClick={handleClose}>
          تخطي
        </button>
        <i className="booking-guide-icon fa-solid fa-user-check"></i>
        <h3>سجّل دخولك أسرع</h3>
        <p>سجّل دخولك عشان تشوف المواعيد المتاحة لحظيًا وتحجز ملعبك في ثوانٍ.</p>

        <button className="btn btn-accent btn-block" onClick={handleGoLogin} style={{ marginTop: 16 }}>
          تسجيل الدخول
        </button>
      </div>
    </div>
  );
}
