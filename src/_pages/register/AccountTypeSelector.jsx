import Link from "next/link";

export default function AccountTypeSelector() {
  return (
    <div className="account-type-selector">
      <div className="type-card is-active">
        <span className="type-icon">
          <i className="fa-solid fa-table-tennis-paddle-ball"></i>
        </span>
        <div className="type-info">
          <b>لاعب</b>
          <span>احجز الملاعب</span>
        </div>
        <i className="type-check fa-solid fa-circle-check"></i>
      </div>

      <Link href="/register/owner" className="type-card">
        <span className="type-icon owner">
          <i className="fa-solid fa-store"></i>
        </span>
        <div className="type-info">
          <b>مالك ملعب</b>
          <span>اضيف ملعبي وأدير الحجوزات</span>
        </div>
        <i className="type-check fa-solid fa-circle-check"></i>
      </Link>
    </div>
  );
}
