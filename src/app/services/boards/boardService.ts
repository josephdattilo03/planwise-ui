import { Board } from "../../types";
import { googleCalendarBoardIdForUser } from "../googleCalendarService";
import { backendJSON, backendUrl } from "../backendJson";
import { getDataMode } from "../dataMode";

const GOOGLE_CALENDAR_BOARD_COLOR = "#4285F4";

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

/**
 * All boards the user can scope filters to: API boards plus the virtual Google Calendar board
 * (`gcal:{email}`) used for imported calendar events, so calendar/tasks filters match fetchEvents.
 */
export async function fetchBoardsForFilters(userId?: string): Promise<Board[]> {
  const boards = await fetchBoards(userId);
  if (!userId) {
    return boards;
  }
  const gcalId = googleCalendarBoardIdForUser(userId);
  if (boards.some((b) => b.id === gcalId)) {
    return boards;
  }
  return [
    ...boards,
    {
      id: gcalId,
      name: "Google Calendar",
      color: GOOGLE_CALENDAR_BOARD_COLOR,
    },
  ];
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

  // Backend needs board `path` + `depth` under the parent folder (not the same as the folder row).
  const parentFolder = await backendJSON<any>(
    `/user/${encodeURIComponent(userId)}/folder/${encodeURIComponent(
      parentFolderId
    )}`,
    { method: "GET" }
  );

  const base = String(parentFolder.path ?? "/root").replace(/\/+$/, "");
  const segment =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "board";
  const boardPath = `${base}/${segment}-${Date.now().toString(36).slice(-8)}`;
  const boardDepth = Number(parentFolder.depth ?? 0) + 1;

  const res = await backendJSON<{ board_id?: string }>(`/user/board`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      name,
      color,
      path: boardPath,
      depth: boardDepth,
    }),
  });

  return {
    id: String(res.board_id ?? ""),
    name,
    color,
  };
}

export type BoardRecord = Board & { path: string; depth: number };

export async function fetchBoardById(
  userId: string,
  boardId: string
): Promise<BoardRecord> {
  if (getDataMode() === "mock") {
    const boards = JSON.parse(localStorage.getItem("boards") || "[]");
    const raw = boards.find((b: { id: string }) => b.id === boardId);
    if (!raw) {
      throw new Error("Board not found");
    }
    return {
      id: raw.id,
      name: raw.name,
      color: raw.color ?? "#4a7c59",
      path: "/mock",
      depth: 1,
    };
  }
  const raw = await backendJSON<any>(
    `/user/${encodeURIComponent(userId)}/board/${encodeURIComponent(boardId)}`,
    { method: "GET" }
  );
  return {
    id: raw.id,
    name: raw.name ?? "Untitled Board",
    color: raw.color ?? "#4a7c59",
    path: String(raw.path ?? ""),
    depth: Number(raw.depth ?? 0),
  };
}

export async function deleteBoard(userId: string, boardId: string): Promise<void> {
  if (getDataMode() === "mock") {
    const boards = JSON.parse(localStorage.getItem("boards") || "[]");
    localStorage.setItem(
      "boards",
      JSON.stringify(boards.filter((b: { id: string }) => b.id !== boardId))
    );
    const { deleteBoardNode } = await import("../folders/folderService");
    deleteBoardNode(boardId);
    return;
  }
  await backendJSON(
    `/user/${encodeURIComponent(userId)}/board/${encodeURIComponent(boardId)}`,
    { method: "DELETE" }
  );
}

export async function moveBoardToFolder(
  userId: string,
  boardId: string,
  newParentFolderId: string
): Promise<void> {
  if (getDataMode() === "mock") {
    const { moveBoardNode } = await import("../folders/folderService");
    moveBoardNode(boardId, newParentFolderId);
    return;
  }
  const [board, parent] = await Promise.all([
    backendJSON<any>(
      `/user/${encodeURIComponent(userId)}/board/${encodeURIComponent(boardId)}`,
      { method: "GET" }
    ),
    backendJSON<any>(
      `/user/${encodeURIComponent(userId)}/folder/${encodeURIComponent(
        newParentFolderId
      )}`,
      { method: "GET" }
    ),
  ]);
  const base = String(parent.path ?? "/root").replace(/\/+$/, "");
  const segment =
    String(board.name ?? "board")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "board";
  const newPath = `${base}/${segment}-${Date.now().toString(36).slice(-8)}`;
  const depth = Number(parent.depth ?? 0) + 1;
  await backendJSON(
    `/user/${encodeURIComponent(userId)}/board/${encodeURIComponent(boardId)}`,
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: boardId,
        user_id: userId,
        name: board.name,
        color: board.color,
        path: newPath,
        depth,
      }),
    }
  );
}
