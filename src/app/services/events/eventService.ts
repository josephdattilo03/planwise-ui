import { Event } from "../../types/event";
import { Board } from "../../types/board";
import { backendJSON } from "../backendJson";
import { getDataMode } from "../dataMode";
import { googleCalendarBoardIdForUser } from "../googleCalendarService";

function toEventMock(raw: any, boards: Board[]): Event {
  return {
    id: raw.id,
    calendarId: raw.calendarId,
    startTime: new Date(raw.startTime),
    endTime: new Date(raw.endTime),
    eventColor: raw.eventColor,
    isAllDay: raw.isAllDay,
    description: raw.description,
    location: raw.location,
    timezone: raw.timezone,
    board:
      boards.find((b) => b.id === raw.boardId) || {
        id: raw.boardId,
        name: "Default Board",
        color: "#ccc",
      },
    recurrence: raw.recurrence
      ? {
          frequency: raw.recurrence.frequency,
          dayOfWeek: raw.recurrence.dayOfWeek,
          dateUntil: new Date(raw.recurrence.dateUntil),
          dateStart: raw.recurrence.dateStart
            ? new Date(raw.recurrence.dateStart)
            : undefined,
        }
      : undefined,
  };
}

function toBackendYMD(d: Date) {
  return d.toISOString().split("T")[0];
}

/**
 * API returns `YYYY-MM-DD` or full ISO (`2026-03-26T00:00:00`). Do not append `T00:00:00`
 * when the string already includes `T` — that produces Invalid Date and breaks the calendar.
 */
function parseBackendEventTime(value: unknown): Date {
  const s = String(value ?? "").trim();
  if (!s) {
    return new Date(NaN);
  }
  if (s.includes("T")) {
    return new Date(s);
  }
  return new Date(`${s}T00:00:00`);
}

function toEventBackend(raw: any, boardById: Map<string, Board>): Event {
  const bid = String(raw.board_id);
  const board =
    boardById.get(bid) ||
    (bid.startsWith("gcal:")
      ? {
          id: bid,
          name: "Google Calendar",
          color: "#4285F4",
        }
      : {
          id: bid,
          name: "Unknown Board",
          color: "#ccc",
        });

  const recurrence = raw.recurrence
    ? {
        frequency: raw.recurrence.frequency,
        dayOfWeek: raw.recurrence.day_of_week,
        dateUntil: new Date(`${raw.recurrence.termination_date}T00:00:00`),
        dateStart: raw.recurrence.date_start
          ? new Date(`${raw.recurrence.date_start}T00:00:00`)
          : undefined,
      }
    : undefined;

  return {
    id: String(raw.id),
    // Backend doesn't have calendarId; UI expects it, so keep a default.
    calendarId: "default",
    startTime: parseBackendEventTime(raw.start_time),
    endTime: parseBackendEventTime(raw.end_time),
    eventColor: raw.event_color,
    isAllDay: raw.is_all_day,
    description: raw.description,
    location: raw.location,
    timezone: "UTC",
    board,
    recurrence,
  };
}

function toBackendEventPayload(event: Event) {
  return {
    id: event.id,
    board_id: event.board.id,
    start_time: toBackendYMD(event.startTime),
    end_time: toBackendYMD(event.endTime),
    event_color: event.eventColor,
    is_all_day: event.isAllDay,
    description: event.description,
    location: event.location,
    // Backend Pydantic model requires the key; JSON.stringify drops `undefined`.
    recurrence: event.recurrence
      ? {
          frequency: event.recurrence.frequency,
          day_of_week: event.recurrence.dayOfWeek,
          termination_date: toBackendYMD(event.recurrence.dateUntil),
          date_start: event.recurrence.dateStart
            ? toBackendYMD(event.recurrence.dateStart)
            : null,
        }
      : null,
  };
}

async function fetchEventsMock(boards: Board[]): Promise<Event[]> {
  await new Promise((r) => setTimeout(r, 300)); // simulates network delay

  const dummyEvents = [
    {
      id: "event-1",
      calendarId: "default",
      boardId: "board-3",
      startTime: new Date().toISOString().split("T")[0],
      endTime: new Date().toISOString().split("T")[0],
      eventColor: "#1976d2",
      isAllDay: true,
      description: "Team standup meeting",
      location: "Virtual",
      timezone: "America/New_York",
    },
    {
      id: "event-2",
      calendarId: "default",
      boardId: "board-1",
      startTime: new Date(Date.now() + 172800000)
        .toISOString()
        .split("T")[0],
      endTime: new Date(Date.now() + 172800000).toISOString().split("T")[0],
      eventColor: "#d32f2f",
      isAllDay: false,
      description: "Client presentation rehearsal",
      location: "Conference Room A",
      timezone: "America/New_York",
    },
    {
      id: "event-3",
      calendarId: "default",
      boardId: "board-2",
      startTime: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      endTime: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      eventColor: "#2e7d32",
      isAllDay: true,
      description: "Project milestone review",
      location: "Main Office",
      timezone: "America/New_York",
    },
  ];

  if (
    !localStorage.getItem("events") ||
    JSON.parse(localStorage.getItem("events") || "[]").length === 0
  ) {
    localStorage.setItem("events", JSON.stringify(dummyEvents));
  }

  const events = JSON.parse(localStorage.getItem("events") || "[]");
  return events.map((raw: any) => toEventMock(raw, boards));
}

export async function fetchEvents(
  boards: Board[],
  userId?: string
): Promise<Event[]> {
  if (getDataMode() === "mock") {
    return fetchEventsMock(boards);
  }

  const boardById = new Map(boards.map((b) => [b.id, b]));
  const gcalId = userId ? googleCalendarBoardIdForUser(userId) : null;
  const boardIdsToFetch = [
    ...boards.map((b) => b.id),
    ...(gcalId && !boardById.has(gcalId) ? [gcalId] : []),
  ];

  const eventsPerBoard = await Promise.all(
    boardIdsToFetch.map((id) =>
      backendJSON<any[]>(`/board/${encodeURIComponent(id)}/event/`, {
        method: "GET",
      })
    )
  );

  return eventsPerBoard
    .flat()
    .map((raw) => toEventBackend(raw, boardById));
}

export async function createEvent(
  eventData: Partial<Event>,
  boards: Board[]
): Promise<Event> {
  if (getDataMode() === "mock") {
    const events = JSON.parse(localStorage.getItem("events") || "[]");

    const newEvent: Event = {
      id: `event-${Date.now()}`,
      calendarId: eventData.calendarId || "default",
      startTime: eventData.startTime || new Date(),
      endTime: eventData.endTime || new Date(),
      eventColor: eventData.eventColor || "#1976d2",
      isAllDay: eventData.isAllDay ?? true,
      description: eventData.description || "",
      location: eventData.location || "",
      timezone: eventData.timezone || "America/New_York",
      board:
        eventData.board || {
          id: "board-3",
          name: "Quick Notes",
          color: "#ccc",
        },
      recurrence: eventData.recurrence,
    };

    // Preserve mock behavior exactly as before.
    const rawEvent = {
      ...newEvent,
      boardId: newEvent.board.id,
      startTime: newEvent.startTime.toISOString().split("T")[0],
      endTime: newEvent.endTime.toISOString().split("T")[0],
      recurrence: newEvent.recurrence
        ? {
            frequency: newEvent.recurrence.frequency,
            dayOfWeek: newEvent.recurrence.dayOfWeek,
            dateUntil: newEvent.recurrence.dateUntil
              .toISOString()
              .split("T")[0],
            dateStart: newEvent.recurrence.dateStart
              ? newEvent.recurrence.dateStart.toISOString().split("T")[0]
              : undefined,
          }
        : undefined,
    };

    localStorage.setItem("events", JSON.stringify([...events, rawEvent]));
    return newEvent;
  }

  const board = eventData.board ?? boards[0];
  if (!board) throw new Error("No boards available");

  const eventToCreate: Event = {
    id: eventData.id ?? `event-${Date.now()}`,
    calendarId: eventData.calendarId ?? "default",
    startTime: eventData.startTime ?? new Date(),
    endTime: eventData.endTime ?? new Date(),
    eventColor: eventData.eventColor ?? board.color,
    isAllDay: eventData.isAllDay ?? true,
    description: eventData.description ?? "",
    location: eventData.location ?? "",
    timezone: eventData.timezone ?? "UTC",
    board,
    recurrence: eventData.recurrence,
  };

  const res = await backendJSON<{ event_id?: string }>(`/board/event`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(toBackendEventPayload(eventToCreate)),
  });

  return { ...eventToCreate, id: String(res.event_id ?? eventToCreate.id) };
}

export async function updateEvent(
  updatedEvent: Event,
  boards: Board[]
): Promise<Event> {
  if (getDataMode() === "mock") {
    const events = JSON.parse(localStorage.getItem("events") || "[]");

    const updated = events.map((e: any) => e.id === updatedEvent.id ? updatedEvent : e);
    localStorage.setItem("events", JSON.stringify(updated));
    return updatedEvent;
  }

  const boardById = new Map(boards.map((b) => [b.id, b]));
  const payload = toBackendEventPayload(updatedEvent);

  const res = await backendJSON<{ event?: any }>(
    `/board/${encodeURIComponent(updatedEvent.board.id)}/event/${encodeURIComponent(updatedEvent.id)}`,
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.event) return updatedEvent;
  return toEventBackend(res.event, boardById);
}

export async function deleteEvent(
  boardId: string,
  eventId: string
): Promise<void> {
  if (getDataMode() === "mock") {
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    const updated = events.filter((e: any) => e.id !== eventId);
    localStorage.setItem("events", JSON.stringify(updated));
    return;
  }

  await backendJSON(`/board/${encodeURIComponent(boardId)}/event/${encodeURIComponent(eventId)}`, {
    method: "DELETE",
  });
}

export async function getEventsByTimeRange(
  startDate: Date,
  endDate: Date,
  boards: Board[],
  userId?: string
): Promise<Event[]> {
  const allEvents = await fetchEvents(boards, userId);
  return allEvents.filter((event) => {
    return event.startTime >= startDate && event.endTime <= endDate;
  });
}

export async function getEventById(
  eventId: string,
  boards: Board[],
  userId?: string
): Promise<Event | null> {
  if (getDataMode() === "mock") {
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    const rawEvent = events.find((e: any) => e.id === eventId);
    return rawEvent ? toEventMock(rawEvent, boards) : null;
  }

  const boardById = new Map(boards.map((bb) => [bb.id, bb]));
  const gcalId = userId ? googleCalendarBoardIdForUser(userId) : null;
  const ids = gcalId && !boardById.has(gcalId) ? [...boards.map((b) => b.id), gcalId] : boards.map((b) => b.id);

  for (const bid of ids) {
    const events = await backendJSON<any[]>(
      `/board/${encodeURIComponent(bid)}/event/`,
      { method: "GET" }
    );
    const found = events.find((e: any) => String(e.id) === eventId);
    if (found) {
      return toEventBackend(found, boardById);
    }
  }
  return null;
}
