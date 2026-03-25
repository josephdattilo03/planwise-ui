"use client";
import { useCallback, useEffect, useState } from "react";
import { Button, Box } from "@mui/material";
import { Task } from "../../types";
import { fetchTasks } from "../../services/tasks/taskService";
import TaskList from "../../components/tasks/TaskList";
import TaskFilterComponent from "../../components/tasks/TaskFilterComponent";
import { FiltersProvider } from "../../providers/filters/FiltersContext";
import LoadingSpinner from "@/src/common/LoadingSpinner";
import { useBoardsTags } from "../../providers/boardsTags/BoardsTagsContext";
import { useSession } from "next-auth/react";
import { useTaskDrawer } from "../../providers/tasks/TaskDrawerContext";
import { useSearchParams } from "next/navigation";

export default function TasksPage() {
  const { boards, tags, loading: boardsTagsLoading } = useBoardsTags();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const userId = session?.user?.email ?? undefined;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<"list" | "grid">("list");
  const [tasksLoading, setTasksLoading] = useState(true);
  const { openCreate, openEdit, setOnSaveSuccessHandler } = useTaskDrawer();
  const [openedTaskFromQuery, setOpenedTaskFromQuery] = useState<string | null>(null);

  /** Load tasks once boards/tags are ready (from preload) */
  useEffect(() => {
    if (boardsTagsLoading) return;
    if (sessionStatus === "loading") return;
    let cancelled = false;
    async function load() {
      try {
        setTasksLoading(true);
        const taskData = await fetchTasks(userId, boards, tags);
        if (!cancelled) setTasks(taskData);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setTasksLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [boardsTagsLoading, boards, tags, userId, sessionStatus]);

  const refreshTasks = useCallback(async () => {
    try {
      setTasksLoading(true);
      const taskData = await fetchTasks(userId, boards, tags);
      setTasks(taskData);
    } finally {
      setTasksLoading(false);
    }
  }, [userId, boards, tags]);

  // Let the global drawer tell this page to refresh after save.
  useEffect(() => {
    setOnSaveSuccessHandler(refreshTasks);
    return () => setOnSaveSuccessHandler(null);
  }, [refreshTasks, setOnSaveSuccessHandler]);

  const handleSelectTask = (task: Task) => openEdit(task);
  const handleCreateTask = () => openCreate();

  useEffect(() => {
    if (tasksLoading) return;
    const taskId = searchParams.get("taskId");
    if (!taskId) return;
    if (openedTaskFromQuery === taskId) return;
    const matched = tasks.find((t) => t.id === taskId);
    if (!matched) return;
    openEdit(matched);
    setOpenedTaskFromQuery(taskId);
  }, [tasksLoading, searchParams, tasks, openEdit, openedTaskFromQuery]);

  return (
    <FiltersProvider>
      <div className="flex flex-row w-full h-full overflow-hidden">
        {/* Filter sidebar – always visible (uses preloaded boards/tags) */}
        <TaskFilterComponent />

        {/* Main content – loading spinner until tasks are ready */}
        <div className="flex flex-col overflow-y-scroll w-full px-6 py-4">
          <Box className="flex items-center justify-between gap-3 mb-3">
            <Box className="flex flex-col">
              <div className="text-page-title">Tasks</div>
            </Box>

            <Box className="flex items-center gap-2">
              <Button
                size="small"
                variant={view === "list" ? "contained" : "outlined"}
                onClick={() => setView("list")}
              >
                List
              </Button>
              <Button
                size="small"
                variant={view === "grid" ? "contained" : "outlined"}
                onClick={() => setView("grid")}
              >
                Grid
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleCreateTask}
                sx={{ whiteSpace: "nowrap" }}
              >
                + New
              </Button>
            </Box>
          </Box>

          {tasksLoading ? (
            <LoadingSpinner label="Loading tasks..." className="flex-1" />
          ) : (
            <div className="space-y-2 content-fade-in">
              <TaskList
                taskList={tasks}
                onSelectTask={handleSelectTask}
                layout={view}
              />
            </div>
          )}
        </div>
      </div>
    </FiltersProvider>
  );
}
