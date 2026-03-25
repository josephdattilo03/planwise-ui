"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

import { getDataMode } from "@/src/app/services/dataMode";
import { syncGoogleCalendar } from "@/src/app/services/googleCalendarSync";

const STORAGE_PREFIX = "planwise.gcalLoginSync";
/** Re-sync with Google Calendar at most this often per tab (ms) so revisits refresh data without hammering the API */
const MIN_SYNC_INTERVAL_MS = 5 * 60 * 1000;

/**
 * After Google sign-in (with calendar scope), syncs the primary calendar into planwise-api.
 * - `NEXT_PUBLIC_PLANWISE_DATA_MODE=mock`: browser calls Google, then `POST /board/event`.
 * - `backend` (default): `POST /api/calendar/sync` → API import-calendar (Google on server).
 */
export function GoogleCalendarLoginSync() {
  const { data: session, status } = useSession();
  const syncInFlight = useRef(false);

  useEffect(() => {
    if (status !== "unauthenticated" || typeof window === "undefined") {
      return;
    }
    Object.keys(sessionStorage).forEach((k) => {
      if (k.startsWith(STORAGE_PREFIX)) {
        sessionStorage.removeItem(k);
      }
    });
    syncInFlight.current = false;
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) {
      return;
    }
    if (process.env.NEXT_PUBLIC_SKIP_GOOGLE_CALENDAR_SCOPE === "true") {
      return;
    }

    const mode = getDataMode();
    const needsBrowserToken = mode === "mock";
    if (needsBrowserToken && !session.googleAccessToken) {
      return;
    }

    const key = `${STORAGE_PREFIX}:${session.user.email}:${mode}`;
    const last = sessionStorage.getItem(key);
    const lastAt = last ? Number.parseInt(last, 10) : 0;
    if (lastAt && Date.now() - lastAt < MIN_SYNC_INTERVAL_MS) {
      return;
    }
    if (syncInFlight.current) {
      return;
    }
    syncInFlight.current = true;

    void (async () => {
      try {
        const result = await syncGoogleCalendar(session);
        if (result.ok) {
          sessionStorage.setItem(key, String(Date.now()));
          window.dispatchEvent(new CustomEvent("planwise:google-calendar-synced"));
        } else if (process.env.NODE_ENV === "development") {
          console.warn("[GoogleCalendarLoginSync] skipped", result.reason);
        }
      } catch (e) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[GoogleCalendarLoginSync] sync failed", e);
        }
      } finally {
        syncInFlight.current = false;
      }
    })();
  }, [status, session?.user?.email, session?.googleAccessToken]);

  return null;
}
