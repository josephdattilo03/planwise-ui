import { Board } from "./board";

export type Node = FolderNode | Board;

export interface FolderNode {
  id: number;
  type: "folder";
  name: string;
  children: Node[];
}

export interface BoardNode {
  id: number;
  type: "board";
  board: Board;
}
