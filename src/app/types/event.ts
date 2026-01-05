import { Board } from "./board";

export interface Recurrence {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  dayOfWeek: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[];
  dateUntil: Date;
  dateStart?: Date;
}

export interface Event {
  id: string;
  calendarId: string;
  startTime: Date;
  endTime: Date;
  eventColor: string;
  isAllDay: boolean;
  description: string;
  location: string;
  timezone: string;
  board: Board;
  recurrence?: Recurrence;
}
