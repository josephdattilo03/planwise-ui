"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

import { getDataMode } from "@/src/app/services/dataMode";

/**
 * After Google sign-in (with calendar scope), imports primary-calendar events once
 * per browser tab into DynamoDB (insert-only). Backend uses one prefix query + batch writes.
 */
export function GoogleCalendarLoginSync() {
  const { data: session, status } = useSession();
  const ran = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) {
      return;
    }
    if (getDataMode() === "mock") {
      return;
    }
    if (process.env.NEXT_PUBLIC_SKIP_GOOGLE_CALENDAR_SCOPE === "true") {
      return;
    }
    const key = `planwise.gcalLoginSync:${session.user.email}`;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(key)) {
      return;
    }
    if (ran.current) {
      return;
    }
    ran.current = true;

    void (async () => {
      try {
        const res = await fetch("/api/calendar/sync", { method: "POST" });
        if (res.ok && typeof sessionStorage !== "undefined") {
          sessionStorage.setItem(key, "1");
        }
      } catch {
        /* non-fatal */
      }
    })();
  }, [status, session?.user?.email]);

  return null;
}
