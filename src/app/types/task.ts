import { Board } from "./board";
import { Tag } from "./tag";

export interface Task {
  id: string;
  name: string;
  description: string;
  progress: "to-do" | "in-progress" | "done" | "pending";
  priorityLevel: number;
  dueDate: Date;
  board: Board;
  userId: string;
  tags: Tag[];
}
