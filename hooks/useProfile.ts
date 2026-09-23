"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { useUser } from "./useUser";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  plan: "free" | "premium";
};

export function useProfile() {
  const { user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  // Stable client reference — createBrowserClient creates a new object each call
  const supabase = useRef(createClient()).current;

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    if (userLoading) return;

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error cargando profile:", error);
      }

      setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, [user, userLoading, supabase]);

  return { profile, loading };
}
