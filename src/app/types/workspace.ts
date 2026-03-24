import { Board } from "./board";

export type WorkspaceNode = FolderNode | BoardNode 

export interface FolderNode {
  id: string;
  parentId: string | null;
  name: string;
  children: WorkspaceNode[];
  type: 'folder'
  // Backend mode metadata (optional for mock mode)
  depth?: number;
  path?: string;
}

export interface BoardNode {
  parentId: string;
  board: Board;
  type: 'board';
}

