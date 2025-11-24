"use client";

import { Calendar, dateFnsLocalizer, View, EventProps } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

type Event = {
  title: string;
  start: Date;
  end: Date;
  resource?: {
    color?: "green" | "blue" | "orange" | "purple" | "lilac";
  };
};

const initialEvents: Event[] = [
  {
    title: "Daily Standup",
    start: new Date(new Date().setHours(8, 0, 0, 0)),
    end: new Date(new Date().setHours(8, 30, 0, 0)),
    resource: { color: "green" },
  },
  {
    title: "Team Meeting",
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 0, 0, 0)),
    resource: { color: "blue" },
  },
  {
    title: "Lunch Break",
    start: new Date(new Date().setHours(12, 0, 0, 0)),
    end: new Date(new Date().setHours(13, 0, 0, 0)),
    resource: { color: "lilac" },
  },
  {
    title: "Project Review",
    start: new Date(new Date().setDate(new Date().getDate() + 1)),
    end: new Date(new Date().setDate(new Date().getDate() + 1)),
    resource: { color: "orange" },
  },
  {
    title: "Client Call",
    start: new Date(new Date().setDate(new Date().getDate() + 2)),
    end: new Date(new Date().setDate(new Date().getDate() + 2)),
    resource: { color: "green" },
  },
  {
    title: "Weekly Review",
    start: new Date(new Date().setDate(new Date().getDate() + 3)),
    end: new Date(new Date().setDate(new Date().getDate() + 3)),
    resource: { color: "blue" },
  },
  {
    title: "Weekend Planning",
    start: new Date(new Date().setDate(new Date().getDate() + 4)),
    end: new Date(new Date().setDate(new Date().getDate() + 4)),
    resource: { color: "orange" },
  },
];

function EventWrapper({ event }: EventProps<Event>) {
  const colorMap: Record<string, string> = {
    green: "bg-Green-3 text-Dark-Green-1",
    blue: "bg-Sky-Blue text-Dark-Green-1",
    orange: "bg-Orange text-Dark-Red",
    purple: "bg-Lilac text-Dark-Green-1",
    lilac: "bg-Lilac text-Dark-Green-1",
  };

  const colorClass = event.resource?.color
    ? colorMap[event.resource.color]
    : "bg-Green-3 text-Dark-Green-1";

  return (
    <div
      className={`rounded-md px-2 py-1 text-xs font-medium shadow-sm border border-green-4 ${colorClass}`}
    >
      {event.title}
    </div>
  );
}

export default function PlanwiseCalendar() {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const getCurrentLabel = () => {
    if (view === "month") {
      return format(date, "MMMM yyyy");
    } else if (view === "week") {
      const start = startOfWeek(date, { weekStartsOn: 0 });
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${format(start, "MMM d", { locale: enUS })} – ${format(end, "MMM d, yyyy", { locale: enUS })}`;
    } else {
      return format(date, "MMMM d, yyyy", { locale: enUS });
    }
  };

  return (
    <div className="w-full h-[750px] bg-off-white rounded-2xl border border-green-3 shadow p-6 overflow-y-auto">
      {/* Top toolbar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-section-sub-header text-dark-green-1">
          {getCurrentLabel()}
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDate(new Date())}
            className="px-3 py-1 text-sm bg-green-3 text-dark-green-1 hover:bg-green-4 rounded"
          >
            Today
          </button>

          <div className="flex items-center">
            <button
              onClick={() => {
                const newDate = new Date(date);
                if (view === "month") {
                  newDate.setMonth(newDate.getMonth() - 1);
                } else if (view === "week") {
                  newDate.setDate(newDate.getDate() - 7);
                } else {
                  newDate.setDate(newDate.getDate() - 1);
                }
                setDate(newDate);
              }}
              className="px-2 py-1 text-dark-green-1"
            >
              ‹
            </button>
            <button
              onClick={() => {
                const newDate = new Date(date);
                if (view === "month") {
                  newDate.setMonth(newDate.getMonth() + 1);
                } else if (view === "week") {
                  newDate.setDate(newDate.getDate() + 7);
                } else {
                  newDate.setDate(newDate.getDate() + 1);
                }
                setDate(newDate);
              }}
              className="px-2 py-1 text-dark-green-1"
            >
              ›
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setView("day")}
              className={`px-3 py-1 rounded-md text-sm ${
                view === "day"
                  ? "bg-green-2 text-off-white"
                  : "bg-off-white border border-green-3 text-dark-green-1"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-3 py-1 rounded-md text-sm ${
                view === "week"
                  ? "bg-green-2 text-off-white"
                  : "bg-off-white border border-green-3 text-dark-green-1"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView("month")}
              className={`px-3 py-1 rounded-md text-sm ${
                view === "month"
                  ? "bg-green-2 text-off-white"
                  : "bg-off-white border border-green-3 text-dark-green-1"
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <Calendar
        localizer={localizer}
        events={initialEvents}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        defaultView="month"
        toolbar={false}
        onSelectEvent={setSelectedEvent}
        className="rbc-planwise"
      />

      {/* Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-off-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-dark-green-1">{selectedEvent.title}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-dark-green-1 text-xl"
              >
                ×
              </button>
            </div>
            <p className="mb-2">
              <strong>Start:</strong> {format(selectedEvent.start, "MMM d, yyyy h:mm a", { locale: enUS })}
            </p>
            <p className="mb-2">
              <strong>End:</strong> {format(selectedEvent.end, "MMM d, yyyy h:mm a", { locale: enUS })}
            </p>
            <p>
              <strong>Color:</strong> {selectedEvent.resource?.color || "default"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
