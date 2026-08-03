"use client";
import { useMemo, useState, useEffect } from "react";
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, createColumnHelper } from "@tanstack/react-table";
import ExportButtons from "./ExportButtons";
import TablePagination from "./TablePagination";

const columnHelper = createColumnHelper();

export default function CustomersTable({ customers }) {
  const [search, setSearch] = useState("");
  const [onlyReturning, setOnlyReturning] = useState(false);

  const filtered = useMemo(() => {
    let list = customers;
    if (onlyReturning) list = list.filter((c) => c.isReturning);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q));
    }
    return list;
  }, [customers, search, onlyReturning]);


  useEffect(() => {
    table.setPageIndex(0);
  }, [search, onlyReturning]);


  const columns = [
    columnHelper.accessor("name", {
      header: "العميل",
      cell: (info) => (
        <div>
          <div style={{ fontWeight: 600 }}>{info.getValue()}</div>
          <div style={{ fontSize: ".72rem", color: "#94a3b8" }}>{info.row.original.phone}</div>
          <div style={{ fontSize: ".72rem", color: "#94a3b8" }}>{info.row.original.email}</div>
        </div>
      ),
    }),
    columnHelper.accessor("totalBookings", {
      header: "عدد الحجوزات",
      cell: (info) => (
        <span>
          {info.getValue()}{" "}
          {info.row.original.isReturning && (
            <span className="owner-status-chip confirmed" style={{ marginInlineStart: 6 }}>
              دائم
            </span>
          )}
        </span>
      ),
    }),
    columnHelper.accessor("totalSpent", { header: "إجمالي الإنفاق", cell: (info) => `${info.getValue()} ج.م` }),
    columnHelper.accessor("favoriteCourt", { header: "الملعب المفضل" }),
    columnHelper.accessor("lastBookingDate", {
      header: "آخر حجز",
      cell: (info) => new Date(info.getValue()).toLocaleDateString("ar-EG", { day: "numeric", month: "long" }),
    }),
  ];

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });
  const exportRows = filtered.map((c) => [c.name, c.phone, c.email, c.totalBookings, c.totalSpent, c.favoriteCourt, new Date(c.lastBookingDate).toLocaleDateString("ar-EG")]);

  return (
    <>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
        <input className="admin-search-input" placeholder="دور باسم العميل أو رقم الهاتف..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".85rem", color: "var(--white)", whiteSpace: "nowrap" }}>
          <input type="checkbox" checked={onlyReturning} onChange={(e) => setOnlyReturning(e.target.checked)} />
          عملاء دائمين بس
        </label>
        <div style={{ marginInlineStart: "auto" }}>
          <ExportButtons title="سجل العملاء" headers={["الاسم", "الهاتف", "الإيميل", "عدد الحجوزات", "إجمالي الإنفاق", "الملعب المفضل", "آخر حجز"]} rows={exportRows} filenameBase="سجل-العملاء" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="owner-table-empty">مفيش عملاء مطابقين.</p>
      ) : (
        <div className="owner-table-wrap">
          <table className="owner-table">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <TablePagination table={table} />
    </>
  );
}
