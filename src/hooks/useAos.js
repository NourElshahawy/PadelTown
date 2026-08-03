"use client";
import { useEffect } from "react";

export function useAos() {
  useEffect(() => {
    import("aos").then((AOS) => {
      AOS.default.init({ duration: 700, once: true, offset: 60, easing: "ease-out-cubic" });
    });
  }, []);
}
