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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [boards, setBoards] = useState<Board[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  /** Load tasks from localStorage */
  useEffect(() => {
    async function load() {
      try {
        const [boardData, tagData] = await Promise.all([
          fetchBoards(),
          fetchTags(),
        ]);

        setBoards(boardData);
        setTags(tagData);

        // Load tasks using the service
        const taskData = await fetchTasks(boardData, tagData);
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

  /** Return to list and reload tasks */
  const returnToList = async () => {
    const taskData = await fetchTasks(boards, tags);
    setTasks(taskData);
    setMode("list");
  };

  /** LIST VIEW */
  if (mode === "list") {
    return (
      <div className="p-6 space-y-4">
        {/* Task Filters */}
        <FiltersProvider>
          <TaskFilterComponent></TaskFilterComponent>
        </FiltersProvider>
        <h1 className="text-2xl font-semibold text-dark-green-1">
          Task Testing UI
        </h1>

        {/* Create button */}
        <button
          onClick={handleCreateTask}
          className="px-4 py-2 rounded-md bg-green-1 text-white hover:bg-green-2"
        >
          + Create Task
        </button>

        {/* Task list */}
        <div className="mt-4 space-y-2">
          {tasks.length === 0 && (
            <p className="text-gray-500">No tasks found in localStorage.</p>
          )}

          {<TaskList taskList={tasks}></TaskList>}
        </div>
      </div>
    );
  }

  /** CREATE MODE */
  if (mode === "create") {
    return (
      <div className="h-full">
        <TaskProvider task={null}>
          <div className="flex">
            <button
              onClick={returnToList}
              className="m-4 px-3 py-1 rounded bg-beige border border-green-3"
            >
              ← Back
            </button>
            <NewTaskComponent />
          </div>
        </TaskProvider>
      </div>
    );
  }

  /** EDIT MODE */
  if (mode === "edit" && editingTask) {
    return (
      <div className="h-full">
        <TaskProvider task={editingTask}>
          <div className="flex">
            <button
              onClick={returnToList}
              className="m-4 px-3 py-1 rounded bg-beige border border-green-3"
            >
              ← Back
            </button>
            <NewTaskComponent />
          </div>
        </TaskProvider>
      </div>
    );
  }

  return null;
}