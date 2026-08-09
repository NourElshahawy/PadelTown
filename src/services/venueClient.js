"use client";
import { createClient } from "@/lib/supabase/client";

export async function createVenueWithCourts({ ownerId, venue, courts, photosByCourtId, amenities, hours, cancellationPolicy }) {
  const supabase = createClient();

  const { data: venueRow, error: venueError } = await supabase
    .from("venues")
    .insert({
      owner_id: ownerId,
      name: venue.name,
      address: venue.address,
      city: venue.city,
      phone: venue.phone,
      email: venue.email,
      description: venue.description,
      amenities,
      weekday_open: hours.weekdayOpen,
      weekday_close: hours.weekdayClose === "24:00" ? "23:59" : hours.weekdayClose,
      friday_open: hours.fridayOpen,
      friday_close: hours.fridayClose === "24:00" ? "23:59" : hours.fridayClose,
      cancellation_policy: cancellationPolicy,
      status: "approved",
    
    })
    .select()
    .single();

  if (venueError) throw venueError;

  for (const court of courts) {
    const photos = photosByCourtId[court.id] || [];
    const imageUrls = [];

    for (const photo of photos) {
      const blob = await (await fetch(photo.dataUrl)).blob();
      const path = `${ownerId}/${venueRow.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
const { error: uploadError } = await supabase.storage.from("venue-photos").upload(path, blob);
      if (!uploadError) {
        const { data: publicUrl } = supabase.storage.from("venue-photos").getPublicUrl(path);
        imageUrls.push(publicUrl.publicUrl);
      }
    }

    const { error: courtError } = await supabase.from("courts").insert({
      venue_id: venueRow.id,
      name: court.name,
      type: court.type,
      sport_type: court.sportType || "padel",
      price_per_hour: Number(court.price),
      images: imageUrls,
    });
    if (courtError) throw courtError;
  }

  return venueRow;
}
