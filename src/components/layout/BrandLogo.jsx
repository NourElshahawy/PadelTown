export default function BrandLogo() {
  return (
    <span className="brand-logo">
      <svg className="brand-logo-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="5.5" fill="var(--accent)" />
        <path d="M2.5 13c3.2-2 5.6-2 8 0" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
      </svg>
      <span className="brand-logo-text">
        <span className="brand-logo-p">P</span>adel<span className="brand-logo-town">Town</span>
      </span>
    </span>
  );
}
