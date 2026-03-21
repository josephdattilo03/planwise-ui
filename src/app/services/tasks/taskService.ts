import { Task } from "../../types/task";
import { Board } from "../../types/board";
import { Tag } from "../../types/tag";
import { getDataMode } from "../dataMode";

const BACKEND_PROXY_PREFIX = "/api/backend";

function backendUrl(path: string) {
  return `${BACKEND_PROXY_PREFIX}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function backendJSON<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(backendUrl(path), init);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Backend request failed (${res.status})`);
  }
  return JSON.parse(text) as T;
}

function toTask(raw: any, boards: Board[], tags: Tag[]): Task {
  return {
    id: String(raw.id),
    name: raw.name ?? "Untitled Task",
    description: raw.description ?? "",
    progress: raw.progress ?? "to-do",
    priorityLevel: raw.priorityLevel ?? 0,
    dueDate: new Date(raw.dueDate),
    board: boards.find((b) => b.id === raw.boardId) || {
      id: raw.boardId,
      name: "Unknown Board",
      color: "#ccc",
    },
    tags: tags.filter((tag) => raw.tagIds?.includes(tag.id)) || [],
  };
}

function toRawTask(task: Task): any {
  return {
    id: task.id,
    name: task.name,
    description: task.description,
    progress: task.progress,
    priorityLevel: task.priorityLevel,
    dueDate: task.dueDate.toISOString(),
    boardId: task.board.id,
    tagIds: task.tags.map((tag) => tag.id),
  };
}

export async function fetchTasks(
  userId: string | undefined,
  boards: Board[],
  tags: Tag[]
): Promise<Task[]> {

  if (getDataMode() !== "mock") {
    if (!userId) {
      throw new Error("fetchTasks(userId, boards, tags) requires userId in backend mode");
    }
    return fetchTasksByUser(userId, boards, tags);
  }

  const dummyTasks = [
    // Website Redesign board (board-1)
    {
      id: "1",
      name: "Design homepage mockup",
      description:
        "Create wireframes and high-fidelity mockups for the new homepage",
      progress: "done",
      priorityLevel: 2,
      dueDate: new Date().toISOString(),
      boardId: "board-1",
      tagIds: ["1", "2"],
    },
    {
      id: "2",
      name: "Implement responsive navbar",
      description: "Build mobile-first navigation component",
      progress: "in-progress",
      priorityLevel: 2,
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      boardId: "board-1",
      tagIds: ["2", "5"],
    },
    {
      id: "3",
      name: "Fix footer alignment bug",
      description: "Footer links not aligned on mobile",
      progress: "to-do",
      priorityLevel: 1,
      dueDate: new Date(Date.now() + 172800000).toISOString(),
      boardId: "board-1",
      tagIds: ["3", "7"],
    },
    {
      id: "4",
      name: "User testing feedback",
      description: "Waiting for stakeholder review",
      progress: "pending",
      priorityLevel: 1,
      dueDate: new Date(Date.now() + 259200000).toISOString(),
      boardId: "board-1",
      tagIds: ["4"],
    },

    // Mobile App board (board-2)
    {
      id: "5",
      name: "Setup React Native project",
      description: "Initialize project with Expo",
      progress: "done",
      priorityLevel: 2,
      dueDate: new Date().toISOString(),
      boardId: "board-2",
      tagIds: ["5"],
    },
    {
      id: "6",
      name: "Implement push notifications",
      description: "Integrate with Firebase Cloud Messaging",
      progress: "to-do",
      priorityLevel: 3,
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      boardId: "board-2",
      tagIds: ["6"],
    },
    {
      id: "7",
      name: "App store screenshots",
      description: "Create promotional screenshots for app stores",
      progress: "to-do",
      priorityLevel: 1,
      dueDate: new Date(Date.now() + 432000000).toISOString(),
      boardId: "board-2",
      tagIds: ["7"],
    },

    // Quick Notes board (board-3)
    {
      id: "8",
      name: "Research competitor apps",
      description: "Analyze top 5 competing apps",
      progress: "in-progress",
      priorityLevel: 1,
      dueDate: new Date(Date.now() + 604800000).toISOString(),
      boardId: "board-3",
      tagIds: ["8"],
    },
    {
      id: "9",
      name: "Meeting notes: Sprint planning",
      description: "Document action items from sprint planning",
      progress: "done",
      priorityLevel: 0,
      dueDate: new Date().toISOString(),
      boardId: "board-3",
      tagIds: ["9"],
    },
  ];

  if (
    !localStorage.getItem("tasks") ||
    JSON.parse(localStorage.getItem("tasks") || "[]").length === 0
  ) {
    localStorage.setItem("tasks", JSON.stringify(dummyTasks));
  }

  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  return tasks.map((raw: any) => toTask(raw, boards, tags));
}

export async function fetchTasksByUser(
  userId: string,
  boards: Board[],
  tags: Tag[]
): Promise<Task[]> {
  const rawTasks = await backendJSON<any[]>(
    `/user/${encodeURIComponent(userId)}/task/`,
    { method: "GET" }
  );

  const boardById = new Map(boards.map((b) => [b.id, b]));
  const tagById = new Map(tags.map((t) => [t.id, t]));

  return rawTasks.map((rt: any) => {
    const board = boardById.get(rt.board_id) || {
      id: rt.board_id,
      name: "Unknown Board",
      color: "#ccc",
    };

    const mappedTags: Tag[] = (rt.tag_ids || []).map((tid: any) => {
      const found = tagById.get(String(tid));
      return (
        found || {
          id: String(tid),
          name: "Unknown",
          backgroundColor: "#e5e5e5",
          borderColor: "#bdbdbd",
          textColor: "#333333",
        }
      );
    });

    return {
      id: String(rt.id),
      name: rt.name ?? "Untitled Task",
      description: rt.description ?? "",
      progress: rt.progress ?? "to-do",
      priorityLevel: Number(rt.priority_level ?? 0),
      dueDate: new Date(`${rt.due_date}T00:00:00`),
      board,
      tags: mappedTags,
    };
  });
}

export async function createTask(
  taskData: Partial<Task>,
  userId?: string
): Promise<Task> {
  if (getDataMode() === "mock") {
    return createTaskMock(taskData);
  }
  if (!userId) {
    throw new Error("createTask requires userId in backend mode");
  }

  const payload: any = {
    board_id: taskData.board?.id,
    user_id: userId,
    name: taskData.name ?? "New Task",
    description: taskData.description ?? "",
    progress: taskData.progress ?? "to-do",
    priority_level: taskData.priorityLevel ?? 0,
    due_date: (taskData.dueDate ?? new Date())
      .toISOString()
      .split("T")[0],
    tag_ids: (taskData.tags ?? []).map((t) => t.id),
  };

  if (taskData.id) {
    payload.id = taskData.id;
  }

  const res = await backendJSON<{ task_id?: string }>(
    `/board/task`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  return {
    id: String(res.task_id ?? payload.id ?? ""),
    name: payload.name,
    description: payload.description,
    progress: payload.progress,
    priorityLevel: payload.priority_level,
    dueDate: new Date(`${payload.due_date}T00:00:00`),
    board:
      taskData.board ?? { id: payload.board_id, name: "Unknown Board", color: "#ccc" },
    tags: (taskData.tags ?? []) as Tag[],
  };
}

function createTaskMock(taskData: Partial<Task>): Task {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

  const newTask: Task = {
    id: String(Date.now()),
    name: taskData.name ?? "New Task",
    description: taskData.description ?? "",
    progress: taskData.progress ?? "to-do",
    priorityLevel: taskData.priorityLevel ?? 0,
    dueDate: taskData.dueDate ?? new Date(),
    board: taskData.board ?? { id: "", name: "Unknown Board", color: "#ccc" },
    tags: taskData.tags ?? [],
  };

  const rawTask = toRawTask(newTask);
  const updated = [...tasks, rawTask];

  localStorage.setItem("tasks", JSON.stringify(updated));
  return newTask;
}

export async function updateTask(
  updatedTask: Task,
  userId?: string
): Promise<Task> {
  if (getDataMode() === "mock") {
    return updateTaskMock(updatedTask);
  }
  if (!userId) {
    throw new Error("updateTask requires userId in backend mode");
  }

  const payload: any = {
    id: updatedTask.id,
    board_id: updatedTask.board.id,
    user_id: userId,
    name: updatedTask.name,
    description: updatedTask.description,
    progress: updatedTask.progress,
    priority_level: updatedTask.priorityLevel,
    due_date: updatedTask.dueDate.toISOString().split("T")[0],
    tag_ids: updatedTask.tags.map((t) => t.id),
  };

  const res = await backendJSON<{ task_id?: string }>(
    `/board/${encodeURIComponent(updatedTask.board.id)}/task/${encodeURIComponent(
      updatedTask.id
    )}`,
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  return {
    ...updatedTask,
    id: String(res.task_id ?? updatedTask.id),
  };
}

function updateTaskMock(updatedTask: Task): Task {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

  const updated = tasks.map((t: any) =>
    t.id === updatedTask.id ? toRawTask(updatedTask) : t
  );

  localStorage.setItem("tasks", JSON.stringify(updated));
  return updatedTask;
}

export function deleteTask(taskId: string): void {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

  const updated = tasks.filter((t: any) => t.id !== taskId);

  localStorage.setItem("tasks", JSON.stringify(updated));
}

export function getTaskById(
  taskId: string,
  boards: Board[],
  tags: Tag[]
): Task | null {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const rawTask = tasks.find((t: any) => t.id === taskId);

  return rawTask ? toTask(rawTask, boards, tags) : null;
}
