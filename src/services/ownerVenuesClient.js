"use client";
import { createClient } from "@/lib/supabase/client";

export async function updateCourtPrice(courtId, newPrice) {
  const supabase = createClient();
  const { error } = await supabase.from("courts").update({ price_per_hour: newPrice }).eq("id", courtId);
  if (error) throw error;
}

// بيرفع صور جديدة على الـ storage ويرجع اللينكات العامة بتاعتها
export async function uploadCourtPhotos(venueId, photos = []) {
  const supabase = createClient();
  const imageUrls = [];
  for (const photo of photos) {
    const blob = await (await fetch(photo.dataUrl)).blob();
    const path = `${venueId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const { error: uploadError } = await supabase.storage.from("venue-photos").upload(path, blob);
    if (!uploadError) {
      const { data: publicUrl } = supabase.storage.from("venue-photos").getPublicUrl(path);
      imageUrls.push(publicUrl.publicUrl);
    }
  }
  return imageUrls;
}

export async function addCourtToVenue(venueId, courtData, photos = []) {
  const supabase = createClient();

  const imageUrls = await uploadCourtPhotos(venueId, photos);

  const { data, error } = await supabase
    .from("courts")
    .insert({
      venue_id: venueId,
      name: courtData.name,
      type: courtData.type,
      price_per_hour: Number(courtData.price),
      images: imageUrls,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// تعديل شامل لملعب موجود بعد الإنشاء: الاسم، النوع، السعر، والصور
// existingImages: اللينكات اللي الأونر مسيبها زي ما هي (بعد ما يشيل اللي عايز يشيله)
// newPhotos: صور جديدة (بصيغة {dataUrl}) هترفع وتتضاف على الصور القديمة
export async function updateCourt(courtId, venueId, { name, type, price, existingImages = [], newPhotos = [] }) {
  const supabase = createClient();

  const uploadedUrls = await uploadCourtPhotos(venueId, newPhotos);
  const images = [...existingImages, ...uploadedUrls];

  const { data, error } = await supabase
    .from("courts")
    .update({
      name,
      type,
      price_per_hour: Number(price),
      images,
    })
    .eq("id", courtId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// نفس createVenue القديمة، لكن هنسيبها بس لحالة "مكان جديد تمامًا"
export async function createVenue(ownerId, venueData, courts) {
  const supabase = createClient();

  const { data: venueRow, error: venueError } = await supabase
    .from("venues")
    .insert({
      owner_id: ownerId,
      name: venueData.name,
      address: venueData.address,
      phone: venueData.phone,
      email: venueData.email,
      description: venueData.description,
      amenities: venueData.amenities,
      status: "approved",
    })
    .select()
    .single();

  if (venueError) throw venueError;

  const courtRows = courts.map((c) => ({
    venue_id: venueRow.id,
    name: c.name,
    type: c.type,
    price_per_hour: Number(c.price),
    images: [],
  }));

  const { error: courtsError } = await supabase.from("courts").insert(courtRows);
  if (courtsError) throw courtsError;

  return venueRow;
}
