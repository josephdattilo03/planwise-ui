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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import TaskIcon from "@mui/icons-material/Task";
import AppsIcon from "@mui/icons-material/Apps";
import { useRouter } from "next/navigation";
import GoogleIcon from "@mui/icons-material/Google";

import Image from "next/image";
import { signOut, useSession, signIn } from "next-auth/react";

import { fetchTasks, createTask } from "../services/tasks/taskService";
import { fetchEvents } from "../services/events/eventService";
import { fetchBoards } from "../services/boards/boardService";
import { fetchTags } from "../services/tags/tagService";
import { Task } from "../types/task";
import { Event } from "../types/event";
import { Board } from "../types/board";
import { Tag } from "../types/tag";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const userName = session?.user?.name
    ? session?.user?.name.split(" ")[0]
    : "there";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskName, setNewTaskName] = useState("");
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<number>(1);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteBody, setNewNoteBody] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [boardsData, tagsData] = await Promise.all([
          fetchBoards(),
          fetchTags(),
        ]);

        const [tasksData, eventsData] = await Promise.all([
          fetchTasks(boardsData, tagsData),
          fetchEvents(boardsData),
        ]);

        setBoards(boardsData);
        setTags(tagsData);
        setTasks(tasksData);
        setEvents(eventsData);

        // Initialize selected board to first board
        if (boardsData.length > 0 && !selectedBoardId) {
          setSelectedBoardId(boardsData[0].id);
        }

        // Load notes from localStorage
        const savedNotes = localStorage.getItem('notes');
        if (savedNotes) {
          const parsedNotes = JSON.parse(savedNotes);
          setNotes(parsedNotes);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      loadData();
    }
  }, [status]);

  // Get recent tasks (next 5 upcoming tasks)
  const recentTasks = tasks
    .filter(task => task.dueDate >= new Date())
    .sort((a, b) => a.dueDate - b.dueDate)
    .slice(0, 5);

  // Get recent notes (last 3 edited)
  const recentNotes = notes
    .sort((a, b) => {
      const dateA = new Date(a.timestamp || 0).getTime();
      const dateB = new Date(b.timestamp || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 3);

  const mainNote = recentNotes[0] || {
    title: "No notes yet",
    body: "Create your first note to get started!",
    timestamp: new Date().toLocaleString()
  };
  const noteTags = recentNotes.slice(1);

  const handleAddTask = async () => {
    if (!newTaskName.trim()) return;

    try {
      const selectedBoard = boards.find(board => board.id === selectedBoardId) || boards[0];
      const newTask = createTask({
        name: newTaskName.trim(),
        board: selectedBoard,
        dueDate: new Date(Date.now() + 86400000), // Tomorrow
        priorityLevel: selectedPriority,
      });

      // Refresh tasks list with proper board/tag data
      const [refreshedBoards, refreshedTags] = await Promise.all([
        fetchBoards(),
        fetchTags(),
      ]);
      const refreshedTasks = await fetchTasks(refreshedBoards, refreshedTags);
      setTasks(refreshedTasks);
      setNewTaskName("");
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleAddNote = () => {
    if (!newNoteTitle.trim()) return;

    const NOTE_COLORS = ['bg-pink', 'bg-blue', 'bg-cream', 'bg-lilac'];

    const newNote = {
      id: crypto.randomUUID(),
      x: 100 + Math.random() * 200, // Random position like NoteBoard
      y: 120 + Math.random() * 100,
      width: 380,
      height: 300,
      title: newNoteTitle.trim(),
      body: newNoteBody.trim() || "Start writing your note here...",
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
      timestamp: new Date().toISOString(),
      links: [],
    };

    // Get existing notes and add new one
    const savedNotes = localStorage.getItem('notes');
    const existingNotes = savedNotes ? JSON.parse(savedNotes) : [];
    const updatedNotes = [newNote, ...existingNotes];

    // Save to localStorage
    localStorage.setItem('notes', JSON.stringify(updatedNotes));

    // Update state
    setNotes(updatedNotes);

    // Clear inputs
    setNewNoteTitle("");
    setNewNoteBody("");
  };



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
        px: { xs: 1, sm: 2, md: 3, lg: 4 },
        pt: 2,
        pb: 2,
        backgroundColor: "var(--off-white)",
        display: "flex",
        flexDirection: "column",
        height: "100vh", // Exact viewport height
        overflow: "hidden", // Prevent any scrolling
      }}
    >
      <Box mt={1} />

      {/* Main grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr", // Single column on mobile
            sm: "1fr", // Single column on small tablets
            md: "0.75fr 0.95fr 1.3fr", 
            lg: "0.65fr 0.9fr 1.45fr", 
            xl: "0.55fr 0.85fr 1.6fr", 
          },
          gridTemplateRows: {
            xs: "auto auto auto", // Three rows on mobile
            sm: "auto auto auto", // Three rows on small tablets
            md: "1fr 1fr", // Two equal rows on medium screens
            lg: "1fr 1fr", // Two equal rows on large screens
            xl: "1fr 1fr", // Two equal rows on XL screens
          },
          gap: { xs: 2, sm: 3, md: 3 },
          alignItems: "stretch",
          flex: 1, 
          minHeight: 0, // Allow shrinking
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
                {[
                  { name: "Senior Design", boardId: "board-1", description: "Click to access board" },
                  { name: "My Workspace", boardId: null, description: "Click to access workspace" }
                ].map((item) => (
                  <Box
                    key={item.name}
                    onClick={() => {
                      if (item.boardId) {
                        router.push(`/folders?board=${item.boardId}`);
                      } else {
                        router.push("/folders");
                      }
                    }}
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
                      {item.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: 14, color: "var(--dark-green-2)" }}
                    >
                      {item.description}
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
              maxHeight: "200px",
              overflow: "hidden",
            }}
            elevation={3}
          >
            <CardContent sx={{ p: 3, pb: 2 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#7a3a00", mb: 1, fontSize: "1rem" }}
              >
                ⚠️ Schedule Alert
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mb: 2,
                  color: "#6b3a17",
                  lineHeight: 1.4,
                  fontSize: "0.875rem",
                }}
              >
                Your schedule for the next 10 days looks busy. Take care!
              </Typography>

              <Button
                variant="contained"
                fullWidth
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  backgroundColor: "#e65c2c",
                  py: 1.5,
                  fontSize: 13,
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
            display: "flex",
            flexDirection: "column",
          }}
          elevation={2}
          onClick={() => router.push("/tasks")}
        >
          <CardContent
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              flexGrow: 1,
              display: "flex",
              flexDirection: "column"
            }}
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
                {Array.from({ length: 5 }).map((_, idx) => {
                  const date = new Date();
                  date.setDate(date.getDate() + idx);
                  const isToday = idx === 0;
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                  const dayNumber = date.getDate();

                  // Count tasks due on this specific day
                  const tasksForDay = tasks.filter(task => {
                    const taskDate = new Date(task.dueDate);
                    return taskDate.toDateString() === date.toDateString();
                  }).length;

                  return (
                    <Paper
                      key={idx}
                      sx={{
                        textAlign: "center",
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: isToday ? "var(--green-2)" : "#fff",
                        color: "black",
                        fontSize: 14,
                        fontWeight: isToday ? 700 : 500,
                        boxShadow: "none",
                        border: "1px solid rgba(0,0,0,0.06)",
                        position: "relative",
                      }}
                    >
                      {dayName} {dayNumber}
                      {tasksForDay > 0 && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            backgroundColor: "var(--green-2)",
                            color: "white",
                            fontSize: 12,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid white",
                          }}
                        >
                          {tasksForDay}
                        </Box>
                      )}
                    </Paper>
                  );
                })}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  mb: 2,
                }}
              >
                {recentTasks.length > 0 ? recentTasks.map((task) => {
                  // Convert priority number to string
                  const priorityLabels = { 0: "Low", 1: "Medium", 2: "High", 3: "Now" };
                  const priorityString = priorityLabels[task.priorityLevel as keyof typeof priorityLabels] || "Low";

                  return (
                    <Paper
                      key={task.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        backgroundColor: "#fff",
                        border: "1px solid rgba(0,0,0,0.08)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
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
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
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
                              fontWeight: 500,
                              color: "var(--dark-green-2)",
                              fontSize: 11,
                            }}
                          >
                            {task.board.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "var(--dark-green-2)" }}
                          >
                            Due {task.dueDate.toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-start",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color:
                                priorityString === "High"
                                  ? "#d32f2f"
                                  : priorityString === "Medium"
                                    ? "#f57c00"
                                    : "#2e7d32",
                              px: 2,
                              py: 0.5,
                              borderRadius: 10,
                              backgroundColor:
                                priorityString === "High"
                                  ? "rgba(211, 47, 47, 0.1)"
                                  : priorityString === "Medium"
                                    ? "rgba(245, 124, 0, 0.1)"
                                    : "rgba(46, 125, 50, 0.1)",
                              fontSize: 11,
                            }}
                          >
                            {priorityString}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  );
                }) : (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "var(--dark-green-2)",
                      textAlign: "center",
                      py: 4,
                      fontStyle: "italic"
                    }}
                  >
                    No upcoming tasks
                  </Typography>
                )}
              </Box>
            </Box>

            <Box
              sx={{
                mt: "auto",
              }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {/* Board and Priority selectors */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <FormControl size="small" sx={{ minWidth: 100, flex: 1 }}>
                  <InputLabel sx={{ fontSize: "12px" }}>Board</InputLabel>
                  <Select
                    value={selectedBoardId}
                    label="Board"
                    onChange={(e: any) => setSelectedBoardId(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      fontSize: "12px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0,0,0,0.08)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0,0,0,0.15)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "var(--green-2)",
                      },
                    }}
                  >
                    {boards.map((board) => (
                      <MenuItem key={board.id} value={board.id} sx={{ fontSize: "12px" }}>
                        {board.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 100, flex: 1 }}>
                  <InputLabel sx={{ fontSize: "12px" }}>Priority</InputLabel>
                  <Select
                    value={selectedPriority}
                    label="Priority"
                    onChange={(e: any) => setSelectedPriority(Number(e.target.value))}
                    sx={{
                      borderRadius: 2,
                      fontSize: "12px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0,0,0,0.08)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0,0,0,0.15)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "var(--green-2)",
                      },
                    }}
                  >
                    <MenuItem value={0} sx={{ fontSize: "12px" }}>Low</MenuItem>
                    <MenuItem value={1} sx={{ fontSize: "12px" }}>Medium</MenuItem>
                    <MenuItem value={2} sx={{ fontSize: "12px" }}>High</MenuItem>
                    <MenuItem value={3} sx={{ fontSize: "12px" }}>Now</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Task input and button */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  alignItems: "center",
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Add a task..."
                  value={newTaskName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.stopPropagation();
                    setNewTaskName(e.target.value);
                  }}
                  onKeyPress={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                      handleAddTask();
                    }
                  }}
                  variant="outlined"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 999,
                      backgroundColor: "#fff",
                      "& fieldset": {
                        borderColor: "rgba(0,0,0,0.08)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(0,0,0,0.15)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--green-2)",
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleAddTask();
                  }}
                  disabled={!newTaskName.trim()}
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    backgroundColor: "var(--green-2)",
                    px: 2.5,
                    py: 1.5,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "black",
                    "&:hover": {
                      backgroundColor: "var(--green-3)"
                    },
                    "&:disabled": {
                      backgroundColor: "rgba(0,0,0,0.12)",
                      color: "rgba(0,0,0,0.26)"
                    }
                  }}
                >
                  Add
                </Button>
              </Box>
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
              flex: 1.3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
            elevation={4}
            onClick={() => router.push("/calendar")}
          >
            <CardContent
              sx={{
                p: { xs: 1, sm: 1.5, md: 2 },
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Box
                sx={{ mb: 0.5, display: "flex", alignItems: "center", gap: 1.5 }}
              >
                <EventIcon sx={{ color: "var(--green-2)", fontSize: 20 }} />
                <Typography
                  variant="h6"
                  sx={{
                    color: "var(--dark-green-2)",
                    fontWeight: 600,
                    fontSize: "1rem",
                  }}
                >
                  Calendar Preview
                </Typography>
              </Box>

              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", mt: 1 }}>
                <Box sx={{ mb: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "var(--dark-green-2)",
                      fontSize: "0.8rem",
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
                    borderRadius: "12px",
                    border: "2px solid var(--dark-green-1)",
                    p: 1,
                    backgroundColor: "#fff",
                    flex: 1,
                    boxShadow: "inset 0 0 8px rgba(0,0,0,0.03)",
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

                  {/* Calendar days grid with real events */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: 0.5,
                      fontSize: 12,
                    }}
                  >
                    {(() => {
                      const now = new Date();
                      const currentMonth = now.getMonth();
                      const currentYear = now.getFullYear();

                      // Get the first day of the current month
                      const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
                      // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
                      const startDayOfWeek = firstDayOfMonth.getDay();

                      // Calculate the date for the first box (might be from previous month)
                      const startDate = new Date(firstDayOfMonth);
                      startDate.setDate(1 - startDayOfWeek); // Go back to Sunday

                      return Array.from({ length: 35 }).map((_, i) => {
                        const currentDate = new Date(startDate);
                        currentDate.setDate(startDate.getDate() + i);

                        const day = currentDate.getDate();
                        const month = currentDate.getMonth();
                        const year = currentDate.getFullYear();

                        const isCurrentMonth = month === currentMonth && year === currentYear;
                        const isToday = currentDate.toDateString() === now.toDateString();

                        // Get real events and tasks for this specific date
                        const dayEvents = [
                          // Real events
                          ...events
                            .filter(event => {
                              const eventDate = new Date(event.startTime);
                              return eventDate.toDateString() === currentDate.toDateString();
                            })
                            .map(event => {
                              // Check for specific event names first
                              const eventTitle = event.description.toLowerCase();
                              if (eventTitle.includes('team standup') || eventTitle.includes('standup meeting')) {
                                return {
                                  title: `📅 ${event.description}`,
                                  color: "#E1BEE7", // lilac
                                  type: "event"
                                };
                              }
                              if (eventTitle.includes('project milestone') || eventTitle.includes('milestone')) {
                                return {
                                  title: `📅 ${event.description}`,
                                  color: "#FFA500", // orange
                                  type: "event"
                                };
                              }

                              // Use same color logic as calendar page - events use board.name directly
                              const boardName = event.board.name.toLowerCase();
                              const boardColors: Record<string, string> = {
                                "personal": "#9BF2FF",
                                "work": "#2196F3",
                                "pennos": "#FFA500",
                                "senior-design": "#A7C957",
                                "school": "#9C27B0",
                                "other": "#E1BEE7",
                              };
                              const eventColor = boardColors[boardName] || "#4CAF50";

                              return {
                                title: `📅 ${event.description}`,
                                color: eventColor,
                                type: "event"
                              };
                            }),
                          // Real tasks
                          ...tasks
                            .filter(task => {
                              const taskDate = new Date(task.dueDate);
                              return taskDate.toDateString() === currentDate.toDateString();
                            })
                            .slice(0, 1) // Limit to 1 task per day for preview
                            .map(task => {
                              // Use same color logic as calendar page
                              const board = boards.find(b => b.id === task.board.id);
                              const boardName = board?.name.toLowerCase() || 'default';
                              const boardColors: Record<string, string> = {
                                "personal": "#9BF2FF",
                                "work": "#2196F3",
                                "pennos": "#FFA500",
                                "senior-design": "#A7C957",
                                "school": "#9C27B0",
                                "other": "#E1BEE7",
                              };
                              const taskColor = boardColors[boardName] || "#4CAF50";

                              return {
                                title: `📋 ${task.name}`,
                                color: taskColor,
                                type: "task"
                              };
                            })
                        ].slice(0, 1); // Max 1 event per day for preview

                        return (
                          <Box
                            key={i}
                            sx={{
                              height: 50,
                              width: "100%",
                              borderRadius: 2,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              p: 0.3,
                              border: "1px solid var(--green-4)",
                              backgroundColor: isCurrentMonth
                                ? "#f9f9f9"
                                : "#e9e9e9",
                              position: "relative",
                              ...(isCurrentMonth ? {} : { opacity: 0.3 }),
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                backgroundColor: isToday ? "#2196F3" : "transparent",
                                mb: dayEvents.length > 0 ? 0.5 : 0,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: isToday ? 700 : 500,
                                  color: isToday ? "white" : "var(--dark-green-1)",
                                  fontSize: "14px",
                                  lineHeight: 1,
                                }}
                              >
                                {day}
                              </Typography>
                            </Box>

                            {/* Show events for this date */}
                            {dayEvents.map((event, eventIndex) => (
                              <Box
                                key={eventIndex}
                                sx={{
                                  width: "100%",
                                  backgroundColor: event.color,
                                  borderRadius: "4px",
                                  px: 0.5,
                                  py: 0.2,
                                  mb: 0.2,
                                  border: "1px solid rgba(0,0,0,0.1)",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: "9px",
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

                            {/* Fallback dot for days with tasks/events */}
                            {dayEvents.length === 0 && tasks.some(task => {
                              const taskDate = new Date(task.dueDate);
                              return taskDate.toDateString() === currentDate.toDateString();
                            }) && (
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
                      });
                    })()}
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
              flex: 1,
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
                LAST EDITED {mainNote.timestamp ? new Date(mainNote.timestamp).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                }).toUpperCase() : 'RECENTLY'}
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
                  mb: 2,
                  lineHeight: 1.6,
                }}
              >
                {mainNote.body ? mainNote.body.substring(0, 200) + (mainNote.body.length > 200 ? '...' : '') :
                  'Create your first note to get started with organizing your thoughts!'}
              </Typography>

              {/* Create new note inputs */}
              <Box
                sx={{
                  mb: 2,
                }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <TextField
                  fullWidth
                  placeholder="Quick note title..."
                  value={newNoteTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.stopPropagation();
                    setNewNoteTitle(e.target.value);
                  }}
                  variant="outlined"
                  size="small"
                  sx={{
                    mb: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: "rgba(0,0,0,0.08)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(0,0,0,0.15)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--green-2)",
                      },
                    },
                  }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleAddNote();
                  }}
                  disabled={!newNoteTitle.trim()}
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    backgroundColor: "#2e7d32",
                    py: 1,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "white",
                    "&:hover": { backgroundColor: "#1b5e20" },
                    "&:disabled": {
                      backgroundColor: "rgba(0,0,0,0.12)",
                      color: "rgba(0,0,0,0.26)"
                    }
                  }}
                >
                  + Create Note
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                {noteTags.length > 0 ? noteTags.map((note) => (
                  <Chip
                    key={note.id || note.title}
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
                )) : (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "var(--dark-green-2)",
                      fontStyle: "italic",
                      fontSize: 12
                    }}
                  >
                    {recentNotes.length <= 1 ? 'Create more notes to see them here' : 'No additional recent notes'}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
