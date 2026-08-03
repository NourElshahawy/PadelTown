import Link from "next/link";

const STATUS_LABELS = { open: "مفتوح", partially_filled: "محتاج لاعبين", matched: "مكتمل", pending: "قيد المراجعة", accepted: "مقبول", rejected: "مرفوض" };

export default function PartnerRequestsSection({ requests }) {
  return (
    <div className="profile-section">
      <h2>
        <i className="fa-solid fa-user-plus"></i> طلبات البحث عن شريك
      </h2>

      {requests.length === 0 ? (
        <div className="profile-empty-card">
          <i className="fa-solid fa-user-xmark"></i>
          لسه معملتش ولا اشتركتش في أي طلب.{" "}
          <Link href="/find-partner" className="auth-link">
            دور على شريك
          </Link>
        </div>
      ) : (
        requests.map((r) => (
          <Link href={`/find-partner/${r.id}`} key={`${r.id}-${r.role}`} className="booking-history-card" style={{ textDecoration: "none" }}>
            <div className="bhc-info">
              <b>
                {r.courtName} {r.role === "host" && <span style={{ color: "var(--accent)", fontSize: ".72rem" }}>(طلبك)</span>}
              </b>
              <span>
                {new Date(r.date).toLocaleDateString("ar-EG", { day: "numeric", month: "long" })} · {r.time}
                {r.hostName && ` · صاحب الطلب: ${r.hostName}`}
              </span>
            </div>
            <span className={`partner-status-tag ${r.status === "matched" ? "matched" : r.status === "open" ? "open" : "partially_filled"}`}>{STATUS_LABELS[r.status]}</span>
          </Link>
        ))
      )}
    </div>
  );
}
