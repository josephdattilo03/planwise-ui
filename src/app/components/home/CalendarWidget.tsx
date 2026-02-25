"use client";

import { Box, Card, CardContent, Typography } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import { useRouter } from "next/navigation";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay, type PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { Event } from "../../types/event";
import { Task } from "../../types/task";
import { Board } from "../../types/board";

export type DayEvent = { title: string; color: string };

function buildEventsByDate(
  events: Event[],
  tasks: Task[],
  boards: Board[]
): Record<string, DayEvent[]> {
  const boardColors: Record<string, string> = {
    personal: "#9BF2FF",
    work: "#2196F3",
    pennos: "#FFA500",
    "senior-design": "#A7C957",
    school: "#9C27B0",
    other: "#E1BEE7",
  };
  const byDate: Record<string, DayEvent[]> = {};

  events.forEach((event) => {
    const d = new Date(event.startTime).toDateString();
    if (!byDate[d]) byDate[d] = [];
    const eventTitle = event.description.toLowerCase();
    let color = boardColors[event.board?.name?.toLowerCase() || "other"] ?? "#4CAF50";
    if (eventTitle.includes("team standup") || eventTitle.includes("standup meeting")) color = "#E1BEE7";
    if (eventTitle.includes("project milestone") || eventTitle.includes("milestone")) color = "#FFA500";
    byDate[d].push({ title: `📅 ${event.description}`, color });
  });

  tasks.forEach((task) => {
    const d = new Date(task.dueDate).toDateString();
    if (!byDate[d]) byDate[d] = [];
    const board = boards.find((b) => b.id === task.board?.id);
    const boardName = board?.name?.toLowerCase() || "default";
    const color = boardColors[boardName] ?? "#4CAF50";
    byDate[d].push({ title: `📋 ${task.name}`, color });
  });

  return byDate;
}

type WidgetDayProps = PickersDayProps & {
  eventsByDate?: Record<string, DayEvent[]>;
};

function WidgetDay(props: WidgetDayProps) {
  const { eventsByDate = {}, ...pickersDayProps } = props;
  const day = props.day;
  const dateKey = day && typeof (day as Date).toDateString === "function" ? (day as Date).toDateString() : "";
  const dayEvents = (eventsByDate[dateKey] ?? []).slice(0, 4);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        height: 36,
        width: "100%",
        minWidth: 0,
        p: 0.3,
        boxSizing: "border-box",
      }}
    >
      <PickersDay
        {...pickersDayProps}
        day={day}
        disableMargin
        sx={{
          margin: 0,
          width: 20,
          minWidth: 20,
          height: 20,
          minHeight: 20,
          flexShrink: 0,
          fontSize: "12px",
          borderRadius: "50%",
          "&.MuiPickersDay-today": {
            backgroundColor: "#2196F3",
            color: "white",
            fontWeight: 700,
            borderRadius: "50%",
          },
        }}
      />
      {dayEvents.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.25,
            justifyContent: "center",
            mt: 0.25,
            minWidth: 0,
          }}
        >
          {dayEvents.map((ev: DayEvent, i: number) => (
            <Box
              key={i}
              sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                backgroundColor: ev.color,
                flexShrink: 0,
              }}
              aria-label={ev.title}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

interface CalendarWidgetProps {
  events: Event[];
  tasks: Task[];
  boards: Board[];
}

export default function CalendarWidget({ events, tasks, boards }: CalendarWidgetProps) {
  const router = useRouter();
  const eventsByDate = buildEventsByDate(events, tasks, boards);
  const now = new Date();

  return (
    <Card
      sx={{
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--card-border)",
        backgroundColor: "var(--home-calendar-bg)",
        cursor: "pointer",
      }}
      elevation={0}
      onClick={() => router.push("/calendar")}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <EventIcon sx={{ color: "var(--green-2)", fontSize: 18 }} />
          <Typography
            variant="h6"
            sx={{
              color: "var(--dark-green-2)",
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            Calendar Preview
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: "var(--dark-green-2)",
            fontSize: "0.75rem",
            fontWeight: 600,
            mb: 1,
          }}
        >
          {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </Typography>

        <Box
          sx={{
            borderRadius: "var(--radius-md)",
            border: "1px solid rgba(0,0,0,0.08)",
            p: 0.5,
            backgroundColor: "var(--menu-bg)",
          }}
        >
          <DateCalendar
            value={now}
            referenceDate={now}
            readOnly
            showDaysOutsideCurrentMonth
            fixedWeekNumber={5}
            views={["day"]}
            slots={{ day: WidgetDay }}
            slotProps={{
              day: { eventsByDate } as Record<string, unknown>,
            }}
            sx={{
              width: "100%",
              "& .MuiPickersCalendarHeader-root": {
                display: "none",
              },
              "& .MuiDayCalendar-header": {
                marginBottom: 0.5,
                display: "flex",
                "& > *": {
                  flex: "1 1 0",
                  minWidth: 0,
                  maxWidth: "none",
                },
              },
              "& .MuiDayCalendar-weekDayLabel": {
                width: "auto",
                maxWidth: "none",
                margin: 0,
                flex: "1 1 0",
                minWidth: 0,
                fontSize: "10px",
                fontWeight: 700,
                color: "var(--dark-green-1)",
              },
              "& .MuiDayCalendar-weekContainer": {
                margin: 0,
                display: "flex",
                "& > *": {
                  flex: "1 1 0",
                  minWidth: 0,
                  maxWidth: "none",
                },
              },
              "& .MuiPickersDay-root": {
                margin: 0,
              },
              "& .MuiDayCalendar-monthContainer": {
                width: "100%",
              },
              "& .MuiPickersSlideTransition-root": {
                minHeight: 180,
              },
              height: "auto",
              minHeight: 0,
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
