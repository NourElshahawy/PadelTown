"use client";
import { useState } from "react";

export default function MatchScoreForm({ match, onSubmit }) {
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = scoreA !== "" && scoreB !== "" && scoreA !== scoreB && match.teamA && match.teamB;

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit(match.id, Number(scoreA), Number(scoreB));
    setSubmitting(false);
  };

  if (match.isDone) {
    return (
      <div className="manage-match-card">
        <div className="manage-match-teams">
          <span>{match.teamA}</span>
          <span>
            {match.scoreA} : {match.scoreB}
          </span>
          <span>{match.teamB}</span>
        </div>
        <div className="manage-match-done">
          <i className="fa-solid fa-circle-check" style={{ fontSize: 16 }}></i>
          الفائز: {match.scoreA > match.scoreB ? match.teamA : match.teamB}
        </div>
      </div>
    );
  }

  if (!match.teamA || !match.teamB) {
    return (
      <div className="manage-match-card" style={{ opacity: 0.5 }}>
        <div className="manage-match-teams">
          <span>{match.teamA || "بانتظار الفائز"}</span>
          <span>VS</span>
          <span>{match.teamB || "بانتظار الفائز"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-match-card">
      <div className="manage-match-teams">
        <span>{match.teamA}</span>
        <div className="manage-score-inputs">
          <input type="number" min="0" value={scoreA} onChange={(e) => setScoreA(e.target.value)} />
          <span>:</span>
          <input type="number" min="0" value={scoreB} onChange={(e) => setScoreB(e.target.value)} />
        </div>
        <span>{match.teamB}</span>
      </div>
      <button className="btn btn-accent btn-sm" onClick={handleSubmit} disabled={!canSubmit || submitting}>
        {submitting ? "جاري الحفظ…" : "حفظ النتيجة"}
      </button>
    </div>
  );
}
