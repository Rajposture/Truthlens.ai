"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { API_URL } from "@/lib/api";

export default function UserSync() {
  const { user, isLoaded, isSignedIn } = useUser();

  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) return;
    if (!user) return;

    if (syncedRef.current) return;

    const clerkId = user.id;

    const email =
      user.primaryEmailAddress?.emailAddress;

    if (!email) return;

    syncedRef.current = true;

    async function syncUser() {
      try {
        const response = await fetch(
          `${API_URL}/api/users`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              clerk_id: clerkId,
              email,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();

          throw new Error(
            `User sync failed (${response.status}): ${errorText}`
          );
        }

        const data = await response.json();

        console.log(
          "✅ User synced successfully:",
          data
        );
      } catch (error) {
        console.error(
          "❌ User sync failed:",
          error
        );

        // Allow another attempt if the request failed
        syncedRef.current = false;
      }
    }

    syncUser();
  }, [
    isLoaded,
    isSignedIn,
    user,
  ]);

  return null;
}