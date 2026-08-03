"use client";
import { createClient } from "@/lib/supabase/client";
import { resizeImageFile } from "@/lib/resizeImage";
export async function signUpPlayer({ name, email, phone, password, avatarFile }) {
  const supabase = createClient();

  const { data: exists } = await supabase.rpc("email_exists", { check_email: email });
  if (exists) throw new Error("الإيميل ده مسجل بالفعل على الموقع، جرب تسجيل الدخول بدل كده");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, phone, role: "player" } },
  });
  if (error) throw error;

  if (avatarFile && data.user) {
    const resized = await resizeImageFile(avatarFile);
    const path = `${data.user.id}/${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, resized);
    if (uploadError) {
      console.error("Avatar upload failed:", uploadError.message);
    } else {
      const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl.publicUrl }).eq("id", data.user.id);
      if (updateError) console.error("Profile update failed:", updateError.message);
    }
  }

  return data;
}
export async function signUpOwner({ name, email, phone, password }) {
  const supabase = createClient();

  const { data: exists } = await supabase.rpc("email_exists", { check_email: email });
  if (exists) throw new Error("الإيميل ده مسجل بالفعل على الموقع، جرب تسجيل الدخول بدل كده");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, phone, role: "owner" } },
  });
  if (error) throw error;
  return data;
}

export async function signInWithPassword({ email, password }) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function requestPasswordReset(email) {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function updatePhone(userId, phone) {
  const supabase = createClient();
  const { error } = await supabase.from("profiles").update({ phone }).eq("id", userId);
  if (error) throw error;
  return phone;
}

export async function updateAvatar(userId, avatarFile) {
  const supabase = createClient();
  const resized = await resizeImageFile(avatarFile);
  const path = `${userId}/${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, resized);
  if (uploadError) throw uploadError;

  const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(path);
  const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl.publicUrl }).eq("id", userId);
  if (updateError) throw updateError;

  return publicUrl.publicUrl;
}
