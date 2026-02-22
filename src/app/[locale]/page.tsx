"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip
} from "@mui/material";
import {
  Apps as AppsIcon,
  Google as GoogleIcon,
  Task as TaskIcon,
  Event as EventIcon
} from "@mui/icons-material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut, useSession, signIn } from "next-auth/react";

import { fetchTasks, createTask } from "../services/tasks/taskService";
import { fetchEvents } from "../services/events/eventService";
import { fetchBoards } from "../services/boards/boardService";
import { fetchTags } from "../services/tags/tagService";
import { Task } from "../types/task";
import { Event } from "../types/event";
import { Board } from "../types/board";
import { Tag } from "../types/tag";

import {
  GreetingWidget,
  QuickAccessWidget,
  ScheduleAlertWidget,
  TasksWidget,
  CalendarWidget,
  NotesWidget,
} from "../components/home";
import { useTheme } from "@/src/common/ThemeProvider";

export default function Home() {
  const { theme } = useTheme();

  const router = useRouter();
  const { data: session, status } = useSession();

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
  const email = session?.user?.email as string;


  useEffect(() => {
    const loadData = async () => {
      try {
        const [boardsData, tagsData] = await Promise.all([
          fetchBoards(email as string),
          fetchTags(email as string),
        ]);

        const [tasksData, eventsData] = await Promise.all([
          fetchTasks(email as string, boardsData, tagsData),
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
  }, [status, email, selectedBoardId]);

  // Get recent tasks (next 5 upcoming tasks)
  const recentTasks = tasks
    .filter(task => {
      const dueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      return dueDate >= new Date();
    })
    .sort((a, b) => {
      const dateA = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
      const dateB = b.dueDate instanceof Date ? b.dueDate : new Date(b.dueDate);
      return dateA.getTime() - dateB.getTime();
    })
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
        dueDate: new Date(Date.now() + 86400000),
        priorityLevel: selectedPriority,
      });

      // Refresh tasks list with proper board/tag data
      const [refreshedBoards, refreshedTags] = await Promise.all([
        fetchBoards(email),
        fetchTags(email),
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
          src={theme === "dark" ? "/Logo-Dark.svg" : "/logo.svg"}
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
        p: { xs: 2, sm: 3, md: 4 },
        backgroundColor: "var(--Off-White)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        // Hide scrollbars on desktop/laptop
        "&::-webkit-scrollbar": {
          display: "none",
        },
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {/* Single row layout with 3 columns */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr", // Single column on mobile
            sm: "1fr", // Single column on small tablets
            md: "1fr 2fr 1fr", // Left: 1 part, Middle: 2 parts, Right: 1 part on medium+
          },
          gap: { xs: 2, sm: 3, md: 3 },
          alignItems: "start",
        }}
      >
        {/* Left column - Greeting and Quick Access */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            order: { xs: 1, md: "unset" }, // Reorder on mobile if needed
          }}
        >
          <GreetingWidget userName={userName} />
          <QuickAccessWidget />
        </Box>

        {/* Middle column - Tasks Widget and Schedule Alert */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            order: { xs: 2, md: "unset" }, // Reorder on mobile
          }}
        >
          <TasksWidget
            tasks={tasks}
            boards={boards}
            onAddTask={handleAddTask}
          />
          <ScheduleAlertWidget />
        </Box>

        {/* Right column - Calendar and Notes */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            order: { xs: 3, md: "unset" }, // Reorder on mobile
          }}
        >
          <CalendarWidget events={events} tasks={tasks} boards={boards} />
          <NotesWidget notes={notes} onAddNote={handleAddNote} />
        </Box>
      </Box>
    </Box>
  );
}
