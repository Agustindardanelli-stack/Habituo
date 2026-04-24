"use client";

import { useProfile } from "./useProfile";

export function useSubscription() {
  const { profile, loading } = useProfile();

  const isPremium = profile?.plan === "premium";

  return {
    isPremium,
    loading,
    plan: profile?.plan || "free",
  };
}