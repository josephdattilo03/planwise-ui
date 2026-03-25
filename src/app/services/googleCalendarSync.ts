import { createEvent } from "./events/eventService";
import { getDataMode } from "./dataMode";
import {
  fetchGoogleCalendarEvents,
  googleCalendarBoardIdForUser,
  googleRawToPlanwiseEvent,
} from "./googleCalendarService";

const BACKEND_PREFIX = "/api/backend";

async function fetchExistingGoogleEventIds(email: string): Promise<Set<string>> {
  const bid = encodeURIComponent(googleCalendarBoardIdForUser(email));
  const res = await fetch(`${BACKEND_PREFIX}/board/${bid}/event/`, {
    method: "GET",
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  const rows = (await res.json()) as { id: string }[];
  return new Set(rows.map((r) => String(r.id)));
}

export type GoogleSyncSession = {
  user?: { email?: string | null } | null;
  googleAccessToken?: string | null;
};

export type GoogleSyncResult =
  | {
      ok: true;
      source: "browser" | "backend";
      created?: number;
      totalGoogle?: number;
      imported_count?: number;
      total_google_events?: number;
      events?: unknown[];
      message?: string;
    }
  | { ok: false; skipped: true; reason: string };

/**
 * `NEXT_PUBLIC_PLANWISE_DATA_MODE=mock`: browser calls Google Calendar API, then
 * `POST /board/event` for new rows only.
 *
 * `backend` (default): `POST /api/calendar/sync` → planwise-api import-calendar (Google on server).
 */
export async function syncGoogleCalendar(
  session: GoogleSyncSession | null
): Promise<GoogleSyncResult> {
  if (process.env.NEXT_PUBLIC_SKIP_GOOGLE_CALENDAR_SCOPE === "true") {
    return { ok: false, skipped: true, reason: "calendar_scope_disabled" };
  }

  if (getDataMode() === "backend") {
    return syncGoogleCalendarViaNextApi();
  }

  return syncGoogleCalendarFromBrowser(session);
}

/**
 * Fetches primary-calendar events in the browser, then creates only new rows via planwise-api.
 */
export async function syncGoogleCalendarFromBrowser(
  session: GoogleSyncSession | null
): Promise<GoogleSyncResult> {
  const email = session?.user?.email;
  const token = session?.googleAccessToken;
  if (!email || !token) {
    return { ok: false, skipped: true, reason: "no_email_or_token" };
  }

  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setMonth(rangeEnd.getMonth() + 3);

  const raw = await fetchGoogleCalendarEvents(token, {
    timeMin: rangeStart.toISOString(),
    timeMax: rangeEnd.toISOString(),
    calendarId: "primary",
  });

  const existingIds = await fetchExistingGoogleEventIds(email);
  const gcalBoardId = googleCalendarBoardIdForUser(email);
  const syntheticBoard = {
    id: gcalBoardId,
    name: "Google Calendar",
    color: "#4285F4",
  };

  let created = 0;
  for (const ge of raw) {
    const mapped = googleRawToPlanwiseEvent(ge, email);
    if (!mapped?.id) continue;
    if (existingIds.has(mapped.id)) continue;
    await createEvent(mapped, [syntheticBoard]);
    existingIds.add(mapped.id);
    created++;
  }

  return {
    ok: true,
    source: "browser",
    created,
    totalGoogle: raw.length,
  };
}

async function syncGoogleCalendarViaNextApi(): Promise<GoogleSyncResult> {
  const res = await fetch("/api/calendar/sync", { method: "POST" });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : JSON.stringify(data)
    );
  }

  if (data.skipped === true) {
    return {
      ok: false,
      skipped: true,
      reason: String(data.reason ?? "skipped"),
    };
  }

  return {
    ok: true,
    source: "backend",
    imported_count: Number(data.imported_count ?? 0),
    total_google_events: Number(data.total_google_events ?? 0),
    events: data.events as unknown[] | undefined,
    message: data.message as string | undefined,
  };
}
