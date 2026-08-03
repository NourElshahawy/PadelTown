export function getEgyptISODate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(date);
}

export function buildNextSevenDays(count = 30) {
  const days = [];
  const dowNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربع", "الخميس", "الجمعة", "السبت"];
  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      date: getEgyptISODate(d),
      dow: dowNames[d.getDay()],
      dom: String(d.getDate()),
      month: monthNames[d.getMonth()],
    });
  }
  return days;
}

export function buildDefaultSlots(basePrice) {
  const hours = ["12:00 ص", "1:00 ص", "2:00 ص", "3:00 ص", "4:00 ص", "5:00 ص", "6:00 ص", "7:00 ص", "8:00 ص", "9:00 ص", "10:00 ص", "11:00 ص","12:00 م", "1:00 م", "2:00 م", "3:00 م", "4:00 م", "5:00 م", "6:00 م", "7:00 م", "8:00 م", "9:00 م", "10:00 م", "11:00 م"];
  return hours.map((start, i) => ({
    start,
    end: hours[i + 1] || "12:00 ص",
    price: basePrice,
    status: "available",
  }));
}


export const TIME_PERIODS = {
  morning: ["6:00 ص", "7:00 ص", "8:00 ص", "9:00 ص", "10:00 ص", "11:00 ص"],
  afternoon: ["12:00 م", "1:00 م", "2:00 م", "3:00 م", "4:00 م", "5:00 م"],
  evening: ["6:00 م", "7:00 م", "8:00 م", "9:00 م", "10:00 م", "11:00 م"],
  night: ["12:00 ص", "1:00 ص", "2:00 ص", "3:00 ص", "4:00 ص", "5:00 ص"],
};

function timeToMinutesShared(label) {
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

// بتاخد سلوتات مرتبة زمنيًا وترجّع نص واضح: لو متصلة بتبقى "من - لحد"،
// لو فيها فجوة (مش متصلة) بتبقى كذا نطاق منفصل بعلامة "+" بينهم بدل ما توهم إنها متصلة
export function formatSlotRanges(sortedSlots) {
  if (!sortedSlots || sortedSlots.length === 0) return "";
  if (sortedSlots.length === 1) return `${sortedSlots[0].start} الي ${sortedSlots[0].end}`;

  const segments = [];
  let segStart = sortedSlots[0];
  let segEnd = sortedSlots[0];

  for (let i = 1; i < sortedSlots.length; i++) {
    const slot = sortedSlots[i];
    const isContiguous = slot.date === segEnd.date && slot.start === segEnd.end;
    if (isContiguous) {
      segEnd = slot;
    } else {
      segments.push({ start: segStart, end: segEnd });
      segStart = slot;
      segEnd = slot;
    }
  }
  segments.push({ start: segStart, end: segEnd });

  return segments.map((seg) => (seg.start.date === seg.end.date ? `${seg.start.start} الي ${seg.end.end}` : `${seg.start.start} (${seg.start.date}) الي ${seg.end.end} (${seg.end.date})`)).join(" + ");
}