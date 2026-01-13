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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [view, setView] = useState<"list" | "grid">("list");
  const [boards, setBoards] = useState<Board[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

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
          fetchBoards(),
          fetchTags(),
        ]);
        setBoards(boardData);
        setTags(tagData);
        const taskData = await fetchTasks(boardData, tagData);
        console.log(
          "Fetched tasks:",
          taskData.length,
          taskData.map((t) => t.id)
        );
        setTasks(taskData);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);



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
            {/* Create button */}
            <FormButton
              onClick={handleCreateTask}
              text={"Add"}
              variant="confirm"
            />

            {/* Task list - now has access to FiltersContext */}
            <div className="mt-4 space-y-2">
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
