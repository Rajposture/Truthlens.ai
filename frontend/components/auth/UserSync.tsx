"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { api } from "@/lib/api";

export default function UserSync() {

  const {
    user,
    isLoaded,
    isSignedIn,
  } = useUser();

  const syncedRef =
    useRef(false);

  useEffect(() => {

    if (!isLoaded) return;

    if (!isSignedIn) return;

    if (!user) return;

    if (syncedRef.current) return;

    const clerkId =
      user.id;

    const email =
      user.primaryEmailAddress
        ?.emailAddress;

    if (!email) return;

    syncedRef.current = true;

    async function syncUser() {

      try {

        const response =
          await api.post(
            "/users",
            {
              clerk_id: clerkId,
              email: email,
            }
          );

        console.log(
          "✅ User synced:",
          response.data
        );

      } catch (error) {

        console.error(
          "❌ User sync failed:",
          error
        );

        // allow retry if request fails
        syncedRef.current = false;
      }

    }

    syncUser();

  }, [
    isLoaded,
    isSignedIn,
    user
  ]);

  return null;
}