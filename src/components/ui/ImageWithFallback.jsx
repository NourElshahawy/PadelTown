"use client";
import { useState } from "react";

export default function ImageWithFallback({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className={`img-fallback ${className}`} style={{ width: "100%", height: "100%" }} />;
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}
