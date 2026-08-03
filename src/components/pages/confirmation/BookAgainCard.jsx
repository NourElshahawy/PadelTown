import Link from "next/link";

export default function BookAgainCard() {
  return (
    <div className="book-again-card">
      <div className="bag-icon">
        <i className="fa-solid fa-circle-plus"></i>
      </div>
      <div className="bag-text">
        <b>هل تريد حجز جلسة أخرى؟</b>
        <span>تصفح جميع الملاعب والفترات المتاحة في جميع أنحاء المنصورة.</span>
      </div>
      <Link href="/courts" className="btn btn-accent btn-sm">
        حجز مرة أخرى <i className="fa-solid fa-arrow-left" style={{ color: "#000" }} />
      </Link>
    </div>
  );
}
