/**
 * Google Calendar API v3 (browser-only path) + virtual board id `gcal:{email}` for planwise-api.
 * Used when `NEXT_PUBLIC_PLANWISE_DATA_MODE=mock`. Backend mode uses planwise-api import-calendar.
 * @see https://developers.google.com/calendar/api/v3/reference/events/list
 */
import { parseISO } from "date-fns";
import { subDays } from "date-fns";

import type { Board } from "../types/board";
import type { Event } from "../types/event";

const DEFAULT_GOOGLE_COLOR = "#4285F4";

export function googleCalendarBoardIdForUser(email: string): string {
  return `gcal:${email}`;
}

/** Stable id aligned with legacy backend import (`gcal-{safe_google_id}`). */
export function stableGoogleEventId(ge: { id?: string }): string {
  const gid = ge.id ?? crypto.randomUUID().replace(/-/g, "");
  const safe = Array.from(gid)
    .map((c) => (/[a-zA-Z0-9_-]/.test(c) ? c : "_"))
    .join("")
    .slice(0, 180);
  return `gcal-${safe}`;
}

function parseYmdUtc(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function parseGoogleTimes(ge: {
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
}): { start: Date; end: Date; allDay: boolean } {
  const start = ge.start || {};
  const end = ge.end || {};
  if (start.date) {
    const sd = parseYmdUtc(start.date);
    const edEx = parseYmdUtc(end.date ?? start.date);
    let ed = subDays(edEx, 1);
    if (ed.getTime() < sd.getTime()) ed = sd;
    return { start: sd, end: ed, allDay: true };
  }
  const st = start.dateTime;
  const et = end.dateTime;
  if (!st || !et) throw new Error("missing start/end time");
  const sdt = parseISO(st);
  const edt = parseISO(et);
  const startDate = new Date(
    Date.UTC(
      sdt.getUTCFullYear(),
      sdt.getUTCMonth(),
      sdt.getUTCDate()
    )
  );
  const endDate = new Date(
    Date.UTC(
      edt.getUTCFullYear(),
      edt.getUTCMonth(),
      edt.getUTCDate()
    )
  );
  return { start: startDate, end: endDate, allDay: false };
}

export function googleRawToPlanwiseEvent(
  ge: Record<string, unknown>,
  email: string
): (Partial<Event> & { board: Board }) | null {
  if (ge.status === "cancelled") return null;
  const boardId = googleCalendarBoardIdForUser(email);
  const board: Board = {
    id: boardId,
    name: "Google Calendar",
    color: DEFAULT_GOOGLE_COLOR,
  };
  let start: Date;
  let end: Date;
  let allDay: boolean;
  try {
    const t = parseGoogleTimes(
      ge as {
        start?: { date?: string; dateTime?: string };
        end?: { date?: string; dateTime?: string };
      }
    );
    start = t.start;
    end = t.end;
    allDay = t.allDay;
  } catch {
    return null;
  }
  if (start.getTime() > end.getTime()) {
    const x = start;
    start = end;
    end = x;
  }
  const summary = (ge.summary as string) || "(no title)";
  const desc = (ge.description as string) || "";
  const location = (ge.location as string) || "";
  const body = desc ? `${summary}\n${desc}`.trim() : summary;
  const id = stableGoogleEventId(ge as { id?: string });
  return {
    id,
    board,
    startTime: start,
    endTime: end,
    isAllDay: allDay,
    description: body.slice(0, 2000),
    location: location.slice(0, 500),
    eventColor: DEFAULT_GOOGLE_COLOR,
    calendarId: "default",
    timezone: "UTC",
  };
}

export type GoogleCalendarListItem = Record<string, unknown>;

/**
 * Browser `fetch` to Calendar API `events.list` (primary calendar, expanded recurring events).
 */
export async function fetchGoogleCalendarEvents(
  accessToken: string,
  opts: { timeMin: string; timeMax: string; calendarId?: string }
): Promise<GoogleCalendarListItem[]> {
  const calendarId = opts.calendarId ?? "primary";
  const path = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    calendarId
  )}/events`;
  const items: GoogleCalendarListItem[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      timeMin: opts.timeMin,
      timeMax: opts.timeMax,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "2500",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const r = await fetch(`${path}?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!r.ok) {
      const text = await r.text();
      throw new Error(
        `Google Calendar API ${r.status}: ${text.slice(0, 400)}`
      );
    }
    const body = (await r.json()) as {
      items?: GoogleCalendarListItem[];
      nextPageToken?: string;
    };
    items.push(...(body.items ?? []));
    pageToken = body.nextPageToken;
  } while (pageToken);
  return items;
}
