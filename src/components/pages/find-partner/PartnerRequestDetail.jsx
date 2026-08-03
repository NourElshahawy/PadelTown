"use client";
import { useState } from "react";
import { joinPartnerRequest, respondToJoin } from "@/services/partnerRequestClient";
import MatchedContactCard from "./MatchedContactCard";
import PlayerReviewPrompt from "./PlayerReviewPrompt";
import Link from "next/link";

const STATUS_LABELS = { open: "مفتوح للانضمام", partially_filled: "محتاج لاعبين كمان", matched: "اكتمل الفريق" };

export default function PartnerRequestDetail({ initialRequest, currentUserId }) {
  const [request, setRequest] = useState(initialRequest);
  const [joining, setJoining] = useState(false);

  const isHost = request.hostId === currentUserId;
  const myJoin = request.playersJoined.find((p) => p.id === currentUserId);
  const acceptedCount = request.playersJoined.filter((p) => p.status === "accepted").length;
  const isFull = acceptedCount >= request.playersNeeded;
  const requestDateHasPassed = new Date(request.date) < new Date();

  const handleJoin = async () => {
    if (!currentUserId) return;
    setJoining(true);
    try {
      await joinPartnerRequest(request.id, currentUserId);
      setRequest((r) => ({
        ...r,
        playersJoined: [...r.playersJoined, { id: currentUserId, name: "أنت", status: "pending" }],
        status: "partially_filled",
      }));
    } finally {
      setJoining(false);
    }
  };

const handleRespond = async (player, accept) => {
  try {
    await respondToJoin(player.joinId, request.id, accept, request.playersNeeded);
  } catch (err) {
    if (err.code === "REQUEST_FULL") {
      alert("الفريق مكتمل بالفعل، متقدرش تقبل لاعب زيادة.");
    } else {
      alert("حصل خطأ، حاول تاني");
    }
    return;
  }

  if (accept && player.email) {
    // ← تحقق قبل الإرسال
    fetch("/api/notifications/partner-accepted", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: player.email,
        userName: player.name,
        courtName: request.courtName,
        date: request.dateLabel,
        time: request.time,
        hostName: "أنت",
        hostPhone: request.hostPhone || "",
      }),
    }).catch(() => {});
  }

  setRequest((r) => {
    const updatedPlayers = r.playersJoined.map((p) => (p.id === player.id ? { ...p, status: accept ? "accepted" : "rejected" } : p));
    const acceptedNow = updatedPlayers.filter((p) => p.status === "accepted").length;
    return { ...r, playersJoined: updatedPlayers, status: acceptedNow >= r.playersNeeded ? "matched" : "partially_filled" };
  });
};

  return (
    <section className="section" style={{ paddingTop: 140 }}>
      <div className="container">
        <div className="breadcrumb-ph" data-aos="fade-up">
          <Link href="/">الرئيسية</Link>
          <i className="fa-solid fa-chevron-right"></i>
          <Link href="/find-partner">البحث عن شريك</Link>
          <i className="fa-solid fa-chevron-right"></i>
          <span>{request.courtName}</span>
        </div>

        <div className="request-detail-grid mt-4">
          <div className="request-detail-card">
            <div className="request-host-row">
              <span className="partner-avatar">{request.hostName?.charAt(0)}</span>
              <div>
                <b>{request.hostName}</b>
                <span className={`level-badge ${request.hostLevel}`}>{request.hostLevel}</span>
              </div>
            </div>

            <div className="partner-card-meta">
              <span className="meta-row">
                <i className="fa-solid fa-location-dot" /> {request.courtName}
              </span>
              <span className="meta-row">
                <i className="fa-solid fa-calendar-days" /> {request.dateLabel}
              </span>
              <span className="meta-row">
                <i className="fa-regular fa-clock" /> {request.time}
              </span>
              <span className="meta-row">
                <i className="fa-solid fa-chart-simple" /> مستوى {request.level}
              </span>
            </div>

            {request.notes && <p className="partner-card-notes mt-3">{request.notes}</p>}

            <span className={`partner-status-tag ${request.status}`} style={{ display: "block", marginTop: 16 }}>
              {STATUS_LABELS[request.status]}
            </span>

            {isHost && request.playersJoined.length > 0 && (
              <div className="join-players-list">
                {request.playersJoined.map((p) => (
                  <div className="join-player-row" key={p.id}>
                    <div className="jp-info">
                      <span className="partner-avatar" style={{ width: 34, height: 34, fontSize: ".8rem", overflow: "hidden" }}>
                        {p.avatarUrl ? <img src={p.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : p.name?.charAt(0)}
                      </span>
                      <div>
                        <b>{p.name}</b>
                      </div>
                    </div>
                    {p.status === "pending" ? (
                      <div className="jp-actions">
                        <button className="jp-btn accept" onClick={() => handleRespond(p, true)} aria-label="قبول">
                          <i className="fa-solid fa-check" />
                        </button>
                        <button className="jp-btn reject" onClick={() => handleRespond(p, false)} aria-label="رفض">
                          <i className="fa-solid fa-xmark" />
                        </button>
                      </div>
                    ) : (
                      <span className={`jp-status-tag ${p.status}`}>{p.status === "accepted" ? "مقبول" : "مرفوض"}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {request.playersJoined
              .filter((p) => p.status === "accepted")
              .map((p) => (
                <MatchedContactCard key={p.id} player={p} />
              ))}
            {isHost && acceptedCount > 0 && <p style={{ fontSize: ".8rem", color: "var(--text-faint)", marginTop: 10 }}>تقدر تتواصل مع اللاعبين المقبولين مباشرة من الأرقام فوق.</p>}
            {requestDateHasPassed && myJoin?.status === "accepted" && (
              <PlayerReviewPrompt
                partnerRequestId={request.id}
                reviewerId={currentUserId}
                otherPlayer={{ id: request.hostId, name: request.hostName }}
                onSubmitted={() => alert("شكرًا على تقييمك!")}
              />
            )}
          </div>

          <div className="request-detail-card">
            {isHost ? (
              <p style={{ color: "var(--text-muted)", fontSize: ".88rem" }}>ده طلبك أنت — تقدر تدير طلبات الانضمام من الشمال.</p>
            ) : isFull ? (
              <p style={{ color: "var(--text-muted)", fontSize: ".88rem" }}>اكتمل العدد المطلوب لهذا الطلب.</p>
            ) : myJoin ? (
              <span className={`jp-status-tag ${myJoin.status}`} style={{ display: "block", textAlign: "center", padding: "10px" }}>
                {myJoin.status === "pending" ? "طلبك قيد المراجعة" : myJoin.status === "accepted" ? "تم قبولك ✓" : "تم رفض طلبك"}
              </span>
            ) : (
              <button className="btn btn-accent btn-block" onClick={handleJoin} disabled={joining}>
                {joining ? "جاري الإرسال…" : "Join — اطلب الانضمام"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
