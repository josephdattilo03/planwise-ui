"use client";

import React from "react";
import { BoardCard } from "./BoardCard";
import { Task } from "../../types/task";

interface BoardCardListProps {
  tasks: Task[];
}

export const BoardCardList = ({ tasks }: BoardCardListProps) => {
  return (
    <div className="overflow-y-auto flex-1 py-2">
      {tasks.map((task) => (
        <BoardCard key={task.id} task={task} />
      ))}
      {tasks.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No tasks in this column
        </div>
      )}
    </div>
  );
};
