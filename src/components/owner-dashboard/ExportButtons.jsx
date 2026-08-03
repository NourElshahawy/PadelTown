"use client";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";

export default function ExportButtons({ title, headers, rows, filenameBase }) {
  if (!rows || rows.length === 0) return null;

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        type="button"
        className="owner-btn-cancel"
        style={{ border: "1px solid var(--border-glass)", borderRadius: "var(--r-sm)", padding: "6px 12px" }}
        onClick={() => exportToCSV(filenameBase, headers, rows)}>
        <i className="fa-solid fa-file-excel" style={{ marginLeft: 6 }}></i>
        تصدير Excel
      </button>
      <button
        type="button"
        className="owner-btn-cancel"
        style={{ border: "1px solid var(--border-glass)", borderRadius: "var(--r-sm)", padding: "6px 12px" }}
        onClick={() => exportToPDF(title, headers, rows)}>
        <i className="fa-solid fa-file-pdf" style={{ marginLeft: 6 }}></i>
        تصدير PDF
      </button>
    </div>
  );
}
