"use client";
import { useEffect, useState } from "react";
import { TaskProvider } from "../../providers/tasks/TaskContext";
import NewTaskComponent from "../../components/tasks/NewTaskComponent";
import { Task } from "../../types";
import { fetchTasks } from "../../services/tasks/taskService";
import TaskList from "../../components/tasks/TaskList";
import TaskFilterComponent from "../../components/tasks/TaskFilterComponent";
import { FiltersProvider } from "../../providers/filters/FiltersContext";
import LoadingSpinner from "@/src/common/LoadingSpinner";
import { useBoardsTags } from "../../providers/boardsTags/BoardsTagsContext";

export default function TasksPage() {
  const { boards, tags, loading: boardsTagsLoading } = useBoardsTags();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [view, setView] = useState<"list" | "grid">("list");
  const [tasksLoading, setTasksLoading] = useState(true);

  /** Load tasks once boards/tags are ready (from preload) */
  useEffect(() => {
    if (boardsTagsLoading) return;
    let cancelled = false;
    async function load() {
      try {
        setTasksLoading(true);
        const taskData = await fetchTasks(boards, tags);
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
  }, [boardsTagsLoading, boards, tags]);



  const handleSelectTask = (task: Task) => {
    setEditingTask(task);
    setMode("edit");
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setMode("create");
  };

  const handleSaveSuccess = async () => {
    const taskData = await fetchTasks(boards, tags);
    setTasks(taskData);
    setMode("create");
  };

  /** Layout always visible: sidebar + main. Only the main content area shows loading. */
  if (view === "list") {
    return (
      <FiltersProvider>
        <div className="flex flex-row w-full h-full overflow-hidden">
          {/* Filter sidebar – always visible (uses preloaded boards/tags) */}
          <TaskFilterComponent />

          {/* Main content – loading spinner until tasks are ready */}
          <div className="flex flex-col overflow-y-scroll w-full px-6 py-4">
            {tasksLoading ? (
              <LoadingSpinner label="Loading tasks..." className="flex-1" />
            ) : (
              <div className="space-y-2 content-fade-in">
                <TaskList taskList={tasks} onSelectTask={handleSelectTask} />
              </div>
            )}
          </div>

          {mode === "create" && (
            <TaskProvider task={null}>
              <NewTaskComponent onSaveSuccess={handleSaveSuccess} />
            </TaskProvider>
          )}

          {mode === "edit" && editingTask && (
            <TaskProvider task={editingTask}>
              <NewTaskComponent onSaveSuccess={handleSaveSuccess} />
            </TaskProvider>
          )}
        </div>
      </FiltersProvider>
    );
  }

  return null;
}
