export default function TablePagination({ table }) {
  const pageCount = table.getPageCount();
  if (pageCount <= 1) return null;

  const current = table.getState().pagination.pageIndex;

  return (
    <div className="owner-pagination">
      <button type="button" className="owner-pagination-btn" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
        <i className="fa-solid fa-angles-right"></i>
      </button>
      <button type="button" className="owner-pagination-btn" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
        <i className="fa-solid fa-angle-right"></i>
      </button>

      <span className="owner-pagination-info">
        صفحة {current + 1} من {pageCount}
      </span>

      <button type="button" className="owner-pagination-btn" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
        <i className="fa-solid fa-angle-left"></i>
      </button>
      <button type="button" className="owner-pagination-btn" onClick={() => table.setPageIndex(pageCount - 1)} disabled={!table.getCanNextPage()}>
        <i className="fa-solid fa-angles-left"></i>
      </button>
    </div>
  );
}
