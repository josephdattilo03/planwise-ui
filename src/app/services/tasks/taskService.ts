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
        tagIds: task.tags.map(tag => tag.id),
    };
}

export async function fetchTasks(boards: Board[], tags: Tag[]): Promise<Task[]> {
    await new Promise((r) => setTimeout(r, 500)); // simulates network delay

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

export function getTaskById(taskId: number, boards: Board[], tags: Tag[]): Task | null {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const rawTask = tasks.find((t: any) => t.id === taskId);
    
    return rawTask ? toTask(rawTask, boards, tags) : null;
}