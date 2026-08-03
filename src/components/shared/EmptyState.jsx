export default function EmptyState({ title = "لا توجد نتائج تطابق هذه الفلترة", text = "حاول تعديل الفلاتر.", buttonLabel = "مسح جميع الفلاتر", onClear }) {
  return (
    <div className="empty-state">
      <i className="fa-solid fa-magnifying-glass-location"></i>
      <h3>{title}</h3>
      <p>{text}</p>
      {onClear && (
        <button className="btn btn-accent btn-sm" onClick={onClear}>
          {buttonLabel}
        </button>
      )}
    </div>
  );
}
