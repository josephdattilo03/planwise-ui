"use client";

import React from "react";
import { BoardCard } from "./BoardCard";
import { Task } from "../../types/task";

interface BoardCardListProps {
  tasks: Task[];
  progress: Task["progress"];
  onSelectTask?: (task: Task) => void;
  onMoveTask?: (taskId: string, toProgress: Task["progress"]) => void;
}

export const BoardCardList = ({
  tasks,
  progress,
  onSelectTask,
  onMoveTask,
}: BoardCardListProps) => {
  return (
    <div
      className="overflow-y-auto flex-1 py-2"
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        const taskId = e.dataTransfer.getData("text/plain");
        if (!taskId) return;
        onMoveTask?.(taskId, progress);
      }}
    >
      {tasks.map((task) => (
        <BoardCard
          key={task.id}
          task={task}
          onClick={onSelectTask}
          onDragStart={(t, event) => {
            event.dataTransfer.setData("text/plain", t.id);
          }}
        />
      ))}
      {tasks.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No tasks in this column
        </div>
      )}
    </div>
  );
};
