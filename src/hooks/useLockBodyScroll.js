"use client";
import { useEffect } from "react";

// يمنع أي تفاعل (سكرول) مع باقي الصفحة طول ما البوب أب مفتوح، ويرجّعها زي ما كانت لما يتقفل
export function useLockBodyScroll(isLocked = true) {
  useEffect(() => {
    if (!isLocked) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // نعوّض عرض الـ scrollbar اللي هيختفي عشان الصفحة متقفزش يمين/شمال فجأة
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isLocked]);
}
