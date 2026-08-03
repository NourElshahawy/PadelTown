"use client";
import { useState } from "react";

export default function StartTournamentButton({ tournament, onStart }) {
  const [starting, setStarting] = useState(false);
  const canStart = tournament.teams.length >= 4 && (tournament.teams.length & (tournament.teams.length - 1)) === 0;

  const handleStart = async () => {
    setStarting(true);
    await onStart();
    setStarting(false);
  };

  return (
    <div className="manage-section start-tournament-banner">
      <h3>🏁 بدء البطولة</h3>
      {canStart ? (
        <>
          <p>عدد الفرق ({tournament.teams.length}) جاهز لتوليد جدول المباريات. هذا الإجراء نهائي ويقفل التسجيل.</p>
          <button className="btn btn-accent btn-block" onClick={handleStart} disabled={starting}>
            {starting ? "جاري التوليد…" : "ابدأ البطولة وولّد الجدول"}
          </button>
        </>
      ) : (
        <p>محتاج عدد فرق يكون قوة لـ 2 (4، 8، 16...) وعلى الأقل 4 فرق. عندك دلوقتي {tournament.teams.length} فريق.</p>
      )}
    </div>
  );
}
