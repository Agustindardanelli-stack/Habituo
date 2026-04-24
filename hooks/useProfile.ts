"use client";

import { useEffect, useState } from "react";
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

  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

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

    if (!userLoading) {
      loadProfile();
    }
  }, [user, userLoading, supabase]);

  return { profile, loading };
}