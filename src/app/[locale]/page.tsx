"use client";

import { useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";
import Image from "next/image";
import { useSession, signIn } from "next-auth/react";
import { fetchTasks, createTask } from "../services/tasks/taskService";
import { fetchEvents } from "../services/events/eventService";
import { fetchNotes, createNote } from "../services/notes/noteService";
import { getDataMode } from "../services/dataMode";
import type { StickyNote } from "../types/note";
import { Task } from "../types/task";
import { Event } from "../types/event";
import { useBoardsTags } from "../providers/boardsTags/BoardsTagsContext";

import {
  GreetingWidget,
  QuickAccessWidget,
  ScheduleAlertWidget,
  TasksWidget,
  CalendarWidget,
  NotesWidget,
} from "../components/home";
import { useTheme } from "@/src/common/ThemeProvider";
import LoadingSpinner from "@/src/common/LoadingSpinner";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  const { boards, tags, loading: boardsTagsLoading } = useBoardsTags();

  const { data: session, status } = useSession();
  const userId = session?.user?.email ?? undefined;

  const userName = session?.user?.name
    ? session?.user?.name.split(" ")[0]
    : "there";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  /** Load tasks, events, and notes once boards/tags are ready (from preload) */
  useEffect(() => {
    if (status !== "authenticated" || boardsTagsLoading) return;
    let cancelled = false;
    async function loadData() {
      try {
        setDashboardLoading(true);
        const [tasksData, eventsData, notesData] = await Promise.all([
          fetchTasks(userId, boards, tags),
          fetchEvents(boards, userId),
          fetchNotes(userId),
        ]);
        if (!cancelled) {
          setTasks(tasksData);
          setEvents(eventsData);
          setNotes(notesData.active);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        if (!cancelled) setDashboardLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [status, boardsTagsLoading, boards, tags, userId]);

  const loading = boardsTagsLoading || dashboardLoading;

  const handleAddTask = async (taskName: string, boardId: string, priority: number) => {
    if (!taskName.trim() || !userId) return;
    const selectedBoard = boards.find((b) => b.id === boardId) || boards.find((b) => !b.id.startsWith("gcal:"));
    if (!selectedBoard) return;

    try {
      await createTask(
        {
          name: taskName.trim(),
          board: selectedBoard,
          dueDate: new Date(Date.now() + 86400000),
          priorityLevel: priority,
          description: "",
          progress: "to-do",
          tags: [],
        },
        userId
      );

      const refreshedTasks = await fetchTasks(userId, boards, tags);
      setTasks(refreshedTasks);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleAddNote = async (title: string, body: string) => {
    if (!title.trim()) return;

    const NOTE_COLORS = ["bg-pink", "bg-blue", "bg-cream", "bg-lilac"];

    const newNote: StickyNote = {
      id: crypto.randomUUID(),
      x: 100 + Math.random() * 200,
      y: 120 + Math.random() * 100,
      width: 380,
      height: 300,
      title: title.trim(),
      body: body.trim() || "Start writing your note here...",
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
      timestamp: new Date().toLocaleString(),
      links: [],
    };

    if (getDataMode() === "mock") {
      const existing = JSON.parse(localStorage.getItem("notes") || "[]");
      localStorage.setItem("notes", JSON.stringify([newNote, ...existing]));
      setNotes([newNote, ...notes]);
      return;
    }

    if (!userId) return;

    try {
      await createNote(userId, newNote);
      const { active } = await fetchNotes(userId);
      setNotes(active);
    } catch (e) {
      console.error("Error creating note:", e);
    }
  };

  const handleSelectTaskFromWidget = (task: Task) => {
    router.push(`/tasks?taskId=${encodeURIComponent(task.id)}`);
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <LoadingSpinner label="Loading..." fullPage />
      </div>
    );
  }

  if (status === "authenticated" && loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <LoadingSpinner label="Loading dashboard..." fullPage />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background text-green-1">
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
      className="content-fade-in w-full h-full"
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        backgroundColor: "var(--background)",
        display: "flex",
        flexDirection: "column",
        "@media (max-height: 900px)": {
          p: { xs: 1.5, sm: 2, md: 3 },
        },
        "@media (max-height: 800px)": {
          p: { xs: 1, sm: 1.5, md: 2.5 },
        },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr",
            md: "1fr 2fr 1fr",
          },
          gap: { xs: 2, sm: 3, md: 3 },
          alignItems: "start",
          "@media (max-height: 900px)": {
            rowGap: 2,
            columnGap: 2.5,
          },
          "@media (max-height: 800px)": {
            rowGap: 1.5,
            columnGap: 2,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            order: { xs: 1, md: "unset" },
            "@media (max-height: 900px)": {
              gap: 2.5,
            },
            "@media (max-height: 800px)": {
              gap: 2,
            },
          }}
        >
          <GreetingWidget userName={userName} />
          <ScheduleAlertWidget />
          <QuickAccessWidget boards={boards} />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            order: { xs: 2, md: "unset" },
            "@media (max-height: 900px)": {
              gap: 2.5,
            },
            "@media (max-height: 800px)": {
              gap: 2,
            },
          }}
        >
          <TasksWidget
            tasks={tasks}
            boards={boards}
            onAddTask={handleAddTask}
            onSelectTask={handleSelectTaskFromWidget}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            order: { xs: 3, md: "unset" },
            "@media (max-height: 900px)": {
              gap: 2.5,
            },
            "@media (max-height: 800px)": {
              gap: 2,
            },
          }}
        >
          <CalendarWidget events={events} tasks={tasks} boards={boards} />
          <NotesWidget notes={notes} onAddNote={handleAddNote} />
        </Box>
      </Box>
    </Box>
  );
}
