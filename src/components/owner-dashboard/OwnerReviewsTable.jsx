"use client";
import { useMemo, useState } from "react";
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from "@tanstack/react-table";
import ExportButtons from "./ExportButtons";

const columnHelper = createColumnHelper();

function Stars({ rating }) {
  return (
    <span style={{ color: "#ffb020", letterSpacing: 2 }}>
      {"★".repeat(rating)}
      <span style={{ color: "var(--text-faint, #55555f)" }}>{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function OwnerReviewsTable({ reviews }) {
  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState(0);

  const filtered = useMemo(() => {
    let list = reviews;
    if (minRating > 0) list = list.filter((r) => r.rating >= minRating);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.customerName.toLowerCase().includes(q) || r.courtName.toLowerCase().includes(q));
    }
    return list;
  }, [reviews, search, minRating]);

  const columns = [
    columnHelper.accessor("customerName", {
      header: "العميل",
      cell: (info) => (
        <div>
          <div style={{ fontWeight: 600 }}>{info.getValue()}</div>
          <div style={{ fontSize: ".72rem", color: "#94a3b8" }}>{info.row.original.customerPhone}</div>
        </div>
      ),
    }),
    columnHelper.accessor("courtName", {
      header: "الملعب",
      cell: (info) => `${info.row.original.venueName} — ${info.getValue()}`,
    }),
    columnHelper.accessor("rating", { header: "التقييم", cell: (info) => <Stars rating={info.getValue()} /> }),
    columnHelper.accessor("comment", {
      header: "التعليق",
      cell: (info) => info.getValue() || <span style={{ color: "#94a3b8" }}>—</span>,
    }),
    columnHelper.accessor("createdAt", {
      header: "التاريخ",
      cell: (info) => new Date(info.getValue()).toLocaleDateString("ar-EG", { day: "numeric", month: "long" }),
    }),
  ];

  const table = useReactTable({ data: filtered, columns, getCoreRowModel: getCoreRowModel() });

  const exportRows = filtered.map((r) => [r.customerName, r.customerPhone, r.venueName, r.courtName, r.rating, r.comment || "—", new Date(r.createdAt).toLocaleDateString("ar-EG")]);

  return (
    <>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
        <input className="admin-search-input" placeholder="دور باسم العميل أو الملعب..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="admin-search-input" value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} style={{ maxWidth: 160 }}>
          <option value={0}>كل التقييمات</option>
          <option value={4}>4 نجوم فأكتر</option>
          <option value={3}>3 نجوم فأكتر</option>
        </select>
        <div style={{ marginInlineStart: "auto" }}>
          <ExportButtons title="سجل التقييمات" headers={["العميل", "الهاتف", "المكان", "الملعب", "التقييم", "التعليق", "التاريخ"]} rows={exportRows} filenameBase="التقييمات" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="owner-table-empty">مفيش تقييمات مطابقة.</p>
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
    </>
  );
}
