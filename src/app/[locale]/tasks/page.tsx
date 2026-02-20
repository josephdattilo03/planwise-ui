"use client";
import { useEffect, useState } from "react";
import { TaskProvider } from "../../providers/tasks/TaskContext";
import NewTaskComponent from "../../components/tasks/NewTaskComponent";
import { Board, Tag, Task } from "../../types";
import { fetchBoards } from "../../services/boards/boardService";
import { fetchTags } from "../../services/tags/tagService";
import { fetchTasks } from "../../services/tasks/taskService";
import TaskList from "../../components/tasks/TaskList";
import TaskFilterComponent from "../../components/tasks/TaskFilterComponent";
import { FiltersProvider } from "../../providers/filters/FiltersContext";
import FormButton from "@/src/common/button/FormButton";
import { useSession } from "next-auth/react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [view, setView] = useState<"list" | "grid">("list");
  const [boards, setBoards] = useState<Board[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const {data: session} = useSession();
  const email = session?.user?.email;

  useEffect(() => {
    console.log(
      "Tasks updated:",
      tasks.length,
      tasks.map((t) => t.id)
    );
  }, [tasks]);

  /** Load tasks from localStorage */
  useEffect(() => {
    async function load() {
      console.log("Loading tasks...");
      try {
        const [boardData, tagData] = await Promise.all([
          fetchBoards(email as string),
          fetchTags(email as string),
        ]);
        setBoards(boardData);
        setTags(tagData);
        console.log(boardData)
        const taskData = await fetchTasks(email as string, boardData, tagData);
        console.log(taskData)
        setTasks(taskData);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [email]);



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

  /** LIST VIEW */
  if (view === "list") {
    return (
      <FiltersProvider>
        <div className="flex flex-row w-full h-full overflow-hidden">
          {/* Task Filters */}
          <TaskFilterComponent />

          <div className="flex flex-col overflow-y-scroll w-full px-6 py-4">
            {/* Task list - now has access to FiltersContext */}
            <div className="space-y-2">
              <TaskList taskList={tasks} onSelectTask={handleSelectTask} />
            </div>
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
