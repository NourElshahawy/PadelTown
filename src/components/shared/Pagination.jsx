"use client";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination-ph">
      <span className="page-btn" onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}>
        <i className="fa-solid fa-angles-left"></i>
      </span>
      {pages.map((p) => (
        <span key={p} className={`page-btn ${p === currentPage ? "is-active" : ""}`} onClick={() => onPageChange(p)}>
          {p}
        </span>
      ))}
      <span className="page-btn" onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}>
        <i className="fa-solid fa-angles-right"></i>
      </span>
    </div>
  );
}
