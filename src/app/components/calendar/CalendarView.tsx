"use client";

import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import FormButton from "@/src/common/button/FormButton";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import GoogleIcon from "@mui/icons-material/Google";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  Tooltip,
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
import { getDataMode } from "../../services/dataMode";
import { Event as AppEvent } from "../../types/event";
import { Task } from "../../types/task";
import { useSession } from "next-auth/react";
import { googleCalendarBoardIdForUser } from "../../services/googleCalendarService";

type MockStoredEvent = {
  title?: string;
  start?: string;
  end?: string;
  color?: string;
};

/** Mock-only localStorage keys (mock mode does not call Google APIs) */
const MOCK_GCAL = {
  connectedKey: "planwise.googleCalendar.connected",
  eventsKey: "planwise.googleCalendar.events",
  calendarIdKey: "planwise.googleCalendar.calendarId",
  lastSyncedKey: "planwise.googleCalendar.lastSynced",
} as const;

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

/** RBC display shape - separate from the domain Event/Task types */
export type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  resource?: {
    board?: string;
    color?: string;
    type?: "task" | "event" | "google";
    /** Original domain objects kept for service calls */
    event?: AppEvent;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    task?: any;
  };
};

interface CalendarViewProps {
  /** Fully-editable calendar events from eventService */
  calendarEvents?: CalendarEvent[];
  /** Read-only task events - shown but not draggable */
  taskEvents?: CalendarEvent[];
  /** Called after create/delete so the parent can re-fetch the full list */
  onEventsChanged?: () => void;
  /**
   * Called after a drop/resize with the already-persisted updated event.
   * The parent should do an in-place state update (no re-fetch) so the
   * calendar reflects the change immediately without any visible snap-back.
   */
  onEventUpdated?: (updated: AppEvent) => void;
  /** Same pattern for task drops - updates dueDate in-place, no re-fetch. */
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
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showGoogleDialog, setShowGoogleDialog] = useState(false);
  const [mockGoogleConnected, setMockGoogleConnected] = useState(false);
  const [mockGoogleEvents, setMockGoogleEvents] = useState<CalendarEvent[]>([]);
  const [mockGoogleLoading, setMockGoogleLoading] = useState(false);
  const [mockGoogleError, setMockGoogleError] = useState<string | null>(null);
  const [mockGoogleLastSynced, setMockGoogleLastSynced] =
    useState<Date | null>(null);
  const [selectedGoogleCalendarId, setSelectedGoogleCalendarId] =
    useState("primary");

  const { boards, selectedBoardIds, selectedTagIds } = useFilters();
  const { data: session } = useSession();
  const userId = session?.user?.email ?? undefined;
  const googleBoardId = userId ? googleCalendarBoardIdForUser(userId) : undefined;
  const isMock = getDataMode() === "mock";
  // Add-event form state

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

  const googleCalendars = useMemo(
    () => [{ id: "primary", name: "Primary" }],
    [],
  );

  const buildMockGoogleEvents = useMemo(
    () =>
      (baseDate: Date, calendarId: string): CalendarEvent[] => {
        const calendarName =
          googleCalendars.find((cal) => cal.id === calendarId)?.name ??
          "Primary";
        const start = startOfWeek(baseDate, { weekStartsOn: 0 });
        const eventAStart = new Date(start);
        eventAStart.setDate(start.getDate() + 2);
        eventAStart.setHours(10, 0, 0, 0);
        const eventAEnd = new Date(eventAStart);
        eventAEnd.setHours(11, 0, 0, 0);

        const eventBStart = new Date(start);
        eventBStart.setDate(start.getDate() + 4);
        eventBStart.setHours(15, 30, 0, 0);
        const eventBEnd = new Date(eventBStart);
        eventBEnd.setHours(16, 30, 0, 0);

        return [
          {
            title: `Google Calendar (${calendarName}): Focus Block`,
            start: eventAStart,
            end: eventAEnd,
            resource: { type: "google", color: "google" },
          },
          {
            title: `Google Calendar (${calendarName}): 1:1`,
            start: eventBStart,
            end: eventBEnd,
            resource: { type: "google", color: "googleAlt" },
          },
        ];
      },
    [googleCalendars],
  );

  const mapStoredGoogleEvents = useCallback(
    (rawEvents: MockStoredEvent[]): CalendarEvent[] => {
      const colorMap: Record<string, string> = {
        "1": "google",
        "2": "googleAlt",
        "3": "google",
        "4": "googleAlt",
        "5": "google",
        "6": "googleAlt",
        "7": "google",
        "8": "googleAlt",
        "9": "google",
        "10": "googleAlt",
        "11": "google",
      };

      return rawEvents.map((event) => ({
        title: event.title ?? "Google Calendar Event",
        start: new Date(event.start ?? 0),
        end: new Date(event.end ?? 0),
        resource: {
          type: "google",
          color: colorMap[String(event.color ?? "")] ?? "google",
        },
      }));
    },
    [],
  );

  useEffect(() => {
    if (!isMock || typeof window === "undefined") return;
    const storedConnected =
      localStorage.getItem(MOCK_GCAL.connectedKey) === "true";
    const storedCalendarId = localStorage.getItem(MOCK_GCAL.calendarIdKey);
    const storedLastSynced = localStorage.getItem(MOCK_GCAL.lastSyncedKey);
    if (storedCalendarId) {
      setSelectedGoogleCalendarId(storedCalendarId);
    }
    if (storedLastSynced) {
      const parsedDate = new Date(storedLastSynced);
      if (!Number.isNaN(parsedDate.getTime())) {
        setMockGoogleLastSynced(parsedDate);
      }
    }
    if (storedConnected) {
      setMockGoogleConnected(true);
      const storedEvents = localStorage.getItem(MOCK_GCAL.eventsKey);
      if (storedEvents) {
        try {
          const parsed = JSON.parse(storedEvents) as MockStoredEvent[];
          setMockGoogleEvents(mapStoredGoogleEvents(parsed));
          return;
        } catch {
          /* fall through */
        }
      }
      setMockGoogleEvents(
        buildMockGoogleEvents(new Date(), storedCalendarId ?? "primary"),
      );
    }
  }, [buildMockGoogleEvents, isMock, mapStoredGoogleEvents]);

  const handleMockConnectGoogle = async () => {
    if (!userId) {
      setMockGoogleError("Please sign in to use the mock calendar.");
      return;
    }
    setMockGoogleLoading(true);
    setMockGoogleError(null);
    try {
      localStorage.setItem(MOCK_GCAL.calendarIdKey, selectedGoogleCalendarId);
      await new Promise((resolve) => setTimeout(resolve, 600));
      const mockEvents = buildMockGoogleEvents(date, selectedGoogleCalendarId);
      const now = new Date();
      setMockGoogleConnected(true);
      setMockGoogleEvents(mockEvents);
      setMockGoogleLastSynced(now);
      localStorage.setItem(MOCK_GCAL.connectedKey, "true");
      localStorage.setItem(MOCK_GCAL.eventsKey, JSON.stringify(mockEvents));
      localStorage.setItem(MOCK_GCAL.lastSyncedKey, now.toISOString());
      setShowGoogleDialog(false);
    } catch {
      setMockGoogleError("Mock connect failed.");
    } finally {
      setMockGoogleLoading(false);
    }
  };

  const handleMockSyncGoogle = async () => {
    if (!userId) {
      setMockGoogleError("Please sign in.");
      return;
    }
    setMockGoogleLoading(true);
    setMockGoogleError(null);
    try {
      localStorage.setItem(MOCK_GCAL.calendarIdKey, selectedGoogleCalendarId);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockEvents = buildMockGoogleEvents(date, selectedGoogleCalendarId);
      const now = new Date();
      setMockGoogleEvents(mockEvents);
      setMockGoogleLastSynced(now);
      localStorage.setItem(MOCK_GCAL.eventsKey, JSON.stringify(mockEvents));
      localStorage.setItem(MOCK_GCAL.lastSyncedKey, now.toISOString());
    } catch {
      setMockGoogleError("Mock sync failed.");
    } finally {
      setMockGoogleLoading(false);
    }
  };
  // Derived event list

  const allEvents: CalendarEvent[] = [
    ...calendarEvents,
    ...taskEvents,
    ...(isMock ? mockGoogleEvents : []),
  ];

  const filteredEvents = useMemo(() => {
    const noBoardFilter = selectedBoardIds.size === 0;
    const noTagFilter = selectedTagIds.size === 0;
    if (noBoardFilter && noTagFilter) {
      return allEvents;
    }

    return allEvents.filter((ev) => {
      if (!noBoardFilter) {
        if (ev.resource?.type === "google") {
          if (!googleBoardId || !selectedBoardIds.has(googleBoardId)) {
            return false;
          }
        } else if (ev.resource?.type === "event" && ev.resource.event?.board?.id) {
          if (!selectedBoardIds.has(ev.resource.event.board.id)) return false;
        } else if (ev.resource?.type === "task" && ev.resource.task?.board?.id) {
          if (!selectedBoardIds.has(ev.resource.task.board.id)) return false;
        } else if (ev.resource?.board) {
          const matchedBoard = boards.find(
            (b) => b.name.toLowerCase() === ev.resource!.board,
          );
          if (!matchedBoard || !selectedBoardIds.has(matchedBoard.id)) return false;
        } else {
          return false;
        }
      }

      if (!noTagFilter) {
        if (ev.resource?.type === "task" && ev.resource.task) {
          const hasSelectedTag = ev.resource.task.tags.some((tag) =>
            selectedTagIds.has(tag.id),
          );
          if (!hasSelectedTag) return false;
        }
      }

      return true;
    });
  }, [
    allEvents,
    boards,
    googleBoardId,
    selectedBoardIds,
    selectedTagIds,
  ]);
  // Navigation label

  const getCurrentLabel = () => {
    if (view === "month") return format(date, "MMMM yyyy");
    if (view === "week") {
      const start = startOfWeek(date, { weekStartsOn: 0 });
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${format(start, "MMM d", { locale: enUS })} - ${format(end, "MMM d, yyyy", { locale: enUS })}`;
    }
    return format(date, "MMMM d, yyyy", { locale: enUS });
  };
  // Mutations (all go through eventService)

  const handleSaveEvent = async () => {
    if (!newEvent.title.trim()) return;
    const boardObj =
      boards.find((b) => b.name.toLowerCase() === newEvent.board) ?? boards[0];
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
      boards,
    );
    setShowAddEvent(false);
    onEventsChanged?.();
  };

  const handleDeleteEvent = async (eventToDelete: CalendarEvent) => {
    const source = eventToDelete.resource?.event;
    if (source) {
      await deleteEvent(source.board.id, source.id);
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
      const updated = {
        ...calEvent.resource.event,
        startTime: startDate,
        endTime: endDate,
      };
      const persisted = await updateEvent(updated, boards);
      onEventUpdated?.(persisted);
    } else if (calEvent.resource?.task) {
      const updated: Task = { ...calEvent.resource.task, dueDate: startDate };
      if (!userId) return;
      const persisted = await updateTask(updated, userId);
      onTaskUpdated?.(persisted);
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
    const persisted = await updateEvent(updated, boards);
    onEventUpdated?.(persisted);
  };
  // Event style

  const eventStyleGetter = (event: CalendarEvent) => {
    const colorMap: Record<
      string,
      { backgroundColor: string; borderColor: string; color: string }
    > = {
      green: {
        backgroundColor: "#4CAF50",
        borderColor: "#45a049",
        color: "white",
      },
      blue: {
        backgroundColor: "#2196F3",
        borderColor: "#1976D2",
        color: "white",
      },
      orange: {
        backgroundColor: "#FF9800",
        borderColor: "#F57C00",
        color: "white",
      },
      purple: {
        backgroundColor: "#9C27B0",
        borderColor: "#7B1FA2",
        color: "white",
      },
      lilac: {
        backgroundColor: "#E1BEE7",
        borderColor: "#CE93D8",
        color: "#333",
      },
      google: {
        backgroundColor: "#4285F4",
        borderColor: "#3367D6",
        color: "white",
      },
      googleAlt: {
        backgroundColor: "#0F9D58",
        borderColor: "#0B8043",
        color: "white",
      },
    };

    const color = event.resource?.color ?? "green";

    if (color.startsWith("#")) {
      return {
        style: { backgroundColor: color, borderColor: color, color: "black" },
      };
    }

    return { style: colorMap[color] ?? colorMap.green };
  };
  // Render

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxHeight: "calc(100vh - 100px)",
        backgroundColor: "var(--background)",
      }}
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
          {/* Prev / next + Google Calendar */}
          <Box display="flex" alignItems="center" gap={1}>
            <Box display="flex" alignItems="center">
              {(["prev", "next"] as const).map((dir) => (
                <Button
                  key={dir}
                  onClick={() => {
                    const d = new Date(date);
                    const delta = dir === "prev" ? -1 : 1;
                    if (view === "month") d.setMonth(d.getMonth() + delta);
                    else
                      d.setDate(
                        d.getDate() + (view === "week" ? 7 : 1) * delta,
                      );
                    setDate(d);
                  }}
                  variant="text"
                  size="small"
                  sx={{
                    minWidth: "auto",
                    px: 1,
                    py: 0.5,
                    color: "var(--dark-green-1)",
                    fontSize: "1rem",
                  }}
                >
                  {dir === "prev" ? "<" : ">"}
                </Button>
              ))}
            </Box>

            {isMock ? (
              <>
                <Tooltip
                  title={
                    mockGoogleConnected
                      ? "Mock Google Calendar"
                      : "Mock: connect sample Google events"
                  }
                >
                  <Button
                    onClick={() => setShowGoogleDialog(true)}
                    size="small"
                    startIcon={<GoogleIcon />}
                    className="py-2 px-3 font-sans text-small-header rounded-md transition border border-beige text-foreground bg-surface-color hover:bg-beige"
                    sx={{ textTransform: "none" }}
                  >
                    <span className="hidden sm:inline">
                      {mockGoogleConnected ? "Mock Google" : "Mock Google"}
                    </span>
                    <span className="sm:hidden">Google</span>
                  </Button>
                </Tooltip>
                {mockGoogleConnected && mockGoogleLastSynced && (
                  <Typography
                    variant="caption"
                    sx={{ color: "var(--text-muted)", ml: 1 }}
                  >
                    Mock synced {format(mockGoogleLastSynced, "MMM d, h:mm a")}
                  </Typography>
                )}
              </>
            ) : (
              <Typography
                variant="caption"
                sx={{ color: "var(--text-muted)", maxWidth: 320 }}
              >
                {session?.googleCalendarConnected
                  ? "Google Calendar syncs when you sign in."
                  : "Sign in with Google (calendar scope) to import events."}
              </Typography>
            )}
          </Box>

          {/* View switcher */}
          <Box display="flex" gap={1}>
            {(["day", "week", "month"] as View[]).map((v) => (
              <Button
                key={v}
                onClick={() => setView(v)}
                disableElevation
                className={`py-2 px-3 font-sans text-small-header rounded-md transition border border-beige text-foreground ${
                  view === v ? "bg-beige" : "bg-surface-color"
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
        draggableAccessor={(event: CalendarEvent) =>
          event.resource?.type !== "google"
        }
        resizableAccessor={(event: CalendarEvent) =>
          event.resource?.type !== "task" && event.resource?.type !== "google"
        }
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
      <Dialog
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            color: "var(--dark-green-1)",
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          {selectedEvent?.title}
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Start:</strong>{" "}
            {selectedEvent
              ? format(selectedEvent.start, "MMM d, yyyy h:mm a", {
                  locale: enUS,
                })
              : ""}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>End:</strong>{" "}
            {selectedEvent
              ? format(selectedEvent.end, "MMM d, yyyy h:mm a", {
                  locale: enUS,
                })
              : ""}
          </Typography>
          <Typography variant="body2">
            <strong>Board:</strong>{" "}
            {selectedEvent?.resource?.board
              ? selectedEvent.resource.board.charAt(0).toUpperCase() +
                selectedEvent.resource.board.slice(1)
              : "Default"}
          </Typography>
          {selectedEvent?.resource?.type === "google" && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Source:</strong> Google Calendar
            </Typography>
          )}
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

      {/* Mock-only: sample Google overlay (no real API calls) */}
      <Dialog
        open={isMock && showGoogleDialog}
        onClose={() => setShowGoogleDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            color: "var(--dark-green-1)",
            textAlign: "start",
            fontWeight: 600,
          }}
        >
          Mock Google Calendar
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
        >
          <Typography variant="body2">
            Demo overlay only — backend mode syncs real Google events on sign-in.
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Calendar</InputLabel>
            <Select
              value={selectedGoogleCalendarId}
              label="Calendar"
              onChange={(e) => {
                const nextId = e.target.value;
                setSelectedGoogleCalendarId(nextId);
                if (mockGoogleConnected) {
                  localStorage.setItem(MOCK_GCAL.calendarIdKey, nextId);
                }
              }}
              disabled={mockGoogleLoading}
            >
              {googleCalendars.map((calendar) => (
                <MenuItem key={calendar.id} value={calendar.id}>
                  {calendar.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {mockGoogleLastSynced && (
            <Typography variant="caption" color="text.secondary">
              Last mock sync: {format(mockGoogleLastSynced, "MMM d, h:mm a")}
            </Typography>
          )}
          {mockGoogleError && (
            <Typography variant="body2" color="error">
              {mockGoogleError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{ justifyContent: "space-between", px: "24px", pb: "16px" }}
        >
          {mockGoogleConnected ? (
            <Button
              onClick={handleMockSyncGoogle}
              variant="contained"
              disabled={mockGoogleLoading}
              sx={{
                backgroundColor: "var(--green-2)",
                "&:hover": { backgroundColor: "var(--green-1)" },
              }}
            >
              {mockGoogleLoading ? "Syncing..." : "Sync mock"}
            </Button>
          ) : (
            <Button
              onClick={handleMockConnectGoogle}
              variant="contained"
              startIcon={<GoogleIcon />}
              disabled={mockGoogleLoading}
              sx={{
                backgroundColor: "#4285F4",
                "&:hover": { backgroundColor: "#3367D6" },
              }}
            >
              {mockGoogleLoading ? "Connecting..." : "Connect (mock)"}
            </Button>
          )}
          <Button
            onClick={() => setShowGoogleDialog(false)}
            variant="text"
            sx={{ color: "var(--dark-green-1)" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add event modal */}
      <Dialog
        open={showAddEvent}
        onClose={() => setShowAddEvent(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            color: "var(--dark-green-1)",
            textAlign: "start",
            fontWeight: 600,
          }}
        >
          Add Event
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              fullWidth
              label="Event Title"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
            <TextField
              fullWidth
              label="Start Date & Time"
              type="datetime-local"
              value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) =>
                setNewEvent((prev) => ({
                  ...prev,
                  start: new Date(e.target.value),
                }))
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
                setNewEvent((prev) => ({
                  ...prev,
                  end: new Date(e.target.value),
                }))
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
        <DialogActions
          sx={{ justifyContent: "center", gap: 2, paddingX: "24px" }}
        >
          <FormButton
            onClick={() => setShowAddEvent(false)}
            variant="clear"
            text="Cancel"
          />
          <FormButton
            onClick={handleSaveEvent}
            variant="confirm"
            text="Save Event"
          />
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
