const BACKEND_PROXY_PREFIX = "/api/backend";

function backendUrl(path: string) {
  return `${BACKEND_PROXY_PREFIX}${path.startsWith("/") ? "" : "/"}${path}`;
}

export const GOOGLE_CALENDAR_BOARD_ID = "google-calendar";

export function buildGoogleAuthUrl(userId: string) {
  const query = new URLSearchParams({ user_id: userId }).toString();
  return backendUrl(`/auth/google?${query}`);
}

export type GoogleCalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  color?: string;
  allDay?: boolean;
};

export async function importGoogleCalendarEvents(options: {
  userId: string;
  calendarId: string;
  timeMin: string;
  timeMax: string;
  boardId?: string;
}): Promise<{
  message: string;
  imported_count: number;
  updated_count: number;
  total_google_events: number;
  events?: GoogleCalendarEvent[];
  errors?: Array<{ event_id?: string; error: string }>;
}> {
  const boardId = options.boardId ?? GOOGLE_CALENDAR_BOARD_ID;
  const params = new URLSearchParams({
    calendar_id: options.calendarId,
    time_min: options.timeMin,
    time_max: options.timeMax,
  });

  const res = await fetch(
    backendUrl(
      `/user/${encodeURIComponent(options.userId)}/board/${encodeURIComponent(
        boardId,
      )}/import-calendar?${params.toString()}`,
    ),
    { method: "POST" },
  );

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Import failed (${res.status})`);
  }
  return JSON.parse(text);
}

export function getGoogleCalendarStorage() {
  return {
    connectedKey: "planwise.googleCalendar.connected",
    eventsKey: "planwise.googleCalendar.events",
    calendarIdKey: "planwise.googleCalendar.calendarId",
    lastSyncedKey: "planwise.googleCalendar.lastSynced",
  };
}
