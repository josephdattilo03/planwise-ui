"use client";

import { useEffect, useState } from "react";
import { TaskProvider } from "../../providers/tasks/TaskContext";
import NewTaskComponent from "../../components/tasks/NewTaskComponent";
import { Board, Tag, Task } from "../../types";
import { fetchBoards } from "../../services/boards/boardService";
import { fetchTags } from "../../services/tags/tagService";

type StoredTask = {
  id: number;
  name: string;
  description: string;
  dueDate: string | null;
  priorityLevel: number;
  progress: "to-do" | "in-progress" | "done" | "pending";
  boardId: number;
  tagIds: number[];
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<StoredTask[]>([]);
  const [editingTask, setEditingTask] = useState<StoredTask | null>(null);
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
      } catch (err) {
        console.error(err);
      }
    }

    const stored = JSON.parse(localStorage.getItem("tasks") || "[]");
    setTasks(stored);

    load();
  }, []);

  const handleSelectTask = (task: StoredTask) => {
    setEditingTask(task);
    setMode("edit");
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setMode("create");
  };

  /** Return to list and reload tasks */
  const returnToList = () => {
    const stored = JSON.parse(localStorage.getItem("tasks") || "[]");
    setTasks(stored);
    setMode("list");
  };

  /** LIST VIEW */
  if (mode === "list") {
    return (
      <div className="p-6 space-y-4">
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

          {tasks.map((t, index) => (
            <div
              key={index}
              onClick={() => handleSelectTask(t)}
              className="cursor-pointer border border-green-4 p-3 rounded-md hover:bg-beige transition"
            >
              <p className="font-medium">{t.name}</p>
              <p className="text-sm text-gray-500">
                Board ID: {t.boardId} – Priority: {t.priorityLevel} - Status:{" "}
                {t.progress}
                <br></br>
                {t.description}
                <br></br>
                {t.dueDate}
              </p>
              <div>
                {t.tagIds.map((id) => (
                  <div>{id}</div>
                ))}
              </div>
            </div>
          ))}
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
    // Convert stored task shape into the shape TaskProvider expects
    const convertedTask: Task = {
      id: editingTask.id,
      name: editingTask.name,
      description: editingTask.description,
      dueDate: editingTask.dueDate ? new Date(editingTask.dueDate) : new Date(),
      priorityLevel: editingTask.priorityLevel,
      progress: editingTask.progress,
      board: boards.find((b) => b.id == editingTask.id) || {
        id: editingTask.boardId,
        name: "Loaded Board",
        color: "#ccc",
      },
      tags: tags.filter((t) => editingTask.tagIds.includes(t.id)),
    };

    return (
      <div className="h-full">
        <TaskProvider task={convertedTask}>
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
