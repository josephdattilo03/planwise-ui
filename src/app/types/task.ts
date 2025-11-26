import { Board } from "./board";
import { Tag } from "./tag";

export interface Task {
  id: number;
  name: string;
  description: string;
  progress: "to-do" | "in-progress" | "done" | "pending";
  priorityLevel: number;
  dueDate: Date;
  board: Board;
  tags: Tag[];
}
