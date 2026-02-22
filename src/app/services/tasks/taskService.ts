import { Task } from "../../types/task";
import { Board } from "../../types/board";
import { Tag } from "../../types/tag";
import { API_BASE, ROUTES } from "../../utils/routes";

function toTask(raw: any, boards: Board[], tags: Tag[]): Task {
  return {
    id: raw.id,
    name: raw.name ?? "Untitled Task",
    userId: raw.user_id,
    description: raw.description ?? "",
    progress: raw.progress ?? "to-do",
    priorityLevel: raw.priority_level ?? 0,
    dueDate: new Date(raw.due_date),
    board: boards.find((b) => b.id === raw.board_id) || {
      id: raw.board_id,
      name: "Unknown Board",
      color: "#ccc",
    },
    tags: tags.filter((tag) => raw.tag_ids?.includes(tag.id)) || [],
  };
}

function toRawTask(task: Task): any {
  return {
    name: task.name,
    user_id: task.userId,
    description: task.description,
    progress: task.progress,
    priority_level: task.priorityLevel,
    due_date: task.dueDate.toISOString().slice(0, 10),
    board_id: task.board.id,
    tag_ids: task.tags.map((tag) => tag.id),
  };
}

export async function fetchTasks(email: string, boards: Board[], tags: Tag[]): Promise<Task[]> {
  if (!email) {
    return []
  }
  const res = await fetch(
    `${API_BASE}${ROUTES.userTasks(email)}`,
    {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    }
  );
  
  if (!res.ok) {
    throw new Error(`Failed to fetch boards: ${res.status} ${res.statusText}`);
  }
  
  const raw = await res.json();
  return raw.map((task: any) => toTask(task, boards, tags)) 
}

// export async function fetchTasks(
//   boards: Board[],
//   tags: Tag[]
// ): Promise<Task[]> {
//   await new Promise((r) => setTimeout(r, 500)); // simulates network delay

//   const dummyTasks = [
//     // Website Redesign board (board-1)
//     {
//       id: "1",
//       name: "Design homepage mockup",
//       description:
//         "Create wireframes and high-fidelity mockups for the new homepage",
//       progress: "done",
//       priorityLevel: 2,
//       dueDate: new Date().toISOString(),
//       boardId: "393c259d-763c-491d-9596-4039f7384001",
//       tagIds: [1, 2],
//     },
//     {
//       id: "2",
//       name: "Implement responsive navbar",
//       description: "Build mobile-first navigation component",
//       progress: "in-progress",
//       priorityLevel: 2,
//       dueDate: new Date(Date.now() + 86400000).toISOString(),
//       boardId: "board-1",
//       tagIds: [2, 5],
//     },
//     {
//       id: "3",
//       name: "Fix footer alignment bug",
//       description: "Footer links not aligned on mobile",
//       progress: "to-do",
//       priorityLevel: 1,
//       dueDate: new Date(Date.now() + 172800000).toISOString(),
//       boardId: "board-1",
//       tagIds: [3, 7],
//     },
//     {
//       id: "4",
//       name: "User testing feedback",
//       description: "Waiting for stakeholder review",
//       progress: "pending",
//       priorityLevel: 1,
//       dueDate: new Date(Date.now() + 259200000).toISOString(),
//       boardId: "board-1",
//       tagIds: [4],
//     },

//     // Mobile App board (board-2)
//     {
//       id: "5",
//       name: "Setup React Native project",
//       description: "Initialize project with Expo",
//       progress: "done",
//       priorityLevel: 2,
//       dueDate: new Date().toISOString(),
//       boardId: "board-2",
//       tagIds: [5],
//     },
//     {
//       id: "6",
//       name: "Implement push notifications",
//       description: "Integrate with Firebase Cloud Messaging",
//       progress: "to-do",
//       priorityLevel: 3,
//       dueDate: new Date(Date.now() + 86400000).toISOString(),
//       boardId: "board-2",
//       tagIds: [6],
//     },
//     {
//       id: "7",
//       name: "App store screenshots",
//       description: "Create promotional screenshots for app stores",
//       progress: "to-do",
//       priorityLevel: 1,
//       dueDate: new Date(Date.now() + 432000000).toISOString(),
//       boardId: "board-2",
//       tagIds: [7],
//     },

//     // Quick Notes board (board-3)
//     {
//       id: "8",
//       name: "Research competitor apps",
//       description: "Analyze top 5 competing apps",
//       progress: "in-progress",
//       priorityLevel: 1,
//       dueDate: new Date(Date.now() + 604800000).toISOString(),
//       boardId: "board-3",
//       tagIds: [8],
//     },
//     {
//       id: "9",
//       name: "Meeting notes: Sprint planning",
//       description: "Document action items from sprint planning",
//       progress: "done",
//       priorityLevel: 0,
//       dueDate: new Date().toISOString(),
//       boardId: "board-3",
//       tagIds: [9],
//     },
//   ];

//   if (
//     !localStorage.getItem("tasks") ||
//     JSON.parse(localStorage.getItem("tasks") || "[]").length === 0
//   ) {
//     localStorage.setItem("tasks", JSON.stringify(dummyTasks));
//   }

//   const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
//   return tasks.map((raw: any) => toTask(raw, boards, tags));
// }

export async function createTask(email: string, taskData: Partial<Task>): Promise<Task>{

  const newTask: Task = {
    id: "__new__",
    board: taskData.board ?? { id: "", name: "Unknown Board", color: "#ccc" },
    userId: email,
    name: taskData.name ?? "New Task",
    description: taskData.description ?? "",
    progress: taskData.progress ?? "to-do",
    priorityLevel: taskData.priorityLevel ?? 0,
    dueDate: taskData.dueDate ?? new Date(),
    tags: taskData.tags ?? [],
  };

  const rawTask = toRawTask(newTask);
  console.log(rawTask);
  try {
    const res = await fetch(`${API_BASE}${ROUTES.createTask}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rawTask),
    });
    console.log("POSTING TASK")
    console.log(res);
  } catch (err) {
    console.error("Failed to POST task:", err);
  }

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
