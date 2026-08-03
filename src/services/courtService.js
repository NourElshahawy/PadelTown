import { createClient } from "@/lib/supabase/server";
import { buildNextSevenDays, buildDefaultSlots } from "./courtLogic";
import { getEgyptISODate } from "./courtLogic";
export async function getAllCourts({ date } = {}) {
  const supabase = await createClient();

  const { data: venues, error } = await supabase
    .from("venues")
    .select(
      `
      id, name, address, phone, description, amenities,
      courts (id, name, type, price_per_hour, images)
    `,
    )
    .eq("status", "approved");

  if (error) throw error;

  const allCourtIds = venues.flatMap((v) => v.courts.map((c) => c.id));

  const countByCourtId = {};
  await Promise.all(
    allCourtIds.map(async (courtId) => {
      const { data: count } = await supabase.rpc("get_court_booking_count", { target_court_id: courtId });
      countByCourtId[courtId] = count || 0;
    }),
  );

  let bookingsForDate = [];
  if (date) {
    const { data } = await supabase
      .from("booking_slots")
      .select("court_id, time")
      .in("court_id", allCourtIds.length ? allCourtIds : ["00000000-0000-0000-0000-000000000000"])
      .eq("date", date)
      .in("status", ["confirmed", "completed"]);
    bookingsForDate = data || [];
  }

  const { data: allReviews } = await supabase
    .from("court_reviews")
    .select("court_id, rating")
    .in("court_id", allCourtIds.length ? allCourtIds : ["00000000-0000-0000-0000-000000000000"]);

  const ratingByCourtId = {};
  (allReviews || []).forEach((r) => {
    if (!ratingByCourtId[r.court_id]) ratingByCourtId[r.court_id] = [];
    ratingByCourtId[r.court_id].push(r.rating);
  });

  const TYPE_LABELS = { regular: "عادي", indoor: "مغطى", outdoor: "مفتوح", panoramic: "بانورامي" };

  return venues
    .flatMap((venue) =>
      venue.courts.map((court) => {
        if (date) {
          const bookedTimesForCourt = bookingsForDate.filter((b) => b.court_id === court.id).map((b) => b.time);
          if (bookedTimesForCourt.length >= 12) return null;
        }

        const courtRatings = ratingByCourtId[court.id] || [];
        const avgRating = courtRatings.length > 0 ? (courtRatings.reduce((a, b) => a + b, 0) / courtRatings.length).toFixed(1) : null;

        return {
          id: court.id,
          slug: `${slugify(venue.name)}-${venue.id.slice(0, 8)}`,
          subCourtId: court.id,
          name: venue.courts.length > 1 ? court.name : venue.name,
          venueName: venue.name,
          venueId: venue.id,
          image: court.images?.[0] || "/assets/imgs/courts-bg.png",
          location: venue.address,
          locationLink: null,
          isLive: true,
          rating: avgRating ? Number(avgRating) : 0,
          reviewCount: courtRatings.length,
          pricePerHour: court.price_per_hour,
          priceRangeLabel: `${court.price_per_hour}`,
          typeLabel: TYPE_LABELS[court.type] || court.type,
          courtsCount: venue.courts.length,
          bookingsCount: formatBookingsCount(countByCourtId[court.id] || 0),
          featured: false,
          todaySlots: [],
        };
      }),
    )
    .filter(Boolean);
}

export async function getAllCourtsFlat() {
  const supabase = await createClient();

  const { data: venues, error } = await supabase.from("venues").select("id, name, address, courts(id, name, price_per_hour, images)").eq("status", "approved");

  if (error) throw error;

  return venues.flatMap((venue) =>
    (venue.courts || []).map((court) => ({
      id: court.id,
      name: venue.courts.length > 1 ? `${venue.name} — ${court.name}` : venue.name,
      image: court.images?.[0] || "/assets/imgs/courts-bg.png",
      location: venue.address,
      rating: 4.7,
    })),
  );
}

export async function getFeaturedCourts() {
  const courts = await getAllCourts();
  const featured = courts.filter((c) => c.featured);
  return featured.length > 0 ? featured : courts.slice(0, 3);
}

export async function getCourtDetails(slug) {
  const courts = await getAllCourts();

  const decodedSlug = decodeURIComponent(slug);
  const court = courts.find((c) => c.slug === decodedSlug);
  if (!court) return null;

  const supabase = await createClient();
  const { data: venue } = await supabase.from("venues").select("*, courts(*)").eq("id", court.venueId).single();

  const courtIds = (venue?.courts || []).map((c) => c.id);
  const { data: bookings } = await supabase
    .from("booking_slots")
    .select("court_id, date, time")
    .in("court_id", courtIds.length ? courtIds : ["00000000-0000-0000-0000-000000000000"])
    .in("status", ["confirmed", "completed"]);

  // نفس الـ blocked_slots اللي الأونر بيقفلها من صفحته (ownerScheduleService)
  // لازم تتفلتر برضو هنا عشان العميل ميقدرش يحجز ساعة مقفولة من صفحة الحجز العامة
  const { data: blockedSlots } = await supabase
    .from("blocked_slots")
    .select("id, court_id, date, time, reason")
    .in("court_id", courtIds.length ? courtIds : ["00000000-0000-0000-0000-000000000000"]);
  const todayISO = getEgyptISODate();

  return {
    ...court,
    name: venue?.name || court.name,
    logo: court.image,
    coverImage: court.image,
    reviewsCount: "0",
    amenities: (venue?.amenities || []).map((a) => ({ icon: amenityIcon(a), label: amenityLabel(a) })),
    heroImages: venue?.courts?.flatMap((c) => c.images || []) || [court.image],
    subCourts: (venue?.courts || []).map((c) => {
      const bookedTodayCount = (bookings || []).filter((b) => b.court_id === c.id && b.date === todayISO).length;
      return {
        id: c.id,
        name: c.name,
        pricePerHour: c.price_per_hour,
        image: c.images?.[0] || court.image,
        description: `ملعب ${c.type === "panoramic" ? "بانوراما" : c.type === "indoor" ? "داخلي" : "خارجي"}`,
        tags: [{ icon: "fa-table-tennis-paddle-ball", label: c.type }],
        isFullyBookedToday: bookedTodayCount >= 12,
      };
    }),
    days: buildNextSevenDays(),
    bookings: bookings || [],
    // أي مكوّن بيبني الأوقات المتاحة (buildDefaultSlots + الفلترة) لازم يستبعد الأوقات
    // الموجودة هنا برضو، مش بس اللي في bookings
    blockedSlots: blockedSlots || [],
  };
}

function formatBookingsCount(count) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

function slugify(str) {
  const cleaned = str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]/g, "");
  return cleaned || "venue";
}
function amenityIcon(key) {
  const map = { parking: "fa-car", cafeteria: "fa-mug-hot", showers: "fa-shower", lockers: "fa-lock", wifi: "fa-wifi" };
  return map[key] || "fa-check";
}
function amenityLabel(key) {
  const map = { parking: "موقف سيارات", cafeteria: "كافتيريا", showers: "غرف تغيير", lockers: "خزائن", wifi: "واي فاي" };
  return map[key] || key;
}
