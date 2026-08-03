"use client";
import { useEffect, useRef, useState } from "react";

export function useLiveSlots(initialSlots) {
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [slots, setSlots] = useState(initialSlots.map((time) => ({ time, taken: false, leaving: false })));
  const intervalsRef = useRef([]);

  useEffect(() => {
    const tickerId = setInterval(() => {
      setSecondsAgo((s) => (s + 4 >= 60 ? 0 : s + 4));
    }, 4000);

    const slotId = setInterval(() => {
      setSlots((prev) => {
        const eligible = prev.map((s, i) => ({ ...s, i })).filter((s) => !s.taken);
        if (eligible.length < 2) return prev;
        const target = eligible[Math.floor(Math.random() * eligible.length)];
        const next = [...prev];
        next[target.i] = { ...next[target.i], leaving: true };
        setTimeout(() => {
          setSlots((cur) => {
            const updated = [...cur];
            updated[target.i] = { ...updated[target.i], taken: true, leaving: false };
            return updated;
          });
        }, 350);
        return next;
      });
    }, 6000);

    intervalsRef.current = [tickerId, slotId];
    return () => intervalsRef.current.forEach(clearInterval);
  }, []);

  const label = secondsAgo < 60 ? `Updated ${secondsAgo}s ago` : "Updated just now";
  return { slots, label };
}
