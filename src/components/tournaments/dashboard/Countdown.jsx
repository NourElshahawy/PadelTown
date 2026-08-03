"use client";

import { useEffect, useState } from "react";

function getTimeLeft(target) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
  };
}

export default function Countdown({ target, label = "يبدأ بعد" }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(target)), 60 * 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!timeLeft) return null;

  return (
    <section className="td-countdown">
      <span className="td-countdown-icon" aria-hidden="true">
        ⏳
      </span>
      <span className="td-countdown-label">{label}</span>
      <div className="td-countdown-units">
        <div className="td-countdown-unit">
          <span className="td-countdown-num">{String(timeLeft.days).padStart(2, "0")}</span>
          <span className="td-countdown-unit-label">يوم</span>
        </div>
        <div className="td-countdown-unit">
          <span className="td-countdown-num">{String(timeLeft.hours).padStart(2, "0")}</span>
          <span className="td-countdown-unit-label">ساعة</span>
        </div>
        <div className="td-countdown-unit">
          <span className="td-countdown-num">{String(timeLeft.minutes).padStart(2, "0")}</span>
          <span className="td-countdown-unit-label">دقيقة</span>
        </div>
      </div>
    </section>
  );
}
