import { Board } from "../../types";
import { getDataMode } from "../dataMode";

const BACKEND_PROXY_PREFIX = "/api/backend";

function backendUrl(path: string) {
  return `${BACKEND_PROXY_PREFIX}${path.startsWith("/") ? "" : "/"}${path}`;
}

function toBoard(raw: any): Board {
  return {
    id: raw.id,
    name: raw.name ?? "Untitled Board",
    color: raw.color ?? "#4a7c59",
  };
}

async function fetchBoardsMock(): Promise<Board[]> {
  await new Promise((r) => setTimeout(r, 500)); // simulates network delay

  if (localStorage.getItem("boards")) {
    return JSON.parse(localStorage.getItem("boards") || "[]").map(toBoard);
  }

  const raw = [
    { id: "board-1", name: "Senior Design", color: "#A7C957" },
    { id: "board-2", name: "PennOS", color: "#FFA500" },
    { id: "board-3", name: "DSGN 1070", color: "#E4CCFD" },
    { id: "board-4", name: "House", color: "#1E40AF" },
    { id: "board-5", name: "Personal", color: "#9BF2FF" },
    { id: "board-6", name: "Recruiting", color: "#9AC2FF" },
    { id: "board-7", name: "Grad School", color: "#2AC200" },
  ];

  localStorage.setItem("boards", JSON.stringify(raw));

  return raw.map(toBoard);
}

export async function fetchBoards(userId?: string): Promise<Board[]> {
  if (getDataMode() === "mock") {
    return fetchBoardsMock();
  }
  if (!userId) {
    return [];
  }

  const res = await fetch(
    backendUrl(`/user/${encodeURIComponent(userId)}/board/`),
    { method: "GET" }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch boards (${res.status})`);
  }
  const raw = (await res.json()) as any[];
  return raw.map(toBoard);
}

function createBoardMock(name: string, color: string): Board {
  // Get existing boards from localStorage
  const existingRaw = JSON.parse(localStorage.getItem("boards") || "[]");

  // Generate a unique ID
  const newId = `board-${Date.now()}`;

  const newBoard: Board = {
    id: newId,
    name,
    color,
  };

  // Add new board and save back to localStorage
  const updatedBoards = [...existingRaw, newBoard];
  localStorage.setItem("boards", JSON.stringify(updatedBoards));

  return newBoard;
}

async function backendJSON<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(backendUrl(path), init);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Backend request failed (${res.status})`);
  }
  return JSON.parse(text) as T;
}

export async function createBoard(
  name: string,
  color: string,
  userId?: string,
  parentFolderId?: string
): Promise<Board> {
  if (getDataMode() === "mock") {
    return createBoardMock(name, color);
  }
  if (!userId || !parentFolderId) {
    throw new Error("createBoard requires userId and parentFolderId in backend mode");
  }

  // Backend needs `path` + `depth`; fetch them from the selected parent folder.
  const parentFolder = await backendJSON<any>(
    `/user/${encodeURIComponent(userId)}/folder/${encodeURIComponent(
      parentFolderId
    )}`,
    { method: "GET" }
  );

  const res = await backendJSON<{ board_id?: string }>(`/user/board`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      name,
      color,
      path: parentFolder.path,
      depth: parentFolder.depth,
    }),
  });

  return {
    id: String(res.board_id ?? ""),
    name,
    color,
  };
}
