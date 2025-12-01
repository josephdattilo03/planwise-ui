import { WorkspaceNode, FolderNode, BoardNode } from "../../types/workspace";
import { Board } from "../../types/board";

function toFolderNode(raw: any): FolderNode {
  return {
    id: raw.id,
    name: raw.name ?? "Untitled Folder",
    parentId: raw.parentId ?? null,
    children: [],
    type: "folder",
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

export async function fetchRootFolder(): Promise<FolderNode | null> {
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
        board: { id: "board-2", name: "Mobile App", color: "#10b981" },
      },
      {
        parentId: "root",
        board: { id: "board-3", name: "Quick Notes", color: "#8b5cf6" },
      },
    ];
    localStorage.setItem("boardNodes", JSON.stringify(boards));

    return toFolderNode(raw[0]);
  }

  const rootFolder = folders.find((f: any) => f.parentId === null);
  return rootFolder ? toFolderNode(rootFolder) : null;
}

export async function fetchChildrenByParentId(
  parentId: string
): Promise<WorkspaceNode[]> {
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

export async function fetchAllFolders(): Promise<FolderNode[]> {
  await new Promise((r) => setTimeout(r, 500)); // simulates network delay

  const folders = JSON.parse(localStorage.getItem("folders") || "[]");
  return folders.map(toFolderNode);
}

export async function fetchAllBoardNodes(): Promise<BoardNode[]> {
  await new Promise((r) => setTimeout(r, 500)); // simulates network delay

  const boardNodes = JSON.parse(localStorage.getItem("boardNodes") || "[]");
  return boardNodes.map(toBoardNode);
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
