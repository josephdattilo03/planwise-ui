import { Event, Recurrence } from "../../types/event";
import { Board } from "../../types/board";

function toEvent(raw: any, boards: Board[]): Event {
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
    board: boards.find((b) => b.id === raw.boardId) || { id: raw.boardId, name: "Default Board", color: "#ccc" },
    recurrence: raw.recurrence ? {
      frequency: raw.recurrence.frequency,
      dayOfWeek: raw.recurrence.dayOfWeek,
      dateUntil: new Date(raw.recurrence.dateUntil),
      dateStart: raw.recurrence.dateStart ? new Date(raw.recurrence.dateStart) : undefined,
    } : undefined,
  };
}

function toRawEvent(event: Event): any {
  return {
    id: event.id,
    calendarId: event.calendarId,
    boardId: event.board.id,
    startTime: event.startTime.toISOString().split('T')[0], // date format
    endTime: event.endTime.toISOString().split('T')[0],
    eventColor: event.eventColor,
    isAllDay: event.isAllDay,
    description: event.description,
    location: event.location,
    timezone: event.timezone,
    recurrence: event.recurrence ? {
      frequency: event.recurrence.frequency,
      dayOfWeek: event.recurrence.dayOfWeek,
      dateUntil: event.recurrence.dateUntil.toISOString().split('T')[0],
      dateStart: event.recurrence.dateStart?.toISOString().split('T')[0],
    } : undefined,
  };
}

export async function fetchEvents(boards: Board[]): Promise<Event[]> {
  await new Promise((r) => setTimeout(r, 300)); // simulates network delay

  const dummyEvents = [
    {
      id: "event-1",
      calendarId: "default",
      boardId: "board-3", // Quick Notes board
      startTime: new Date().toISOString().split('T')[0],
      endTime: new Date().toISOString().split('T')[0],
      eventColor: "#1976d2",
      isAllDay: true,
      description: "Team standup meeting",
      location: "Virtual",
      timezone: "America/New_York",
    },
    {
      id: "event-2",
      calendarId: "default",
      boardId: "board-1", // Website Redesign board
      startTime: new Date(Date.now() + 172800000).toISOString().split('T')[0], // +2 days
      endTime: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      eventColor: "#d32f2f",
      isAllDay: false,
      description: "Client presentation rehearsal",
      location: "Conference Room A",
      timezone: "America/New_York",
    },
    {
      id: "event-3",
      calendarId: "default",
      boardId: "board-2", // Mobile App board
      startTime: new Date(Date.now() + 86400000).toISOString().split('T')[0], // +1 day
      endTime: new Date(Date.now() + 86400000).toISOString().split('T')[0],
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
  return events.map((raw: any) => toEvent(raw, boards));
}

export async function createEvent(eventData: Partial<Event>, boards: Board[]): Promise<Event> {
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
    board: eventData.board || { id: "board-3", name: "Quick Notes", color: "#ccc" },
    recurrence: eventData.recurrence,
  };

  const rawEvent = toRawEvent(newEvent);
  const updated = [...events, rawEvent];

  localStorage.setItem("events", JSON.stringify(updated));
  return newEvent;
}

export async function updateEvent(updatedEvent: Event, boards: Board[]): Promise<Event> {
  const events = JSON.parse(localStorage.getItem("events") || "[]");

  const updated = events.map((e: any) =>
    e.id === updatedEvent.id ? toRawEvent(updatedEvent) : e
  );

  localStorage.setItem("events", JSON.stringify(updated));
  return updatedEvent;
}

export async function deleteEvent(eventId: string): Promise<void> {
  const events = JSON.parse(localStorage.getItem("events") || "[]");

  const updated = events.filter((e: any) => e.id !== eventId);

  localStorage.setItem("events", JSON.stringify(updated));
}

export async function getEventsByTimeRange(
  startDate: Date,
  endDate: Date,
  boards: Board[]
): Promise<Event[]> {
  const allEvents = await fetchEvents(boards);

  return allEvents.filter((event) =>
    event.startTime >= startDate && event.endTime <= endDate
  );
}

export async function getEventById(eventId: string, boards: Board[]): Promise<Event | null> {
  const events = JSON.parse(localStorage.getItem("events") || "[]");
  const rawEvent = events.find((e: any) => e.id === eventId);

  return rawEvent ? toEvent(rawEvent, boards) : null;
}
