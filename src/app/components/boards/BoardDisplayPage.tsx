"use client";

import React, { useEffect, useState } from "react";
import { Divider, Paper } from "@mui/material";
import { ColHeader } from "./ColHeader";
import { ColFooter } from "./ColFooter";
import { BoardCardList } from "./BoardCardList";
import { Task } from "../../types/task";
import { Board } from "../../types/board";
import { fetchTasks, createTask } from "../../services/tasks/taskService";
import { fetchBoards } from "../../services/boards/boardService";
import { fetchTags } from "../../services/tags/tagService";
import { Tag } from "../../types/tag";

interface BoardDisplayPageProps {
  boardId: string;
}

const COLUMNS: Task["progress"][] = ["to-do", "in-progress", "done", "pending"];

const BoardDisplayPage = ({ boardId }: BoardDisplayPageProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [fetchedBoards, fetchedTags] = await Promise.all([
          fetchBoards(),
          fetchTags(),
        ]);
        setBoards(fetchedBoards);
        setTags(fetchedTags);

        const fetchedTasks = await fetchTasks(fetchedBoards, fetchedTags);
        // Filter tasks by the selected board
        const filteredTasks = fetchedTasks.filter(
          (task) => task.board.id === boardId
        );
        setTasks(filteredTasks);
      } catch (error) {
        console.error("Error loading board data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [boardId]);

  const getTasksByProgress = (progress: Task["progress"]): Task[] => {
    return tasks.filter((task) => task.progress === progress);
  };

  const handleAddTask = (progress: Task["progress"]) => (title: string) => {
    const currentBoard = boards.find((b) => b.id === boardId);
    if (!currentBoard) return;

    const newTask = createTask({
      name: title,
      progress,
      board: currentBoard,
      dueDate: new Date(),
      tags: [],
    });

    setTasks((prev) => [...prev, newTask]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading board...</div>
      </div>
    );
  }

  const currentBoard = boards.find((b) => b.id === boardId);

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <div className="flex items-center gap-2 text-page-title pt-6 pb-2 px-6">
        <div
          className="w-(--text-page-title-font-size) h-(--text-page-title-font-size) rounded-full"
          style={{ background: currentBoard?.color || "#000" }}
        ></div>
        <p>{currentBoard?.name}</p>
      </div>
      <div className="flex gap-4 h-full pb-6 pt-2 px-6 overflow-x-scroll">
        {COLUMNS.map((col) => {
          const columnTasks = getTasksByProgress(col);
          return (
            <Paper
              key={col}
              elevation={2}
              className="w-80 flex flex-col max-h-full overflow-hidden shrink-0"
            >
              <ColHeader taskID={col} count={columnTasks.length} />
              <Divider />
              <BoardCardList tasks={columnTasks} />
              {/* <Divider />
              <ColFooter onAddTask={handleAddTask(column.id)} /> */}
            </Paper>
          );
        })}
      </div>
    </div>
  );
};

export default BoardDisplayPage;
