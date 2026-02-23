import { Box, Card, CardContent, Typography } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import { useRouter } from "next/navigation";
import { Event } from "../../types/event";
import { Task } from "../../types/task";
import { Board } from "../../types/board";

interface CalendarWidgetProps {
  events: Event[];
  tasks: Task[];
  boards: Board[];
}

export default function CalendarWidget({ events, tasks, boards }: CalendarWidgetProps) {
  const router = useRouter();

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
          <EventIcon sx={{ color: "var(--Green-2)", fontSize: 18 }} />
          <Typography
            variant="h6"
            sx={{
              color: "var(--Dark-Green-2)",
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
            color: "var(--Dark-Green-2)",
            fontSize: "0.75rem",
            fontWeight: 600,
            mb: 1,
          }}
        >
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Typography>

        <Box
          sx={{
            borderRadius: "var(--radius-md)",
            border: "1px solid rgba(0,0,0,0.08)",
            p: 0.5,
            backgroundColor: "var(--menu-bg)",
          }}
        >
          {/* Weekdays */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              mb: 0.5,
            }}
          >
            {["S", "M", "T", "W", "T", "F", "S"].map((d, index) => (
              <Typography
                key={`${d}-${index}`}
                variant="caption"
                sx={{
                  textAlign: "center",
                  fontWeight: 700,
                  color: "var(--Dark-Green-1)",
                  fontSize: "10px",
                }}
              >
                {d}
              </Typography>
            ))}
          </Box>

          {/* Calendar days grid with real events */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 0.25,
            }}
          >
            {(() => {
              const now = new Date();
              const currentMonth = now.getMonth();
              const currentYear = now.getFullYear();

              const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
              const startDayOfWeek = firstDayOfMonth.getDay();
              const startDate = new Date(firstDayOfMonth);
              startDate.setDate(1 - startDayOfWeek);

              return Array.from({ length: 35 }).map((_, i) => {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + i);

                const day = currentDate.getDate();
                const month = currentDate.getMonth();
                const year = currentDate.getFullYear();

                const isCurrentMonth = month === currentMonth && year === currentYear;
                const isToday = currentDate.toDateString() === now.toDateString();

                const dayEvents = [
                  ...events
                    .filter(event => {
                      const eventDate = new Date(event.startTime);
                      return eventDate.toDateString() === currentDate.toDateString();
                    })
                    .map(event => {
                      const eventTitle = event.description.toLowerCase();
                      if (eventTitle.includes('team standup') || eventTitle.includes('standup meeting')) {
                        return { title: `📅 ${event.description}`, color: "#E1BEE7", type: "event" };
                      }
                      if (eventTitle.includes('project milestone') || eventTitle.includes('milestone')) {
                        return { title: `📅 ${event.description}`, color: "#FFA500", type: "event" };
                      }
                      const boardName = event.board.name.toLowerCase();
                      const boardColors: Record<string, string> = {
                        "personal": "#9BF2FF", "work": "#2196F3", "pennos": "#FFA500",
                        "senior-design": "#A7C957", "school": "#9C27B0", "other": "#E1BEE7",
                      };
                      const eventColor = boardColors[boardName] || "#4CAF50";
                      return { title: `📅 ${event.description}`, color: eventColor, type: "event" };
                    }),
                  ...tasks
                    .filter(task => {
                      const taskDate = new Date(task.dueDate);
                      return taskDate.toDateString() === currentDate.toDateString();
                    })
                    .slice(0, 1)
                    .map(task => {
                      const board = boards.find(b => b.id === task.board.id);
                      const boardName = board?.name.toLowerCase() || 'default';
                      const boardColors: Record<string, string> = {
                        "personal": "#9BF2FF", "work": "#2196F3", "pennos": "#FFA500",
                        "senior-design": "#A7C957", "school": "#9C27B0", "other": "#E1BEE7",
                      };
                      const taskColor = boardColors[boardName] || "#4CAF50";
                      return { title: `📋 ${task.name}`, color: taskColor, type: "task" };
                    })
                ].slice(0, 1);

                return (
                  <Box
                    key={i}
                    sx={{
                      height: 36,
                      width: "100%",
                      borderRadius: "var(--radius-sm)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      p: 0.3,
                      border: "1px solid var(--card-border)",
                      backgroundColor: isCurrentMonth ? "var(--input-bg)" : "var(--menu-bg)",
                      position: "relative",
                      ...(isCurrentMonth ? {} : { opacity: 0.3 }),
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundColor: isToday ? "#2196F3" : "transparent",
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: isToday ? 700 : 500,
                          color: isToday ? "white" : "var(--Dark-Green-1)",
                          fontSize: "12px",
                          lineHeight: 1,
                        }}
                      >
                        {day}
                      </Typography>
                    </Box>

                    {dayEvents.length > 0 && (
                      <Box sx={{ width: "100%", mt: 0.3 }}>
                        {dayEvents.map((event, eventIndex) => (
                          <Box
                            key={eventIndex}
                            sx={{
                              width: "100%",
                              backgroundColor: event.color,
                              borderRadius: "var(--radius-sm)",
                              px: 0.3,
                              py: 0.1,
                              border: "1px solid rgba(0,0,0,0.1)",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: "7px",
                                fontWeight: 600,
                                color: event.color === "#9BF2FF" ? "#333" : "#fff",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                display: "block",
                              }}
                            >
                              {event.title}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                );
              });
            })()}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
