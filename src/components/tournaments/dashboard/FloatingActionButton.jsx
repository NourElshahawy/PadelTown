import Link from "next/link";

export default function FloatingActionButton({ label, onClick, href, tone = "court", disabled }) {
  const className = `td-fab td-fab--${tone}`;

  return (
    <div className="td-fab-wrap">
      {href ? (
        <Link href={href} className={className}>
          {label}
        </Link>
      ) : (
        <button type="button" className={className} onClick={onClick} disabled={disabled}>
          {label}
        </button>
      )}
    </div>
  );
}
