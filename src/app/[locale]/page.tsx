"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
  Chip,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import TaskIcon from "@mui/icons-material/Task";
import { useRouter } from "next/navigation";

function toPriorityString(priorityLevel: number): string {
  const priorityMap: Record<number, string> = {
    0: "Low",
    1: "Medium",
    2: "High",
    3: "Urgent"
  };
  return priorityMap[priorityLevel] || "Low";
}

function formatDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate.getTime() === today.getTime()) {
    return "Today";
  } else if (dueDate.getTime() === tomorrow.getTime()) {
    return "Tomorrow";
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

export default function Home() {
  const [recentTasks] = useState([
    { name: "Finish dashboard design", priority: "High", dueDate: "Dec 3, 2025" },
    { name: "Update documentation", priority: "Medium", dueDate: "Dec 8, 2025" },
    { name: "Review pull requests", priority: "Low", dueDate: "Dec 12, 2025" },
  ]);

  const [recentNotes] = useState([
    { title: "Meeting notes - Q4 planning", date: "Dec 1, 2025" },
    { title: "Project ideas brainstorming", date: "Nov 28, 2025" },
    { title: "API documentation", date: "Nov 25, 2025" },
  ]);



  const mainNote = recentNotes[0];
  const noteTags = recentNotes.slice(1);

  const router = useRouter();

  return (
    <Box
      sx={{
        px: 3,
        pt: 1,
        pb: 1,
        backgroundColor: "var(--off-white)",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top heading */}
      <Typography
        variant="h5"
        sx={{
          mb: 2,
          color: "var(--dark-green-1)",
          fontWeight: "bold",
        }}
      >
        Home
      </Typography>

      {/* Main grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
            lg: "1.2fr 1fr 0.9fr",
          },
          gap: 3,
          alignItems: "flex-start",
          flex: 1,
          minHeight: 0, // Allows grid items to shrink
        }}
      >
        {/* LEFT COLUMN – calendar + main note */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Calendar */}
          <Card
            sx={{
              borderRadius: "16px",
              border: "2px solid var(--green-3)",
              backgroundColor: "#fffdf7",
              cursor: "pointer",
            }}
            elevation={2}
            onClick={() => router.push("/calendar")}
          >
            <CardContent sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
              <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 2 }}>
                <EventIcon sx={{ color: "var(--green-2)", fontSize: 20 }} />
                <Typography
                  variant="h6"
                  sx={{ color: "var(--dark-green-2)", fontWeight: 600, fontSize: "1rem" }}
                >
                  Calendar Preview
                </Typography>
              </Box>

              <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: "var(--dark-green-2)", fontSize: "0.875rem" }}>
                    {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    borderRadius: "12px",
                    border: "2px solid var(--green-3)",
                    p: 2,
                    backgroundColor: "#fff",
                    flex: 1,
                  }}
                >
                  {/* Weekdays */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      mb: 1,
                    }}
                  >
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, index) => (
                      <Typography
                        key={`${d}-${index}`}
                        variant="caption"
                        sx={{
                          textAlign: "center",
                          fontWeight: 700,
                          color: "var(--dark-green-2)",
                          fontSize: "10px",
                        }}
                      >
                        {d}
                      </Typography>
                    ))}
                  </Box>

                  {/* Calendar days grid - smaller */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: 0.5,
                      fontSize: 11,
                    }}
                  >
                    {Array.from({ length: 35 }).map((_, i) => {
                      const day = i + 1;
                      const isToday = day === new Date().getDate() && i < 31;
                      const isEventDay = [5, 9, 15, 22, 28].includes(day);

                      return (
                        <Box
                          key={day}
                          sx={{
                            minHeight: 36,
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            p: 0.5,
                            border: isToday
                              ? "3px solid var(--green-2)"
                              : isEventDay
                              ? "2px solid var(--orange-3)"
                              : "1px solid var(--green-4)",
                            backgroundColor: isToday
                              ? "var(--green-1)"
                              : isEventDay
                              ? "var(--orange-1)"
                              : day <= 31
                              ? "transparent"
                              : "var(--green-5)",
                            position: "relative",
                            ...(day > 31 && { opacity: 0.3 }),
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: isToday || isEventDay ? 700 : 500,
                              color: "var(--dark-green-1)",
                              fontSize: "10px",
                            }}
                          >
                            {day <= 31 ? day : ""}
                          </Typography>
                          {isEventDay && (
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 2,
                                width: 4,
                                height: 4,
                                borderRadius: "50%",
                                backgroundColor: "var(--orange-3)",
                              }}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>


              </Box>
            </CardContent>
          </Card>

          {/* Main note */}
          <Card
            sx={{
              borderRadius: "20px",
              border: "2px solid var(--green-3)",
              backgroundColor: "#ffeef6",
              cursor: "pointer",
            }}
            elevation={2}
            onClick={() => router.push("/notes")}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="overline"
                sx={{
                  color: "var(--dark-green-2)",
                  opacity: 0.8,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                LAST EDITED NOVEMBER 30, 2025
              </Typography>

              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", mb: 2, color: "var(--dark-green-1)" }}
              >
                {mainNote.title}
              </Typography>

              <Typography
                variant="body1"
                sx={{ color: "var(--dark-green-2)", mb: 3, lineHeight: 1.6 }}
              >
                Capture key ideas, to-dos, and links for your current work. This
                enhanced note section provides more space to preview your most
                important notes and quick access to related ideas.
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                {noteTags.map((note) => (
                  <Chip
                    key={note.title}
                    label={note.title}
                    size="small"
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "20px",
                      border: "1px solid rgba(0,0,0,0.08)",
                      fontSize: 12,
                      fontWeight: 500,
                      py: 1,
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* MIDDLE COLUMN – tasks */}
        <Card
          sx={{
            borderRadius: "20px",
            border: "2px solid var(--green-3)",
            backgroundColor: "#fdf5e6",
            cursor: "pointer",
          }}
          elevation={2}
          onClick={() => router.push("/tasks")}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", mb: 2, color: "var(--dark-green-1)" }}
            >
              Your Tasks
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 1,
                mb: 3,
              }}
            >
              {["WED 26", "THU 27", "FRI 28", "SAT 29", "SUN 30"].map(
                (label, idx) => {
                  const isActive = idx === 0;
                  return (
                    <Paper
                      key={label}
                      sx={{
                        textAlign: "center",
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: isActive ? "var(--green-2)" : "#fff",
                        color: isActive ? "#fff" : "var(--dark-green-2)",
                        fontSize: 12,
                        fontWeight: isActive ? 700 : 500,
                        boxShadow: "none",
                        border: "1px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      {label}
                    </Paper>
                  );
                }
              )}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
              {recentTasks.map((task) => (
                <Paper
                  key={task.name}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: "#fff",
                    border: "1px solid rgba(0,0,0,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "var(--dark-green-1)" }}
                    >
                      {task.name}
                    </Typography>
                    <TaskIcon sx={{ fontSize: 16, color: "var(--green-2)" }} />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color:
                          task.priority === "High"
                            ? "#d32f2f"
                            : task.priority === "Medium"
                            ? "#f57c00"
                            : "#2e7d32",
                        px: 2,
                        py: 0.5,
                        borderRadius: 10,
                        backgroundColor:
                          task.priority === "High"
                            ? "rgba(211, 47, 47, 0.1)"
                            : task.priority === "Medium"
                            ? "rgba(245, 124, 0, 0.1)"
                            : "rgba(46, 125, 50, 0.1)",
                        fontSize: 11,
                      }}
                    >
                      {task.priority}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "var(--dark-green-2)" }}
                    >
                      Due {task.dueDate}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "center",
              }}
            >
              <Paper
                sx={{
                  flex: 1,
                  borderRadius: 999,
                  px: 2.5,
                  py: 1.5,
                  backgroundColor: "#fff",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "none",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0,0,0,0.5)" }}
                >
                  Add a task...
                </Typography>
              </Paper>
              <Button
                variant="contained"
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  backgroundColor: "var(--green-2)",
                  px: 2.5,
                  py: 1.5,
                  fontSize: 13,
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "var(--green-3)" },
                }}
              >
                Add
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN – greeting + schedule alert */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Greeting / quick boards */}
          <Card
            sx={{
              borderRadius: "20px",
              border: "2px solid var(--green-3)",
              backgroundColor: "#f7f9f3",
            }}
            elevation={2}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", mb: 1, color: "var(--dark-green-1)" }}
              >
                Hi, there! 👋
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "var(--dark-green-2)", lineHeight: 1.4, mb: 2, fontSize: "0.875rem" }}
              >
                Welcome to your dashboard.
              </Typography>

              <Button
                fullWidth
                variant="contained"
                sx={{
                  mb: 3,
                  textTransform: "none",
                  borderRadius: 999,
                  backgroundColor: "var(--green-2)",
                  py: 1.5,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "black",
                  "&:hover": { backgroundColor: "var(--green-3)" },
                }}
                onClick={() => router.push("/notes")}
              >
                + Create New Note
              </Button>

              <Typography
                variant="h6"
                sx={{ mb: 1.5, fontWeight: 600, color: "var(--dark-green-1)", fontSize: "1rem" }}
              >
                Quick Access
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {["Senior Design", "Team Workspace"].map(
                  (name) => (
                    <Box
                      key={name}
                      onClick={() => router.push("/tasks")}
                      sx={{
                        cursor: "pointer",
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "#fff",
                        border: "1px solid rgba(0,0,0,0.08)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "var(--dark-green-1)",
                          mb: 0.5,
                        }}
                      >
                        {name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "var(--dark-green-2)" }}
                      >
                        Click to access tasks
                      </Typography>
                    </Box>
                  )
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Schedule alert */}
          <Card
            sx={{
              borderRadius: "20px",
              background: "linear-gradient(135deg, #ffe1c4, #ffd0bf)",
              border: "2px solid rgba(122, 58, 0, 0.2)",
            }}
            elevation={3}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#7a3a00", mb: 2 }}
              >
                ⚠️ Schedule Alert
              </Typography>

              <Typography
                variant="body1"
                sx={{ mb: 2, color: "#6b3a17", lineHeight: 1.5, fontWeight: 500 }}
              >
                Our analysis shows you're quite busy this week with multiple
                overlapping deadlines. Consider delegating some tasks and taking
                regular breaks to maintain peak performance.
              </Typography>

              <Typography
                variant="body2"
                sx={{ mb: 3, color: "#8b4513", fontStyle: "italic" }}
              >
              </Typography>

              <Button
                variant="contained"
                fullWidth
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  backgroundColor: "#e65c2c",
                  py: 2,
                  fontSize: 14,
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#d24f21" },
                }}
                onClick={() => router.push("/calendar")}
              >
                📅 Review Calendar & Tasks
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
