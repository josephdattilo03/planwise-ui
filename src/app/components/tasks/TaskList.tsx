import React from "react";
import { Task } from "../../types";
import TaskCard from "./TaskCard";

interface TaskListProps {
  taskList: Task[];
  onSelectTask?: (task: Task) => void; // Add this prop
}

export default function TaskList({ taskList, onSelectTask }: TaskListProps) {
  return (
    <div className="flex flex-col gap-2">
      {taskList.map((task, idx) => (
        <TaskCard
          key={idx}
          task={task}
          onClick={() => onSelectTask?.(task)} // Pass click handler
        />
      ))}
    </div>
  );
}
