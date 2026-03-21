import { WorkspaceNode, FolderNode, BoardNode } from "../../types/workspace";
import { Board } from "../../types/board";
import { getDataMode } from "../dataMode";

function toFolderNode(raw: any): FolderNode {
  return {
    id: raw.id,
    name: raw.name ?? "Untitled Folder",
    parentId: raw.parentId ?? null,
    children: [],
    type: "folder",
    depth: raw.depth,
    path: raw.path,
  };
}

function toBoardNode(raw: any): BoardNode {
  return {
    parentId: raw.parentId,
    board: {
      id: raw.board.id,
      name: raw.board.name ?? "Untitled Board",
      color: raw.board.color ?? "#4a7c59",
    },
    type: "board",
  };
}

const BACKEND_PROXY_PREFIX = "/api/backend";

function backendUrl(path: string) {
  return `${BACKEND_PROXY_PREFIX}${path.startsWith("/") ? "" : "/"}${path}`;
}

function toPathPlus(path: string) {
  // pathPlus comes from backend folder.path (which commonly starts with `/`).
  // API Gateway uses `{path+}` where slashes separate segments, so we must keep
  // slashes as slashes in the URL and only encode individual segments.
  const trimmed = path.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!trimmed) return "";
  return trimmed
    .split("/")
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

async function backendJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(backendUrl(path), init);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Backend request failed (${res.status})`);
  }
  return JSON.parse(text) as T;
}

async function fetchRootFolderMock(): Promise<FolderNode | null> {
  await new Promise((r) => setTimeout(r, 500));

  const folders = JSON.parse(localStorage.getItem("folders") || "[]");

  // Initialize with sample data if empty
  if (folders.length === 0) {
    const raw = [
      { id: "root", name: "My Workspace", parentId: null },
      { id: "folder-1", name: "Projects", parentId: "root" },
      { id: "folder-2", name: "Archive", parentId: "root" },
      { id: "folder-3", name: "2024", parentId: "folder-2" },
    ];
    localStorage.setItem("folders", JSON.stringify(raw));

    const boards = [
      {
        parentId: "folder-1",
        board: { id: "board-1", name: "Senior Design", color: "#A7C957" },
      },
      {
        parentId: "folder-1",
        board: { id: "board-2", name: "PennOS", color: "#FFA500" },
      },
      {
        parentId: "folder-1",
        board: { id: "board-3", name: "DSGN 1070", color: "#E4CCFD" },
      },
      {
        parentId: "root",
        board: { id: "board-5", name: "Personal", color: "#9BF2FF" },
      },
      {
        parentId: "root",
        board: { id: "board-4", name: "House", color: "#1E40AF" },
      },
      {
        parentId: "root",
        board: { id: "board-6", name: "Recruiting", color: "#9AC2FF" },
      },
      {
        parentId: "root",
        board: { id: "board-7", name: "Grad School", color: "#2AC200" },
      },
    ];
    localStorage.setItem("boardNodes", JSON.stringify(boards));

    return toFolderNode(raw[0]);
  }

  const rootFolder = folders.find((f: any) => f.parentId === null);
  return rootFolder ? toFolderNode(rootFolder) : null;
}

export async function fetchRootFolder(userId?: string): Promise<FolderNode | null> {
  if (getDataMode() === "mock") {
    return fetchRootFolderMock();
  }
  if (!userId) {
    return null;
  }

  const roots = await backendJSON<any[]>(
    `/user/${encodeURIComponent(userId)}/folder/0/root`,
    { method: "GET" }
  );
  const root = roots[0];
  if (!root) return null;
  return {
    id: root.id,
    parentId: null,
    name: root.name,
    children: [],
    type: "folder",
    depth: root.depth,
    path: root.path,
  };
}

export async function fetchChildrenByParentId(
  parentId: string,
  userId?: string
): Promise<WorkspaceNode[]> {
  if (getDataMode() === "mock") {
    await new Promise((r) => setTimeout(r, 500)); // simulates network delay

    const folders = JSON.parse(localStorage.getItem("folders") || "[]");
    const boardNodes = JSON.parse(localStorage.getItem("boardNodes") || "[]");

    const childFolders = folders
      .filter((f: any) => f.parentId === parentId)
      .map(toFolderNode);

    const childBoards = boardNodes
      .filter((b: any) => b.parentId === parentId)
      .map(toBoardNode);

    return [...childFolders, ...childBoards];
  }

  if (!userId) {
    return [];
  }

  const parentFolder = await backendJSON<any>(
    `/user/${encodeURIComponent(userId)}/folder/${encodeURIComponent(
      parentId
    )}`,
    { method: "GET" }
  );

  const parentDepth = Number(parentFolder.depth ?? 0);
  const parentPathPlus = toPathPlus(String(parentFolder.path ?? ""));

  const childFolderDepth = parentDepth + 1;

  const foldersPathPart =
    parentPathPlus === ""
      ? `/user/${encodeURIComponent(userId)}/folder/${childFolderDepth}/`
      : `/user/${encodeURIComponent(userId)}/folder/${childFolderDepth}/${parentPathPlus}`;

  const boardsPathPart =
    parentPathPlus === ""
      ? `/user/${encodeURIComponent(userId)}/board/${parentDepth}/`
      : `/user/${encodeURIComponent(
          userId
        )}/board/${parentDepth}/${parentPathPlus}`;

  const [childFoldersRaw, boardsRaw] = await Promise.all([
    backendJSON<any[]>(foldersPathPart, { method: "GET" }),
    backendJSON<any[]>(boardsPathPart, { method: "GET" }),
  ]);

  const childFolders: WorkspaceNode[] = childFoldersRaw.map((f: any) => ({
    id: f.id,
    parentId,
    name: f.name,
    children: [],
    type: "folder",
    depth: f.depth,
    path: f.path,
  }));

  const childBoards: WorkspaceNode[] = boardsRaw.map((b: any) => ({
    parentId,
    type: "board",
    board: { id: b.id, name: b.name, color: b.color },
  }));

  return [...childFolders, ...childBoards];
}

export async function fetchAllFolders(userId?: string): Promise<FolderNode[]> {
  if (getDataMode() === "mock") {
    await new Promise((r) => setTimeout(r, 500)); // simulates network delay
    const folders = JSON.parse(localStorage.getItem("folders") || "[]");
    return folders.map(toFolderNode);
  }
  if (!userId) {
    return [];
  }

  const folders = await backendJSON<any[]>(
    `/user/${encodeURIComponent(userId)}/folder/`,
    { method: "GET" }
  );

  const mapped = folders.map((f: any) => ({
    id: String(f.id),
    name: f.name ?? "Untitled Folder",
    parentId: f.parent_id ?? null,
    children: [],
    type: "folder",
    depth: f.depth,
    path: f.path,
  })) as FolderNode[];

  const byId = new Map<string, FolderNode>();
  for (const folder of mapped) {
    byId.set(folder.id, folder);
  }

  // Keep root available in selector even if backend list omits it.
  if (!byId.has("root")) {
    byId.set("root", {
      id: "root",
      name: "My Workspace",
      parentId: null,
      children: [],
      type: "folder",
      depth: 0,
      path: "/root",
    });
  }

  return Array.from(byId.values()).sort((a, b) => {
    const depthA = Number(a.depth ?? 0);
    const depthB = Number(b.depth ?? 0);
    if (depthA !== depthB) return depthA - depthB;
    return a.name.localeCompare(b.name);
  });
}

export async function fetchAllBoardNodes(
  userId?: string
): Promise<BoardNode[]> {
  if (getDataMode() === "mock") {
    await new Promise((r) => setTimeout(r, 500)); // simulates network delay
    const boardNodes = JSON.parse(localStorage.getItem("boardNodes") || "[]");
    return boardNodes.map(toBoardNode);
  }
  if (!userId) {
    return [];
  }

  const boards = await backendJSON<any[]>(
    `/user/${encodeURIComponent(userId)}/board/0/root`,
    { method: "GET" }
  );

  return boards.map((b: any) => ({
    parentId: "root",
    type: "board",
    board: { id: b.id, name: b.name, color: b.color },
  })) as BoardNode[];
}

export function createFolder(data: Partial<FolderNode>): FolderNode {
  const folders = JSON.parse(localStorage.getItem("folders") || "[]");

  const newFolder: FolderNode = {
    id: `folder-${Date.now()}`,
    name: data.name ?? "New Folder",
    parentId: data.parentId ?? null,
    children: [],
    type: "folder",
  };

  const updated = [
    ...folders,
    {
      id: newFolder.id,
      name: newFolder.name,
      parentId: newFolder.parentId,
    },
  ];

  localStorage.setItem("folders", JSON.stringify(updated));
  return newFolder;
}

export function createBoardNode(parentId: string, board: Board): BoardNode {
  const boardNodes = JSON.parse(localStorage.getItem("boardNodes") || "[]");

  const newBoardNode: BoardNode = {
    parentId,
    board,
    type: "board",
  };

  const updated = [
    ...boardNodes,
    {
      parentId: newBoardNode.parentId,
      board: newBoardNode.board,
    },
  ];

  localStorage.setItem("boardNodes", JSON.stringify(updated));
  return newBoardNode;
}

export function updateFolder(updatedFolder: FolderNode) {
  const folders = JSON.parse(localStorage.getItem("folders") || "[]");

  const updated = folders.map((f: any) =>
    f.id === updatedFolder.id
      ? {
          id: updatedFolder.id,
          name: updatedFolder.name,
          parentId: updatedFolder.parentId,
        }
      : f
  );

  localStorage.setItem("folders", JSON.stringify(updated));
  return updated;
}

export function moveBoardNode(boardId: string, newParentId: string) {
  const boardNodes = JSON.parse(localStorage.getItem("boardNodes") || "[]");

  const updated = boardNodes.map((b: any) =>
    b.board.id === boardId ? { ...b, parentId: newParentId } : b
  );

  localStorage.setItem("boardNodes", JSON.stringify(updated));
  return updated;
}

export function deleteFolder(folderId: string) {
  const folders = JSON.parse(localStorage.getItem("folders") || "[]");
  const boardNodes = JSON.parse(localStorage.getItem("boardNodes") || "[]");

  // Get all descendant folder IDs recursively
  const getDescendantIds = (id: string): string[] => {
    const children = folders.filter((f: any) => f.parentId === id);
    return [
      id,
      ...children.flatMap((child: any) => getDescendantIds(child.id)),
    ];
  };

  const idsToRemove = getDescendantIds(folderId);

  // Remove folders and their board nodes
  const updatedFolders = folders.filter(
    (f: any) => !idsToRemove.includes(f.id)
  );
  const updatedBoardNodes = boardNodes.filter(
    (b: any) => !idsToRemove.includes(b.parentId)
  );

  localStorage.setItem("folders", JSON.stringify(updatedFolders));
  localStorage.setItem("boardNodes", JSON.stringify(updatedBoardNodes));

  return { folders: updatedFolders, boardNodes: updatedBoardNodes };
}

export function deleteBoardNode(boardId: string) {
  const boardNodes = JSON.parse(localStorage.getItem("boardNodes") || "[]");

  const updated = boardNodes.filter((b: any) => b.board.id !== boardId);

  localStorage.setItem("boardNodes", JSON.stringify(updated));
  return updated;
}
