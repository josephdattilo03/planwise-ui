"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import CalendarFilterComponent from "../../components/calendar/CalendarFilterComponent";
import { FiltersProvider } from "../../providers/filters/FiltersContext";
import { Task } from "../../types/task";
import { Board } from "../../types/board";
import { Tag } from "../../types/tag";
import { fetchBoards } from "../../services/boards/boardService";
import { fetchTags } from "../../services/tags/tagService";
import { fetchTasks } from "../../services/tasks/taskService";

const CalendarView = dynamic(
  () => import("../../components/calendar/CalendarView"),
  { ssr: false }
);

// Convert tasks to calendar events
const convertTasksToEvents = (tasks: Task[], boards: Board[]) => {
  return tasks.map((task) => {
    const boardObj = boards.find(b => b.id === task.board.id);
    const boardName = boardObj ? boardObj.name.toLowerCase() : task.board.name.toLowerCase();
    return {
      title: `📋 ${task.name}`,
      start: task.dueDate,
      end: task.dueDate,
      resource: {
        board: boardName,
        color: getBoardHexColor(boardName, boards),
        type: 'task' as const,
        task,
      },
    };
  });
};

const getBoardHexColor = (boardName: string, boards: Board[]): string => {
  const boardObj = boards.find(b => b.name.toLowerCase() === boardName);
  return boardObj?.color || "#4CAF50"; // default green
};

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [boardData, tagData] = await Promise.all([
          fetchBoards(),
          fetchTags(),
        ]);

        setBoards(boardData);
        setTags(tagData);

        const taskData = await fetchTasks(boardData, tagData);
        setTasks(taskData);
      } catch (err) {
        console.error("Failed to load calendar data:", err);
      }
    }

    loadData();
  }, []);

  const taskEvents = convertTasksToEvents(tasks, boards);

  return (
    <div className="flex flex-row w-full h-full">
      <FiltersProvider>
        <CalendarFilterComponent />
        <div className="flex-1 p-4">
          <div className="w-full h-full">
            <CalendarView taskEvents={taskEvents} />
          </div>
        </div>
      </FiltersProvider>
    </div>
  );
}
