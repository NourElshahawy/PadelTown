"use client";
import { useRouter } from "next/navigation";

export default function HeroActionsBar({ courtSlug }) {
  const router = useRouter();

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: "PadelTown", url });
      } catch {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="hero-actions">
      <button type="button" className="hero-btn back-btn" onClick={() => router.push("/courts")} aria-label="رجوع">
        <i className="fa-solid fa-arrow-left" />
      </button>
      <button type="button" className="hero-btn share-btn" onClick={handleShare} aria-label="مشاركة">
        <i className="fa-solid fa-share-nodes" />
      </button>
    </div>
  );
}
