import Link from "next/link";
import Image from "next/image";
// import "@/styles/shared/auth.css";

export default function AuthVisual({ heading, features, quote }) {
  return (
    <div className="auth-visual d-none d-lg-flex">
      {/* <Link href="/" className="brand">
        <Image src="/assets/imgs/logo1-removebg-preview.png" alt="PadelTown" width={80} height={80} />
      </Link> */}

      <div className="auth-visual-content">
        <h2>{heading}</h2>
        <div className="auth-feature-list">
          {features.map((f) => (
            <div className="item" key={f.text}>
              <i className={`fa-solid fa-${f.icon}`}></i>
              {f.text}
            </div>
          ))}
        </div>
      </div>

      {quote && (
        <div className="auth-visual-quote">
          <p>`{quote.text}`</p>
          <span>— {quote.author}</span>
        </div>
      )}
    </div>
  );
}
