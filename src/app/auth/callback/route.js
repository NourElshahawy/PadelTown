import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("role, owner_status, avatar_url, phone").eq("id", user.id).single();

      const destination = profile?.role === "owner" ? "/owner/dashboard" : "/";

      if (!profile?.phone) {
        return NextResponse.redirect(`${origin}/complete-profile?redirect=${encodeURIComponent(destination)}`);
      }

      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}