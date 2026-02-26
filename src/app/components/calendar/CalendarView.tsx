"use client";

import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import FormButton from "@/src/common/button/FormButton";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { useState } from "react";
import { useFilters } from "../../providers/filters/useFilters";
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  createEvent,
  updateEvent,
  deleteEvent,
} from "../../services/events/eventService";
import { updateTask } from "../../services/tasks/taskService";
import { Event as AppEvent } from "../../types/event";
import { Task } from "../../types/task";

const locales = { "en-US": enUS };

// Cast to any to reconcile the local CalendarEvent type with rbc's generic object type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DnDCalendar = withDragAndDrop(Calendar) as any;

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

/** RBC display shape — separate from the domain Event/Task types */
export type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  resource?: {
    board?: string;
    color?: string;
    type?: "task" | "event";
    /** Original domain objects kept for service calls */
    event?: AppEvent;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    task?: any;
  };
};

interface CalendarViewProps {
  /** Fully-editable calendar events from eventService */
  calendarEvents?: CalendarEvent[];
  /** Read-only task events — shown but not draggable */
  taskEvents?: CalendarEvent[];
  /** Called after create/delete so the parent can re-fetch the full list */
  onEventsChanged?: () => void;
  /**
   * Called after a drop/resize with the already-persisted updated event.
   * The parent should do an in-place state update (no re-fetch) so the
   * calendar reflects the change immediately without any visible snap-back.
   */
  onEventUpdated?: (updated: AppEvent) => void;
  /** Same pattern for task drops — updates dueDate in-place, no re-fetch. */
  onTaskUpdated?: (updated: Task) => void;
}

export default function PlanwiseCalendar({
  calendarEvents = [],
  taskEvents = [],
  onEventsChanged,
  onEventUpdated,
  onTaskUpdated,
}: CalendarViewProps) {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);

  const { boards, selectedBoardIds } = useFilters();

  // ── Add-event form state ───────────────────────────────────────────────────

  const getInitialTime = () => {
    const now = new Date();
    const roundedMinutes = Math.round(now.getMinutes() / 15) * 15;
    now.setMinutes(roundedMinutes, 0, 0);
    return now;
  };

  const [newEvent, setNewEvent] = useState({
    title: "",
    start: getInitialTime(),
    end: new Date(getInitialTime().getTime() + 60 * 60 * 1000),
    board: "",
  });

  // ── Derived event list ────────────────────────────────────────────────────

  const allEvents: CalendarEvent[] = [...calendarEvents, ...taskEvents];

  const filteredEvents =
    selectedBoardIds.size === 0
      ? allEvents
      : allEvents.filter((event) => {
        if (!event.resource?.board) return false;
        const matchedBoard = boards.find(
          (b) => b.name.toLowerCase() === event.resource!.board
        );
        return matchedBoard ? selectedBoardIds.has(matchedBoard.id) : false;
      });

  console.log(filteredEvents)
  // ── Navigation label ──────────────────────────────────────────────────────

  const getCurrentLabel = () => {
    if (view === "month") return format(date, "MMMM yyyy");
    if (view === "week") {
      const start = startOfWeek(date, { weekStartsOn: 0 });
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${format(start, "MMM d", { locale: enUS })} – ${format(end, "MMM d, yyyy", { locale: enUS })}`;
    }
    return format(date, "MMMM d, yyyy", { locale: enUS });
  };

  // ── Mutations (all go through eventService) ───────────────────────────────

  const handleSaveEvent = async () => {
    if (!newEvent.title.trim()) return;
    const boardObj = boards.find(
      (b) => b.name.toLowerCase() === newEvent.board
    ) ?? boards[0];
    await createEvent(
      {
        description: newEvent.title,
        startTime: newEvent.start,
        endTime: newEvent.end,
        board: boardObj,
        isAllDay: false,
        eventColor: boardObj?.color ?? "#386641",
        calendarId: "default",
        location: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      boards
    );
    setShowAddEvent(false);
    onEventsChanged?.();
  };

  const handleDeleteEvent = async (eventToDelete: CalendarEvent) => {
    const source = eventToDelete.resource?.event;
    if (source) {
      await deleteEvent(source.id);
      onEventsChanged?.();
    }
    setSelectedEvent(null);
  };

  const handleEventDrop = async ({
    event,
    start,
    end,
  }: {
    event: object;
    start: Date | string;
    end: Date | string;
  }) => {
    const calEvent = event as CalendarEvent;
    const startDate = typeof start === "string" ? new Date(start) : start;
    const endDate = typeof end === "string" ? new Date(end) : end;

    if (calEvent.resource?.event) {
      const updated = { ...calEvent.resource.event, startTime: startDate, endTime: endDate };
      await updateEvent(updated, boards);
      onEventUpdated?.(updated);
    } else if (calEvent.resource?.task) {
      const updated: Task = { ...calEvent.resource.task, dueDate: startDate };
      updateTask(updated);
      onTaskUpdated?.(updated);
    }
  };

  const handleEventResize = async ({
    event,
    start,
    end,
  }: {
    event: object;
    start: Date | string;
    end: Date | string;
  }) => {
    const calEvent = event as CalendarEvent;
    const source = calEvent.resource?.event;
    if (!source) return;
    const startDate = typeof start === "string" ? new Date(start) : start;
    const endDate = typeof end === "string" ? new Date(end) : end;
    const updated = { ...source, startTime: startDate, endTime: endDate };
    await updateEvent(updated, boards);
    onEventUpdated?.(updated);
  };

  // ── Event style ───────────────────────────────────────────────────────────

  const eventStyleGetter = (event: CalendarEvent) => {
    const colorMap: Record<
      string,
      { backgroundColor: string; borderColor: string; color: string }
    > = {
      green: { backgroundColor: "#4CAF50", borderColor: "#45a049", color: "white" },
      blue: { backgroundColor: "#2196F3", borderColor: "#1976D2", color: "white" },
      orange: { backgroundColor: "#FF9800", borderColor: "#F57C00", color: "white" },
      purple: { backgroundColor: "#9C27B0", borderColor: "#7B1FA2", color: "white" },
      lilac: { backgroundColor: "#E1BEE7", borderColor: "#CE93D8", color: "#333" },
    };

    const color = event.resource?.color ?? "green";

    if (color.startsWith("#")) {
      return { style: { backgroundColor: color, borderColor: color, color: "black" } };
    }

    return { style: colorMap[color] ?? colorMap.green };
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Paper
      elevation={0}
      sx={{ width: "100%", maxHeight: "calc(100vh - 100px)", backgroundColor: "var(--background)" }}
    >
      {/* Toolbar */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ pt: "24px", pb: "8px", px: "24px" }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "var(--dark-green-1)",
            textTransform: "uppercase",
            fontSize: "var(--text-page-title-font-size)",
            fontWeight: 600,
          }}
        >
          {getCurrentLabel()}
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          {/* Prev / next */}
          <Box display="flex" alignItems="center">
            {(["prev", "next"] as const).map((dir) => (
              <Button
                key={dir}
                onClick={() => {
                  const d = new Date(date);
                  const delta = dir === "prev" ? -1 : 1;
                  if (view === "month") d.setMonth(d.getMonth() + delta);
                  else d.setDate(d.getDate() + (view === "week" ? 7 : 1) * delta);
                  setDate(d);
                }}
                variant="text"
                size="small"
                sx={{ minWidth: "auto", px: 1, py: 0.5, color: "var(--dark-green-1)", fontSize: "1rem" }}
              >
                {dir === "prev" ? "‹" : "›"}
              </Button>
            ))}
          </Box>

          {/* View switcher */}
          <Box display="flex" gap={1}>
            {(["day", "week", "month"] as View[]).map((v) => (
              <Button
                key={v}
                onClick={() => setView(v)}
                disableElevation
                className={`py-2 px-3 font-sans text-small-header rounded-md transition border border-beige text-foreground ${view === v ? "bg-beige" : "bg-surface-color"
                  }`}
                sx={{ textTransform: "none" }}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </Button>
            ))}
          </Box>

          {/* Add event */}
          <Button
            onClick={() => {
              setNewEvent({
                title: "",
                start: getInitialTime(),
                end: new Date(getInitialTime().getTime() + 60 * 60 * 1000),
                board: boards[0]?.name.toLowerCase() ?? "",
              });
              setShowAddEvent(true);
            }}
            className="flex items-center justify-center gap-1.5 py-2 font-sans rounded-md text-small-header bg-green-1 text-white hover:bg-green-2 transition"
          >
            <AddRoundedIcon className="w-4 h-4" />
            <span>Add Event</span>
          </Button>
        </Box>
      </Box>

      {/* Calendar */}
      <DnDCalendar
        localizer={localizer}
        events={filteredEvents}
        // draggableAccessor={(event: CalendarEvent) => event.resource?.type !== "task"}
        resizableAccessor={(event: CalendarEvent) => event.resource?.type !== "task"}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        defaultView="month"
        toolbar={false}
        onSelectEvent={setSelectedEvent}
        eventPropGetter={eventStyleGetter}
        className="rbc-planwise"
        style={{
          overflow: "scroll",
          padding: "8px 24px 0px 24px",
          height: "calc(100vh - 200px)",
        }}
      />

      {/* Event detail modal */}
      <Dialog open={!!selectedEvent} onClose={() => setSelectedEvent(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: "var(--dark-green-1)", textAlign: "center", fontWeight: 600 }}>
          {selectedEvent?.title}
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Start:</strong>{" "}
            {selectedEvent
              ? format(selectedEvent.start, "MMM d, yyyy h:mm a", { locale: enUS })
              : ""}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>End:</strong>{" "}
            {selectedEvent
              ? format(selectedEvent.end, "MMM d, yyyy h:mm a", { locale: enUS })
              : ""}
          </Typography>
          <Typography variant="body2">
            <strong>Board:</strong>{" "}
            {selectedEvent?.resource?.board
              ? selectedEvent.resource.board.charAt(0).toUpperCase() +
              selectedEvent.resource.board.slice(1)
              : "Default"}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2 }}>
          {/* Only show delete for editable calendar events */}
          {selectedEvent?.resource?.type === "event" && (
            <Button
              onClick={() => handleDeleteEvent(selectedEvent!)}
              variant="contained"
              sx={{
                backgroundColor: "#f44336",
                color: "white",
                "&:hover": { backgroundColor: "#d32f2f" },
              }}
            >
              Delete Event
            </Button>
          )}
          <Button
            onClick={() => setSelectedEvent(null)}
            variant="outlined"
            sx={{ color: "var(--dark-green-1)", borderColor: "var(--green-3)" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add event modal */}
      <Dialog open={showAddEvent} onClose={() => setShowAddEvent(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: "var(--dark-green-1)", textAlign: "start", fontWeight: 600 }}>
          Add Event
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Event Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
            <TextField
              fullWidth
              label="Start Date & Time"
              type="datetime-local"
              value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) =>
                setNewEvent((prev) => ({ ...prev, start: new Date(e.target.value) }))
              }
              InputProps={{ inputProps: { step: 900 } }}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="End Date & Time"
              type="datetime-local"
              value={format(newEvent.end, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) =>
                setNewEvent((prev) => ({ ...prev, end: new Date(e.target.value) }))
              }
              InputProps={{ inputProps: { step: "900" } }}
              InputLabelProps={{ shrink: true }}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Board</InputLabel>
              <Select
                value={newEvent.board}
                label="Board"
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, board: e.target.value }))
                }
              >
                {boards.map((board) => (
                  <MenuItem key={board.id} value={board.name.toLowerCase()}>
                    {board.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, paddingX: "24px" }}>
          <FormButton onClick={() => setShowAddEvent(false)} variant="clear" text="Cancel" />
          <FormButton onClick={handleSaveEvent} variant="confirm" text="Save Event" />
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
