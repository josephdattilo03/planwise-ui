"use client";

import { Calendar, dateFnsLocalizer, View, EventProps } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Button,
  Paper,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

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
    <Paper
      elevation={3}
      sx={{
        width: '100%',
        maxHeight: 'calc(100vh - 200px)',
        backgroundColor: 'var(--off-white)',
        border: '1px solid var(--green-3)',
        borderRadius: '16px',
        p: 6,
        overflowY: 'auto',
      }}
    >
      {/* Top toolbar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography
          variant="h6"
          sx={{
            color: 'var(--dark-green-1)',
            textTransform: 'uppercase',
            fontSize: '1.25rem',
            fontWeight: 600,
          }}
        >
          {getCurrentLabel()}
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <Button
            onClick={() => setDate(new Date())}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: 'var(--green-3)',
              color: 'var(--dark-green-1)',
              '&:hover': {
                backgroundColor: 'var(--green-4)',
              },
            }}
          >
            Today
          </Button>

          <Box display="flex" alignItems="center">
            <Button
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
              variant="text"
              size="small"
              sx={{
                minWidth: 'auto',
                px: 1,
                py: 0.5,
                color: 'var(--dark-green-1)',
              }}
            >
              ‹
            </Button>
            <Button
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
              variant="text"
              size="small"
              sx={{
                minWidth: 'auto',
                px: 1,
                py: 0.5,
                color: 'var(--dark-green-1)',
              }}
            >
              ›
            </Button>
          </Box>

          <Box display="flex" gap={1}>
            <Button
              onClick={() => setView("day")}
              variant={view === "day" ? "contained" : "outlined"}
              size="small"
              sx={{
                backgroundColor: view === "day" ? 'var(--green-2)' : 'var(--off-white)',
                color: view === "day" ? 'var(--off-white)' : 'var(--dark-green-1)',
                borderColor: 'var(--green-3)',
              }}
            >
              Day
            </Button>
            <Button
              onClick={() => setView("week")}
              variant={view === "week" ? "contained" : "outlined"}
              size="small"
              sx={{
                backgroundColor: view === "week" ? 'var(--green-2)' : 'var(--off-white)',
                color: view === "week" ? 'var(--off-white)' : 'var(--dark-green-1)',
                borderColor: 'var(--green-3)',
              }}
            >
              Week
            </Button>
            <Button
              onClick={() => setView("month")}
              variant={view === "month" ? "contained" : "outlined"}
              size="small"
              sx={{
                backgroundColor: view === "month" ? 'var(--green-2)' : 'var(--off-white)',
                color: view === "month" ? 'var(--off-white)' : 'var(--dark-green-1)',
                borderColor: 'var(--green-3)',
              }}
            >
              Month
            </Button>
          </Box>
        </Box>
      </Box>

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
        style={{
          height: view === 'week' ? 'calc(100vh - 200px)' : view === 'month' ? 'calc(100vh - 200px)' : view === 'day' ? 'calc(100vh - 300px)' : 'auto',
        }}
      />

      {/* Event Modal */}
      <Dialog
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            color: 'var(--dark-green-1)',
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          {selectedEvent?.title}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Start:</strong> {selectedEvent ? format(selectedEvent.start, "MMM d, yyyy h:mm a", { locale: enUS }) : ''}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>End:</strong> {selectedEvent ? format(selectedEvent.end, "MMM d, yyyy h:mm a", { locale: enUS }) : ''}
          </Typography>
          <Typography variant="body2">
            <strong>Color:</strong> {selectedEvent?.resource?.color || "default"}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={() => setSelectedEvent(null)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
