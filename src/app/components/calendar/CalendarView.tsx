"use client";

import { Calendar, dateFnsLocalizer, View, EventProps } from "react-big-calendar";
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
    board?: "personal" | "work" | "senior-design" | "school" | "other" | string;
    color?: "green" | "blue" | "orange" | "purple" | "lilac" | string; // Allow hex colors too
    type?: "task" | "event";
    task?: any; // For task events
  };
};

interface CalendarViewProps {
  taskEvents?: Event[];
}

const boardColors: Record<string, "green" | "blue" | "orange" | "purple" | "lilac" | string> = {
  "personal": "#9BF2FF", // Use actual Personal board color (sky blue)
  "work": "blue",
  "pennos": "#FFA500", // PennOS orange
  "senior-design": "#A7C957", // Senior Design yellow/green
  "school": "purple",
  "other": "lilac",
};

const initialEvents: Event[] = [
  {
    title: "Daily Standup",
    start: new Date(new Date().setHours(8, 0, 0, 0)),
    end: new Date(new Date().setHours(8, 30, 0, 0)),
    resource: { board: "personal", color: boardColors["personal"] },
  },
  {
    title: "Team Meeting",
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 0, 0, 0)),
    resource: { board: "pennos", color: boardColors["pennos"] },
  },
  {
    title: "Lunch Break",
    start: new Date(new Date().setHours(12, 0, 0, 0)),
    end: new Date(new Date().setHours(13, 0, 0, 0)),
    resource: { board: "personal", color: boardColors["personal"] },
  },
  {
    title: "Project Review",
    start: new Date(new Date().setDate(new Date().getDate() + 1)),
    end: new Date(new Date().setDate(new Date().getDate() + 1)),
    resource: { board: "senior-design", color: boardColors["senior-design"] },
  },
  {
    title: "Client Call",
    start: new Date(new Date().setDate(new Date().getDate() + 2)),
    end: new Date(new Date().setDate(new Date().getDate() + 2)),
    resource: { board: "personal", color: boardColors["personal"] },
  },
  {
    title: "Weekly Review",
    start: new Date(new Date().setDate(new Date().getDate() + 3)),
    end: new Date(new Date().setDate(new Date().getDate() + 3)),
    resource: { board: "pennos", color: boardColors["pennos"] },
  },
  {
    title: "Weekend Planning",
    start: new Date(new Date().setDate(new Date().getDate() + 4)),
    end: new Date(new Date().setDate(new Date().getDate() + 4)),
    resource: { board: "other", color: "lilac" },
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
      className={`rounded-sm px-2 py-1 text-xs font-medium border border-green-4 ${colorClass}`}
    >
      {event.title}
    </div>
  );
}

export default function PlanwiseCalendar({ taskEvents = [] }: CalendarViewProps) {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [showAddEvent, setShowAddEvent] = useState(false);

  // Get boards and selected board IDs from filter context
  const { boards, selectedBoardIds } = useFilters();

  // Initialize times to be on 15-minute intervals
  const getInitialTime = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.round(minutes / 15) * 15;
    now.setMinutes(roundedMinutes);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now;
  };

  const [newEvent, setNewEvent] = useState({
    title: '',
    start: getInitialTime(),
    end: new Date(getInitialTime().getTime() + (60 * 60 * 1000)), // 1 hour later
    board: 'personal' as const,
  });

  // Merge all events (both manually added events and tasks)
  const allEvents = [...events, ...taskEvents];

  // Filter events based on selected boards
  const filteredEvents = selectedBoardIds.size === 0
    ? allEvents // Show all events if no boards are selected
    : allEvents.filter(event => {
      if (!event.resource?.board) return false;

      // Find the board with matching name and check if it's selected
      const matchedBoard = boards.find(board => board.name.toLowerCase() === event.resource!.board);
      return matchedBoard ? selectedBoardIds.has(parseInt(matchedBoard.id)) : false;
    });

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

  const handleSaveEvent = () => {
    if (newEvent.title.trim()) {
      const board = boards.find(b => b.name.toLowerCase() === newEvent.board);
      const color = board?.color || boardColors[newEvent.board];
      const event: Event = {
        title: newEvent.title,
        start: newEvent.start,
        end: newEvent.end,
        resource: { board: newEvent.board, color },
      };
      setEvents(prev => [...prev, event]);
      setShowAddEvent(false);
    }
  };

  const handleDeleteEvent = (eventToDelete: Event) => {
    setEvents(prev => prev.filter(event =>
      !(event.title === eventToDelete.title &&
        event.start.getTime() === eventToDelete.start.getTime() &&
        event.end.getTime() === eventToDelete.end.getTime())
    ));
    setSelectedEvent(null);
  };

  const eventStyleGetter = (event: Event) => {
    const colorMap: Record<string, { backgroundColor: string; borderColor: string; color: string }> = {
      green: { backgroundColor: '#4CAF50', borderColor: '#45a049', color: 'white' },
      blue: { backgroundColor: '#2196F3', borderColor: '#1976D2', color: 'white' },
      orange: { backgroundColor: '#FF9800', borderColor: '#F57C00', color: 'white' },
      purple: { backgroundColor: '#9C27B0', borderColor: '#7B1FA2', color: 'white' },
      lilac: { backgroundColor: '#E1BEE7', borderColor: '#CE93D8', color: '#333' },
    };

    const color = event.resource?.color || 'green';

    if (color.startsWith('#')) {
      return {
        style: {
          backgroundColor: color,
          borderColor: color,
          color: 'black',
        },
      };
    }

    return {
      style: colorMap[color] || colorMap.green,
    };
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxHeight: 'calc(100vh - 100px)',
        // overflowY: 'auto',
      }}
    >
      {/* Top toolbar */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ pt: "24px", pb: "8px", px: "24px" }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'var(--Dark-Green-1)',
            textTransform: 'uppercase',
            fontSize: 'var(--text-page-title-font-size)',
            fontWeight: 600,
          }}
        >
          {getCurrentLabel()}
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
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
                color: 'var(--Dark-Green-1)',
                fontSize: '1rem',
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
                color: 'var(--Dark-Green-1)',
                fontSize: '1rem',
              }}
            >
              ›
            </Button>
          </Box>

          <Box display="flex" gap={1}>
            <Button
              onClick={() => setView("day")}
              disableElevation
              className={`py-2 px-3 font-sans text-small-header rounded-md transition border border-beige ${view === "day"
                ? "bg-pastel-orange text-black hover:bg-orange"
                : "border border-beige text-dark-green-1 bg-off-white hover:bg-beige"
                }`}
              sx={{ textTransform: "none" }}
            >
              Day
            </Button>
            <Button
              onClick={() => setView("week")}
              disableElevation
              className={`py-2 px-3 font-sans text-small-header rounded-md transition border border-beige  ${view === "week"
                ? "bg-pastel-orange text-black hover:bg-orange"
                : "border border-beige text-dark-green-1 bg-off-white hover:bg-beige"
                }`}
              sx={{ textTransform: "none" }}
            >
              Week
            </Button>
            <Button
              onClick={() => setView("month")}
              disableElevation
              className={`py-2 px-3 font-sans text-small-header rounded-md transition border border-beige  ${view === "month"
                ? "bg-pastel-orange text-black hover:bg-orange"
                : "text-dark-green-1 bg-off-white hover:bg-beige"
                }`}
              sx={{ textTransform: "none" }}
            >
              Month
            </Button>
          </Box>

          <Button
            onClick={() => {
              setNewEvent({
                title: '',
                start: new Date(),
                end: new Date(),
                board: 'personal',
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
      <Calendar
        localizer={localizer}
        events={filteredEvents}
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

          height: view === 'week' ? 'calc(100vh - 200px)' : view === 'month' ? 'calc(100vh - 200px)' : view === 'day' ? 'calc(100vh - 200px)' : 'auto',
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
            color: 'var(--Dark-Green-1)',
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
            <strong>Board:</strong> {selectedEvent?.resource?.board ?
              selectedEvent.resource.board.charAt(0).toUpperCase() + selectedEvent.resource.board.slice(1) :
              "Default"}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
          <Button
            onClick={() => handleDeleteEvent(selectedEvent!)}
            variant="contained"
            sx={{
              backgroundColor: '#f44336',
              color: 'white',
              '&:hover': {
                backgroundColor: '#d32f2f',
              },
            }}
          >
            Delete Event
          </Button>
          <Button
            onClick={() => setSelectedEvent(null)}
            variant="outlined"
            sx={{ color: 'var(--Dark-Green-1)', borderColor: 'var(--Green-3)' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Event Modal */}
      <Dialog
        open={showAddEvent}
        onClose={() => setShowAddEvent(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            color: 'var(--Dark-Green-1)',
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          Add Event
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Event Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <TextField
              fullWidth
              label="Start Date & Time"
              type="datetime-local"
              value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => setNewEvent(prev => ({ ...prev, start: new Date(e.target.value) }))}
              InputProps={{
                inputProps: { step: 900 }
              }}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="End Date & Time"
              type="datetime-local"
              value={format(newEvent.end, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => setNewEvent(prev => ({ ...prev, end: new Date(e.target.value) }))}
              InputProps={{
                inputProps: { step: "900" }
              }}
              InputLabelProps={{ shrink: true }}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Board</InputLabel>
              <Select
                value={newEvent.board}
                label="Board"
                onChange={(e) => setNewEvent(prev => ({ ...prev, board: e.target.value as typeof prev.board }))}
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
        <DialogActions sx={{ justifyContent: 'center', gap: 2, paddingX: "24px" }}>
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
