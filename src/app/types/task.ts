import { Board } from "./board";
import { Tag } from "./tag";

export interface Task {
    name : string;
    progress : "to-do" | "in-progress" | "done"
    priorityLevel: number;
    dueDate: Date;
    board: Board
    tags: Tag[]
}
