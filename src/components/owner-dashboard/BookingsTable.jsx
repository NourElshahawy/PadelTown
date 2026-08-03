"use client";
import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, createColumnHelper } from "@tanstack/react-table";
import TablePagination from "./TablePagination";
import { formatSlotRanges } from "@/services/courtLogic";
import { updateBookingStatus, confirmPaymentReceived } from "@/services/ownerBookingsClient";
import ExportButtons from "./ExportButtons";
import { exportMonthlyBookingsPDF } from "@/lib/exportUtils";


const columnHelper = createColumnHelper();
const STATUS_LABELS = { confirmed: "مؤكد", cancelled: "ملغي", completed: "منتهي", mixed: "مختلطة" };
const PAYMENT_LABELS = { paid: "مدفوع", pending_claimed: "بانتظار المراجعة", pending: "لسه مستنيين الدفع" };

function timeToMinutes(label) {
  const match = label.trim().match(/^(\d{1,2}):(\d{2})\s*(ص|م)$/);
  if (!match) return 0;
  let [, h, m, period] = match;
  h = parseInt(h, 10);
  m = parseInt(m, 10);
  if (period === "ص") {
    if (h === 12) h = 0;
  } else if (h !== 12) {
    h += 12;
  }
  return h * 60 + m;
}

function groupRows(bookings) {
  const groups = {};
  bookings.forEach((b) => {
    const key = b.groupId;
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
  });

  return Object.values(groups).map((items) => {
    const sortKey = (b) => `${b.date}_${String(timeToMinutes(b.time.split(" الي ")[0])).padStart(4, "0")}`;
    const sorted = [...items].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const statuses = new Set(sorted.map((b) => b.status));
    const status = statuses.size === 1 ? [...statuses][0] : "mixed";
    const cancelledCount = sorted.filter((b) => b.status === "cancelled").length;

    const confirmedRows = sorted.filter((b) => b.status === "confirmed");
    const paymentBasisRows = confirmedRows.length ? confirmedRows : sorted;
    const anyPaid = paymentBasisRows.some((b) => b.paymentStatus === "paid");
    const allPaid = paymentBasisRows.length > 0 && paymentBasisRows.every((b) => b.paymentStatus === "paid");
    const anyClaimed = paymentBasisRows.some((b) => b.paymentClaimedAt);

    const proofUrl = paymentBasisRows.find((b) => b.paymentProofUrl)?.paymentProofUrl || null;

    let paymentKey = "pending";
    if (allPaid) paymentKey = "paid";
    else if (anyClaimed) paymentKey = "pending_claimed";

    return {
      groupId: first.groupId,
      ids: sorted.map((b) => b.id),
      confirmedIds: confirmedRows.map((b) => b.id),
      customerName: first.customerName,
      customerPhone: first.customerPhone,
      customerEmail: first.customerEmail,
      courtName: first.courtName,
      venueName: first.venueName,
      date: first.date === last.date ? first.date : `${first.date} → ${last.date}`,
      time: formatSlotRanges(sorted.map((b) => ({ date: b.date, start: b.time.split(" الي ")[0], end: b.time.split(" الي ")[1] }))),
      price: sorted.reduce((sum, b) => sum + Number(b.price), 0),
      status,
      cancelledCount,
      totalCount: sorted.length,
      paymentKey,
      anyPaid,
      proofUrl,
    };
  });
}

export default function BookingsTable({ initialBookings, courtIds = [] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [loadingId, setLoadingId] = useState(null);

  // اشتراك لحظي: أي حجز جديد أو تحديث حالة/دفع في ملاعبي، يظهر فورًا من غير Refresh
  useEffect(() => {
    if (courtIds.length === 0) return;
    const supabase = createClient();

    const channel = supabase
      .channel("owner-bookings-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, async (payload) => {
        const row = payload.new && Object.keys(payload.new).length ? payload.new : payload.old;
        if (!row || !courtIds.includes(row.court_id)) return;

        if (payload.eventType === "DELETE") {
          setBookings((prev) => prev.filter((b) => b.id !== row.id));
          return;
        }

        setBookings((prev) => {
          const exists = prev.some((b) => b.id === row.id);
          if (exists) {
            return prev.map((b) =>
              b.id === row.id
                ? {
                    ...b,
                    status: row.status,
                    paymentStatus: row.payment_status,
                    paymentClaimedAt: row.payment_claimed_at,
                    paymentProofUrl: row.payment_proof_url,
                  }
                : b,
            );
          }
          return prev;
        });

        // صف جديد (حجز جديد) — محتاجين بيانات العميل اللي مش موجودة في صف الحجز نفسه
        if (payload.eventType === "INSERT") {
          const { data: profile } = await supabase.from("profiles").select("name, phone, email").eq("id", row.user_id).maybeSingle();

          const newRow = {
            id: row.id,
            groupId: row.group_id || row.id,
            customerName: profile?.name || "—",
            customerPhone: profile?.phone || "—",
            customerEmail: profile?.email || "—",
            courtName: row.court_name,
            venueName: row.venue_name,
            date: row.date,
            time: row.time,
            price: row.price,
            status: row.status,
            paymentStatus: row.payment_status,
            paymentClaimedAt: row.payment_claimed_at,
            paymentProofUrl: row.payment_proof_url,
          };

          setBookings((prev) => (prev.some((b) => b.id === row.id) ? prev : [newRow, ...prev]));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [courtIds]);

  const applyStatusLocally = (ids, status) => {
    setBookings((prev) => prev.map((b) => (ids.includes(b.id) ? { ...b, status } : b)));
  };
  const applyPaymentLocally = (ids) => {
    setBookings((prev) => prev.map((b) => (ids.includes(b.id) ? { ...b, paymentStatus: "paid" } : b)));
  };

  const handleUpdate = async (groupId, ids, status, rowData) => {
    setLoadingId(groupId);
    try {
      await updateBookingStatus(ids, status);
      applyStatusLocally(ids, status);

      if (status === "cancelled" && rowData?.customerEmail && rowData.customerEmail !== "—") {
        fetch("/api/notifications/booking-cancelled", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: rowData.customerEmail,
            userId: rowData.userId,
            userName: rowData.customerName || "لاعب Ace Town",
            venueName: rowData.venueName,
            courtName: rowData.courtName,
            date: rowData.date,
            time: rowData.time,
            price: rowData.price,
          }),
        }).catch(() => {});
      }
    } catch {
      alert("حصل خطأ أثناء تحديث الحجز");
    } finally {
      setLoadingId(null);
    }
  };

  const handleConfirmPayment = async (groupId, ids) => {
    setLoadingId(groupId);
    try {
      await confirmPaymentReceived(ids);
      applyPaymentLocally(ids);
    } catch {
      alert("حصل خطأ أثناء تأكيد الدفع");
    } finally {
      setLoadingId(null);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("customerName", {
        header: "العميل",
        cell: (info) => {
          const b = info.row.original;
          return (
            <div>
              <div style={{ fontWeight: 600 }}>{info.getValue()}</div>
              <div style={{ fontSize: ".72rem", color: "#94a3b8" }}>{b.customerPhone || "—"}</div>
              <div style={{ fontSize: ".72rem", color: "#94a3b8" }}>{b.customerEmail || "—"}</div>
            </div>
          );
        },
      }),
      columnHelper.accessor("courtName", { header: "الملعب" }),
      columnHelper.accessor("date", { header: "التاريخ" }),
      columnHelper.accessor("time", { header: "الوقت" }),
      columnHelper.accessor("price", { header: "السعر", cell: (info) => `${info.getValue()} ج.م` }),
      columnHelper.accessor("status", {
        header: "الحالة",
        cell: (info) => {
          const b = info.row.original;
          return (
            <div>
              <span className={`owner-status-chip ${info.getValue()}`}>{STATUS_LABELS[info.getValue()]}</span>
              {info.getValue() === "mixed" && (
                <div style={{ fontSize: ".68rem", color: "#94a3b8", marginTop: 4 }}>
                  {b.cancelledCount} ملغية من {b.totalCount}
                </div>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "payment",
        header: "الدفع",
        cell: ({ row }) => {
          const b = row.original;
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
              <span className={`owner-status-chip payment-${b.paymentKey}`}>{PAYMENT_LABELS[b.paymentKey]}</span>
              {b.paymentKey === "pending_claimed" && b.confirmedIds.length > 0 && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => handleConfirmPayment(b.groupId, b.confirmedIds)} disabled={loadingId === b.groupId} className="owner-btn-complete">
                    تأكيد استلام الدفع
                  </button>
                  {b.proofUrl && (
                    <button onClick={() => window.open(b.proofUrl, "_blank")} className="owner-btn-view-proof" title="مشاهدة إثبات الدفع" type="button">
                      <i className="fa-solid fa-eye"></i>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "إجراءات",
        cell: ({ row }) => {
          const b = row.original;
          if (b.confirmedIds.length === 0) return null;
          return (
            <div className="owner-table-actions">
              <button onClick={() => handleUpdate(b.groupId, b.confirmedIds, "completed")} disabled={loadingId === b.groupId} className="owner-btn-complete">
                إتمام
              </button>
              <button onClick={() => handleUpdate(b.groupId, b.confirmedIds, "cancelled", b)} disabled={loadingId === b.groupId} className="owner-btn-cancel-booking">
                إلغاء
              </button>
            </div>
          );
        },
      }),
    ],
    [loadingId],
  );

  const grouped = useMemo(() => groupRows(bookings), [bookings]);
  const table = useReactTable({
    data: grouped,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });
  const exportRows = grouped.map((b) => [
    b.customerName,
    b.customerPhone || "—",
    b.customerEmail || "—",
    b.courtName,
    b.venueName || "—",
    b.date,
    b.time,
    b.price,
    STATUS_LABELS[b.status] || b.status,
    PAYMENT_LABELS[b.paymentKey],
  ]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
        <ExportButtons
          title="سجل الحجوزات"
          headers={["العميل", "الهاتف", "الإيميل", "الملعب", "المكان", "التاريخ", "الوقت", "السعر (ج.م)", "الحالة", "الدفع"]}
          rows={exportRows}
          filenameBase="سجل-الحجوزات"
        />
        <button
          type="button"
          className="owner-btn-cancel"
          style={{ border: "1px solid var(--border-glass)", borderRadius: "var(--r-sm)", padding: "6px 12px" }}
          onClick={() => exportMonthlyBookingsPDF("التقرير الشهري للحجوزات", ["العميل", "الهاتف", "الملعب", "التاريخ", "الوقت", "السعر", "الحالة", "الدفع"], grouped)}>
          <i className="fa-solid fa-file-invoice-dollar" style={{ marginLeft: 6 }}></i>
          تقرير شهري PDF
        </button>
      </div>

      {grouped.length === 0 ? (
        <p className="owner-table-empty">لسه مفيش حجوزات على ملاعبك.</p>
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
