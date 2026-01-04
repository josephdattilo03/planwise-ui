"use client";

import { useState } from "react";
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
import AppsIcon from "@mui/icons-material/Apps";
import { useRouter } from "next/navigation";
import GoogleIcon from "@mui/icons-material/Google";

import Image from "next/image";
import { signOut, useSession, signIn } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const userName = session?.user?.name
    ? session?.user?.name.split(" ")[0]
    : "there";

  const [recentTasks] = useState([
    {
      name: "Finish dashboard design",
      priority: "High",
      dueDate: "Dec 3, 2025",
    },
    {
      name: "Update documentation",
      priority: "Medium",
      dueDate: "Dec 8, 2025",
    },
    { name: "Review pull requests", priority: "Low", dueDate: "Dec 12, 2025" },
    {
      name: "Prepare client presentation",
      priority: "High",
      dueDate: "Dec 6, 2025",
    },
    { name: "Test new features", priority: "Medium", dueDate: "Dec 14, 2025" },
  ]);

  const [recentNotes] = useState([
    { title: "Meeting notes - Q4 planning", date: "Dec 1, 2025" },
    { title: "Project ideas brainstorming", date: "Nov 28, 2025" },
    { title: "API documentation", date: "Nov 25, 2025" },
  ]);

  const mainNote = recentNotes[0];
  const noteTags = recentNotes.slice(1);

  // Calculate days with tasks for the current month
  const currentMonthYear = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const taskDays = recentTasks
    .map((task) => {
      const date = new Date(task.dueDate);
      return date.getDate();
    })
    .filter((day) => day >= 1 && day <= 31);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-off-white text-green-1">
        <p>Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-off-white text-green-1">
        <Image
          src="/logo.svg"
          alt="Planwise logo"
          width={170}
          height={43}
          className="w-[270px] h-auto"
          priority
        />
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-sm">Welcome! Please sign in to continue :)</p>
          <Button
            component="label"
            variant="contained"
            onClick={() => signIn("google")}
            className="bg-dark-green-2 hover:bg-dark-green-1 text-white font-medium text-lg transition-colors"
            startIcon={<GoogleIcon />}
          >
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Box
      sx={{
        px: 4,
        pt: 2,
        pb: 2,
        backgroundColor: "var(--off-white)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box mt={2} />

      {/* Main grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            // xs: "1fr",
            // md: "1fr 1fr",
            lg: "0.5fr 0.8fr 1.4fr",
          },
          gap: 4,
          alignItems: "flex-start",
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* LEFT COLUMN – greeting + schedule alert */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Hi there heading */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              color: "var(--dark-green-1)",
              fontWeight: "bold",
              mt: 2,
              mb: 1,
              ml: 1.5,
            }}
          >
            <Typography
              variant="h2"
              sx={{
                color: "var(--dark-green-1)",
                fontWeight: "bold",
                mb: 0,
                textAlign: "left",
              }}
            >
              Hi, {userName}!
            </Typography>
            <AppsIcon
              sx={{
                fontSize: 24,
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                  opacity: 0.8,
                },
              }}
              onClick={() => {
                // Ready for future navigation implementation
              }}
            />
          </Box>

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
                variant="body2"
                sx={{
                  color: "var(--dark-green-2)",
                  lineHeight: 1.4,
                  mb: 2,
                  fontSize: 20,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Welcome to your dashboard,
                <br />
                let’s get things done today ☺
              </Typography>

              <Button
                fullWidth
                variant="contained"
                sx={{
                  mb: 3,
                  textTransform: "none",
                  borderRadius: 999,
                  backgroundColor: "#2e7d32",
                  py: 1.5,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "white",
                  "&:hover": { backgroundColor: "#1b5e20" },
                }}
                onClick={() => router.push("/notes")}
              >
                + Create New Note
              </Button>

              <Typography
                variant="h6"
                sx={{
                  mb: 1.5,
                  fontWeight: 600,
                  color: "var(--dark-green-1)",
                  fontSize: "1rem",
                }}
              >
                Quick Access
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {["Senior Design", "Team Workspace"].map((name) => (
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
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--dark-green-1)",
                        mb: 0.5,
                      }}
                    >
                      {name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: 14, color: "var(--dark-green-2)" }}
                    >
                      Click to access tasks
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Schedule alert */}
          <Card
            sx={{
              mt: 2,
              borderRadius: "20px",
              background: "linear-gradient(135deg, #ffe1c4, #ffd0bf)",
              border: "2px solid rgba(122, 58, 0, 0.2)",
            }}
            elevation={3}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#7a3a00", mb: 2 }}
              >
                ⚠️ Schedule Alert
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  color: "#6b3a17",
                  lineHeight: 1.5,
                  fontWeight: 500,
                }}
              >
                Our algorithm shows that the your schedule for the next 10 days
                are quite busy. Please remember to take care.
              </Typography>

              <Typography
                variant="body2"
                sx={{ mb: 3, color: "#8b4513", fontStyle: "italic" }}
              ></Typography>

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
                See Details
              </Button>
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
            minHeight: "85vh",
            display: "flex",
            flexDirection: "column",
          }}
          elevation={2}
          onClick={() => router.push("/tasks")}
        >
          <CardContent
            sx={{ p: 4, flexGrow: 1, display: "flex", flexDirection: "column" }}
          >
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontSize: 16,
                  fontWeight: "bold",
                  mb: 2,
                  color: "var(--dark-green-1)",
                }}
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
                {["MON 1", "TUE 2", "WED 3", "THUR 4", "FRI 5"].map(
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
                          color: "black",
                          fontSize: 14,
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

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  mb: 3,
                }}
              >
                {recentTasks.map((task: any) => (
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
                        sx={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--dark-green-1)",
                        }}
                      >
                        {task.name}
                      </Typography>
                      <TaskIcon
                        sx={{ fontSize: 14, color: "var(--green-2)" }}
                      />
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
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "center",
                mt: "auto",
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
                <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.5)" }}>
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
                  color: "black",
                  "&:hover": { backgroundColor: "var(--green-3)" },
                }}
              >
                Add
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN – calendar + main note */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Calendar */}
          <Card
            sx={{
              borderRadius: "16px",
              border: "3px solid var(--green-2)",
              backgroundColor: "#fffdf7",
              cursor: "pointer",
              flex: 1.5,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
            elevation={4}
            onClick={() => router.push("/calendar")}
          >
            <CardContent
              sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{ mb: 1, display: "flex", alignItems: "center", gap: 2 }}
              >
                <EventIcon sx={{ color: "var(--green-2)", fontSize: 24 }} />
                <Typography
                  variant="h6"
                  sx={{
                    color: "var(--dark-green-2)",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                  }}
                >
                  Calendar Preview
                </Typography>
              </Box>

              <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "var(--dark-green-2)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    {new Date().toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    borderRadius: "16px",
                    border: "3px solid var(--dark-green-1)",
                    p: 2,
                    backgroundColor: "#fff",
                    flex: 1,
                    boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)",
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
                          color: "var(--dark-green-1)",
                          fontSize: "12px",
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
                      gap: 1,
                      fontSize: 12,
                    }}
                  >
                    {Array.from({ length: 35 }).map((_, i) => {
                      const day = i + 1;
                      const isToday = day === new Date().getDate() && i < 31;
                      const isEventDay = taskDays.includes(day);

                      return (
                        <Box
                          key={day}
                          sx={{
                            minHeight: 60,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            p: 0.5,
                            border: isToday
                              ? "3px solid var(--dark-green-1)"
                              : "1px solid var(--green-4)",
                            backgroundColor: day <= 31 ? "#f9f9f9" : "#e9e9e9",
                            position: "relative",
                            ...(day > 31 && { opacity: 0.3 }),
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: isToday || isEventDay ? 700 : 500,
                              color: isToday ? "white" : "var(--dark-green-1)",
                              fontSize: "14px",
                            }}
                          >
                            {day <= 31 ? day : ""}
                          </Typography>
                          {isEventDay && (
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 4,
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: "#ff9800",
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
              minHeight: "28vh",
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
                sx={{
                  fontSize: 14,
                  color: "var(--dark-green-2)",
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                The group discussed upcoming deadlines and confirmed that the
                revised project timeline still aligns with stakeholder
                expectations.
                <br />
                A quick review of open bugs highlighted two issues that need to
                be addressed before the next release.
                <br />
                Everyone agreed to schedule brief check-ins on Thursday to
                ensure the handoff between design and engineering remains
                smooth.
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                {noteTags.map((note: any) => (
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
      </Box>
    </Box>
  );
}
