import { Task } from "../../types/task";
import { Board } from "../../types/board";
import { Tag } from "../../types/tag";

function toTask(raw: any, boards: Board[], tags: Tag[]): Task {
  return {
    id: raw.id,
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
  boards: Board[],
  tags: Tag[]
): Promise<Task[]> {
  await new Promise((r) => setTimeout(r, 500)); // simulates network delay

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
      tagIds: [1, 2],
    },
    {
      id: "2",
      name: "Implement responsive navbar",
      description: "Build mobile-first navigation component",
      progress: "in-progress",
      priorityLevel: 2,
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      boardId: "board-1",
      tagIds: [2, 5],
    },
    {
      id: "3",
      name: "Fix footer alignment bug",
      description: "Footer links not aligned on mobile",
      progress: "to-do",
      priorityLevel: 1,
      dueDate: new Date(Date.now() + 172800000).toISOString(),
      boardId: "board-1",
      tagIds: [3, 7],
    },
    {
      id: "4",
      name: "User testing feedback",
      description: "Waiting for stakeholder review",
      progress: "pending",
      priorityLevel: 1,
      dueDate: new Date(Date.now() + 259200000).toISOString(),
      boardId: "board-1",
      tagIds: [4],
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
      tagIds: [5],
    },
    {
      id: "6",
      name: "Implement push notifications",
      description: "Integrate with Firebase Cloud Messaging",
      progress: "to-do",
      priorityLevel: 3,
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      boardId: "board-2",
      tagIds: [6],
    },
    {
      id: "7",
      name: "App store screenshots",
      description: "Create promotional screenshots for app stores",
      progress: "to-do",
      priorityLevel: 1,
      dueDate: new Date(Date.now() + 432000000).toISOString(),
      boardId: "board-2",
      tagIds: [7],
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
      tagIds: [8],
    },
    {
      id: "9",
      name: "Meeting notes: Sprint planning",
      description: "Document action items from sprint planning",
      progress: "done",
      priorityLevel: 0,
      dueDate: new Date().toISOString(),
      boardId: "board-3",
      tagIds: [9],
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

export function createTask(taskData: Partial<Task>): Task {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

  const newTask: Task = {
    id: Date.now(),
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

export function updateTask(updatedTask: Task): Task {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

  const updated = tasks.map((t: any) =>
    t.id === updatedTask.id ? toRawTask(updatedTask) : t
  );

  localStorage.setItem("tasks", JSON.stringify(updated));
  return updatedTask;
}

export function deleteTask(taskId: number): void {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

  const updated = tasks.filter((t: any) => t.id !== taskId);

  localStorage.setItem("tasks", JSON.stringify(updated));
}

export function getTaskById(
  taskId: number,
  boards: Board[],
  tags: Tag[]
): Task | null {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const rawTask = tasks.find((t: any) => t.id === taskId);

  return rawTask ? toTask(rawTask, boards, tags) : null;
}
