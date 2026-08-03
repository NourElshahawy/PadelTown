"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBookingWithDeposit } from "@/services/depositBookingClient";
import HeroActionsBar from "./HeroActionsBar";
import VenueSummaryCard from "./VenueSummaryCard";
import HeroImageSlider from "./HeroImageSlider";
import StepBar from "./StepBar";
import CourtGallerySelector from "./CourtGallerySelector";
import DaySelector from "./DaySelector";
import SlotsGrid from "./SlotsGrid";
import BookingSummaryFooter from "./BookingSummaryFooter";
import ConfirmSheet from "./ConfirmSheet";
import BookingSuccessToast from "./BookingSuccessToast";
import { buildDefaultSlots, formatSlotRanges } from "@/services/courtLogic";
import { createClient } from "@/lib/supabase/client";
import BookingGuideModal from "./BookingGuideModal";
import { getEgyptISODate } from "@/services/courtLogic";
// import "@/styles/pages/booking.css";

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
function slotSortKey(s) {
  return `${s.date}_${String(timeToMinutes(s.start)).padStart(4, "0")}`;
}

export default function BookingPage({ court, preselectedSubCourtId }) {
  const [showGuide, setShowGuide] = useState(false);
  const daysSectionRef = useRef(null);
  const slotsSectionRef = useRef(null);
  const router = useRouter();

  const preselected = preselectedSubCourtId ? (court.subCourts || []).find((c) => c.id === preselectedSubCourtId) : null;
  const [subCourt, setSubCourt] = useState(preselected || null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]); // array of slot objects
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [liveBookings, setLiveBookings] = useState(court.bookings || []);
  const [liveBlockedSlots, setLiveBlockedSlots] = useState(court.blockedSlots || []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, []);

  useEffect(() => {
    try {
      if (!localStorage.getItem("acetown_hide_booking_guide")) {
        setShowGuide(true);
      }
    } catch {
      setShowGuide(true);
    }
  }, []);

  // اشتراك لحظي في تغييرات الحجوزات لكل الكورتات الفرعية بتاعة الملعب ده،
  // عشان أي حد يحجز ساعة، الناس التانية اللي فاتحة نفس الصفحة تشوفها اتقفلت فورًا من غير ريفريش
  useEffect(() => {
    const supabase = createClient();
    const courtIds = (court.subCourts || []).map((c) => c.id);
    if (courtIds.length === 0) return;

    const channel = supabase
      .channel(`bookings-venue-${court.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "booking_slots" }, (payload) => {
        const row = payload.new && Object.keys(payload.new).length ? payload.new : payload.old;
        if (!row || !courtIds.includes(row.court_id)) return;

        setLiveBookings((prev) => {
          const sameSlot = (b) => b.court_id === row.court_id && b.date === row.date && b.time === row.time;

          if (payload.eventType === "DELETE" || row.status === "cancelled") {
            return prev.filter((b) => !sameSlot(b));
          }

          if (row.status !== "confirmed" && row.status !== "completed") return prev;
          if (prev.some(sameSlot)) return prev;
          return [...prev, { court_id: row.court_id, date: row.date, time: row.time }];
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "blocked_slots" }, (payload) => {
        const row = payload.new && Object.keys(payload.new).length ? payload.new : payload.old;
        if (!row || !courtIds.includes(row.court_id)) return;
        setLiveBlockedSlots((prev) => {
          if (payload.eventType === "DELETE") {
            return prev.filter((b) => b.id !== row.id);
          }

          const exists = prev.some((b) => b.id === row.id);
          if (exists) {
            return prev.map((b) => (b.id === row.id ? { ...b, reason: row.reason } : b));
          }
          return [...prev, { id: row.id, court_id: row.court_id, date: row.date, time: row.time, reason: row.reason }];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [court]);

  const handleSelectSubCourt = (sc) => {
    setSubCourt(sc);
    setSelectedDay(null);
    setSelectedSlots([]);

    setTimeout(() => {
      daysSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  };

  const handleSelectDay = (d) => {
    setSelectedDay(d);

    setTimeout(() => {
      slotsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  };

  const summary = useMemo(() => {
    const total = selectedSlots.reduce((sum, s) => sum + s.price, 0);
    const duration = selectedSlots.length ? (selectedSlots.length === 1 ? "ساعة واحدة" : `${selectedSlots.length} ساعات`) : "";

    let time = "";
    let dateLabel = "";
    let dateISO = "";
    let spansMultipleDays = false;

    if (selectedSlots.length) {
      const sorted = [...selectedSlots].sort((a, b) => slotSortKey(a).localeCompare(slotSortKey(b)));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      spansMultipleDays = first.date !== last.date;

      const dayInfo = (d) => (court.days || []).find((x) => x.date === d);
      const firstDay = dayInfo(first.date);
      const lastDay = dayInfo(last.date);
      const label = (d, day) => (day ? `${day.dow} ${day.dom} ${day.month}` : d);

      time = formatSlotRanges(sorted);
      dateLabel = spansMultipleDays ? `${label(first.date, firstDay)} → ${label(last.date, lastDay)}` : label(first.date, firstDay);
      dateISO = first.date;
    } else if (selectedDay) {
      dateLabel = `${selectedDay.dow} ${selectedDay.dom} ${selectedDay.month}`;
      dateISO = selectedDay.date;
    }

    return { total, time, duration, dateLabel, dateISO, spansMultipleDays };
  }, [selectedSlots, selectedDay, court.days]);

  const daySlots = useMemo(() => {
    if (!subCourt || !selectedDay) return [];
    const bookedStartTimes = liveBookings.filter((b) => b.court_id === subCourt.id && b.date === selectedDay.date).map((b) => b.time.split(" الي ")[0]); // ناخد أول جزء بس (وقت البداية) للمقارنة
    const blockedForDay = liveBlockedSlots.filter((b) => b.court_id === subCourt.id && b.date === selectedDay.date);
    const now = new Date();
    const todayISO = getEgyptISODate(now);
    const isToday = selectedDay.date === todayISO;
    const currentHour = Number(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Cairo",
        hour: "numeric",
        hour12: false,
      }).format(now),
    );

    return buildDefaultSlots(subCourt.pricePerHour).map((slot, index) => {
      // ترتيب buildDefaultSlots بيبدأ من 12:00 ص (ساعة 0) لحد 11:00 م (ساعة 23)،
      // فالـ index هنا بيطابق رقم الساعة في اليوم مباشرة

      const isPast = isToday && index <= currentHour;
      const isBooked = bookedStartTimes.includes(slot.start);
      const blockedRow = blockedForDay.find((b) => b.time === slot.start);
      const status = isBooked ? "booked" : blockedRow ? "blocked" : isPast ? "past" : "available";
      return { ...slot, status, blockReason: blockedRow?.reason || null };
    });
  }, [subCourt, selectedDay, liveBookings, liveBlockedSlots]);

  const daysWithSelections = useMemo(() => [...new Set(selectedSlots.map((s) => s.date))], [selectedSlots]);

  const handleToggleSlot = (slot) => {
    if (!selectedDay) return;
    const slotWithDate = { ...slot, date: selectedDay.date };
    setSelectedSlots((prev) => {
      const exists = prev.some((s) => s.date === slotWithDate.date && s.start === slotWithDate.start);
      if (exists) return prev.filter((s) => !(s.date === slotWithDate.date && s.start === slotWithDate.start));
      return [...prev, slotWithDate].sort((a, b) => slotSortKey(a).localeCompare(slotSortKey(b)));
    });
  };

  const canBook = !!subCourt && selectedSlots.length > 0;

  const handleConfirm = async (proofFile) => {
    if (!proofFile) return;
    setConfirming(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const groupId = crypto.randomUUID();
    const rows = selectedSlots.map((slot) => ({
      user_id: user.id,
      court_id: subCourt.id,
      venue_name: court.name,
      court_name: subCourt.name,
      date: slot.date,
      time: `${slot.start} الي ${slot.end}`,
      price: slot.price,
      status: "confirmed",
      group_id: groupId,
    }));

    let bookingRows;
    try {
      bookingRows = await createBookingWithDeposit({ rows, proofFile });
    } catch (error) {
      setConfirming(false);
      if (error.code === "23505") {
        // unique constraint violation — حد تاني حجز نفس السلوت قبلك
        alert("للأسف حد تاني حجز واحد أو أكتر من المواعيد دي قبلك. حدّث الصفحة واختار مواعيد تانية.");
        window.location.reload();
      } else {
        alert("حصل خطأ أثناء الحجز، حاول تاني");
      }
      return;
    }

    // تحديث فوري محليًا (optimistic) بدل ما نستنى رجوع حدث الـ realtime
    setLiveBookings((prev) => [
      ...prev,
      ...bookingRows.map((b) => ({
        court_id: b.court_id,
        date: b.date,
        time: b.time,
      })),
    ]);
    fetch("/api/notifications/booking-confirmed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        userId: user.id,
        courtId: subCourt.id,
        userName: user.user_metadata?.name || "لاعب Ace Town",
        venueName: court.name,
        courtName: subCourt.name,
        date: summary.dateLabel,
        time: summary.time, // في الإيميل نعرض الرينج الكامل، ده مفهوم للقراءة
        price: summary.total,
        bookingId: bookingRows[0].id,
      }),
    }).catch(() => {});

    setSheetOpen(false);
    setShowToast(true);

    const params = new URLSearchParams({
      court: court.name,
      subCourt: subCourt.name,
      subCourtId: subCourt.id,
      date: summary.dateLabel,
      time: summary.time,
      price: String(summary.total),
    });

    setTimeout(() => {
      router.push(`/booking/${court.slug}/confirmation?${params.toString()}&bookingId=${bookingRows[0].id}`);
    }, 1400);
  };

  const handleBookNowClick = () => {
    if (!canBook) return;
    if (currentUser === null) {
      router.push(`/login?redirect=/booking/${court.slug}`);
      return;
    }
    setSheetOpen(true);
  };

  return (
    <>
      {/* <HeroActionsBar courtSlug={court.slug} /> */}

      <main className="booking-page">
        {/* <VenueSummaryCard court={court} /> */}
        {/* <HeroImageSlider images={court.heroImages} /> */}
        <StepBar hasCourtSub={!!subCourt} hasDate={!!selectedDay} hasTime={selectedSlots.length > 0} />

        {!preselected && <CourtGallerySelector subCourts={court.subCourts || []} selectedId={subCourt?.id} onSelect={handleSelectSubCourt} />}
        <div ref={daysSectionRef}>
          <DaySelector days={court.days || []} selectedDate={selectedDay?.date} onSelect={handleSelectDay} locked={!subCourt} daysWithSelections={daysWithSelections} />
        </div>

        <div ref={slotsSectionRef}>
          <SlotsGrid slots={daySlots} selectedTimes={selectedSlots.filter((s) => s.date === selectedDay?.date).map((s) => s.start)} onToggle={handleToggleSlot} locked={!subCourt || !selectedDay} />
        </div>
      </main>

      {showGuide && <BookingGuideModal onClose={() => setShowGuide(false)} />}

      <BookingSummaryFooter date={summary.dateLabel} time={summary.time} duration={summary.duration} price={summary.total} onBookNow={handleBookNowClick} disabled={!canBook} />

      <ConfirmSheet
        isOpen={sheetOpen}
        onClose={() => !confirming && setSheetOpen(false)}
        onConfirm={handleConfirm}
        confirming={confirming}
        review={{
          venueName: court.name,
          subCourtName: subCourt?.name || "—",
          date: summary.dateLabel,
          time: summary.time,
          price: summary.total,
        }}
      />

      <BookingSuccessToast show={showToast} />
    </>
  );
}
