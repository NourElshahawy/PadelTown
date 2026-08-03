"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const loadProfile = async (currentUser) => {
      if (!currentUser) {
        setProfile(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("name, phone, role, owner_status, avatar_url") 
        .eq("id", currentUser.id)
        .single();
       setProfile(data);
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      loadProfile(user).finally(() => setLoading(false));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  return { user, profile, loading };
}
