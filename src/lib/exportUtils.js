// تصدير بيانات لملف CSV بيتفتح في Excel من غير أي مكتبات خارجية
export function exportToCSV(filename, headers, rows) {
  const escape = (val) => {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))];
  const csvContent = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// بيفتح نافذة طباعة جاهزة، والأونر يقدر يعمل "حفظ كـ PDF" منها مباشرة
export function exportToPDF(title, headers, rows) {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    alert("المتصفح قفل النافذة المنبثقة، اسمح بالنوافذ المنبثقة لهذا الموقع وحاول تاني");
    return;
  }

  const style = `
    body { font-family: Tahoma, Arial, sans-serif; direction: rtl; padding: 24px; color: #111; }
    h1 { font-size: 18px; margin-bottom: 4px; }
    p.meta { color: #555; font-size: 12px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: right; }
    th { background: #f2f2f2; }
    tfoot td { font-weight: bold; background: #fafafa; }
  `;

  const headHtml = headers.map((h) => `<th>${h}</th>`).join("");
  const rowsHtml = rows.map((r) => `<tr>${r.map((c) => `<td>${c ?? ""}</td>`).join("")}</tr>`).join("");

  win.document.write(`
    <html dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>${style}</style>
      </head>
      <body>
        <h1>${title}</h1>
        <p class="meta">تاريخ التصدير: ${new Date().toLocaleDateString("ar-EG")}</p>
        <table>
          <thead><tr>${headHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <script>
          window.onload = function () { window.print(); };
        </script>
      </body>
    </html>
  `);
  win.document.close();
}
// تصدير تقرير شهري للحجوزات: كل شهر في صفحة منفصلة مع ملخص في نهايته
export function exportMonthlyBookingsPDF(title, headers, groups) {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    alert("المتصفح قفل النافذة المنبثقة، اسمح بالنوافذ المنبثقة لهذا الموقع وحاول تاني");
    return;
  }

  const getMonthKey = (dateStr) => {
    const firstDate = dateStr.split(" → ")[0];
    return firstDate.slice(0, 7); // "YYYY-MM"
  };

  const monthLabel = (key) => {
    const [y, m] = key.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("ar-EG", { month: "long", year: "numeric" });
  };

  const byMonth = {};
  groups.forEach((g) => {
    const key = getMonthKey(g.date);
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(g);
  });

  const monthKeys = Object.keys(byMonth).sort();

  const style = `
    body { font-family: Tahoma, Arial, sans-serif; direction: rtl; padding: 24px; color: #111; }
    h1 { font-size: 18px; margin-bottom: 4px; }
    h2 { font-size: 15px; margin: 24px 0 8px; color: #333; }
    p.meta { color: #555; font-size: 12px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 12px; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: right; }
    th { background: #f2f2f2; }
    .summary-box { background: #f7f7f7; border: 1px solid #ddd; border-radius: 6px; padding: 14px; margin-bottom: 8px; }
    .summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; border-bottom: 1px dashed #ddd; }
    .summary-row:last-child { border-bottom: none; font-weight: bold; color: #0a7a3d; }
    .month-section { page-break-after: always; }
    .month-section:last-child { page-break-after: auto; }
  `;

  const headHtml = headers.map((h) => `<th>${h}</th>`).join("");

  const monthsHtml = monthKeys
    .map((key) => {
      const rowsForMonth = byMonth[key];

      const totalCount = rowsForMonth.length;
      const doneAndPaid = rowsForMonth.filter((g) => g.status === "completed" && g.paymentKey === "paid").length;
      const activeCount = rowsForMonth.filter((g) => g.status !== "cancelled").length;
      const profit = rowsForMonth.filter((g) => g.paymentKey === "paid").reduce((sum, g) => sum + Number(g.price), 0);

      const rowsHtml = rowsForMonth
        .map(
          (g) =>
            `<tr><td>${g.customerName}</td><td>${g.customerPhone || "—"}</td><td>${g.courtName}</td><td>${g.date}</td><td>${g.time}</td><td>${g.price} ج.م</td><td>${g.status}</td><td>${g.paymentKey}</td></tr>`,
        )
        .join("");

      return `
        <section class="month-section">
          <h2>شهر ${monthLabel(key)}</h2>
          <table>
            <thead><tr>${headHtml}</tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div class="summary-box">
            <div class="summary-row"><span>إجمالي عدد الحجوزات</span><span>${totalCount}</span></div>
            <div class="summary-row"><span>حجوزات تمت ودُفعت بالكامل</span><span>${doneAndPaid}</span></div>
            <div class="summary-row"><span>حجوزات فعلية (غير ملغاة)</span><span>${activeCount}</span></div>
            <div class="summary-row"><span>الأرباح (المحصّلة فعليًا)</span><span>${profit} ج.م</span></div>
          </div>
        </section>
      `;
    })
    .join("");

  win.document.write(`
    <html dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>${style}</style>
      </head>
      <body>
        <h1>${title}</h1>
        <p class="meta">تاريخ التصدير: ${new Date().toLocaleDateString("ar-EG")}</p>
        ${monthsHtml}
        <script>
          window.onload = function () { window.print(); };
        </script>
      </body>
    </html>
  `);
  win.document.close();
}