"use client";

import React, { useEffect, useState } from "react";
import { Divider, Paper } from "@mui/material";
import { ColHeader } from "./ColHeader";
import { ColFooter } from "./ColFooter";
import { BoardCardList } from "./BoardCardList";
import { Task } from "../../types/task";
import { Board } from "../../types/board";
import { fetchTasks, createTask } from "../../services/tasks/taskService";
import { fetchTags } from "../../services/tags/tagService";
import { Tag } from "../../types/tag";
import { useSession } from "next-auth/react";
import { fetchBoards } from "../../services/boards/boardService";
import LoadingSpinner from "@/src/common/LoadingSpinner";
import { useBoardsTags } from "../../providers/boardsTags/BoardsTagsContext";

interface BoardDisplayPageProps {
  boardId: string;
}

const COLUMNS: Task["progress"][] = ["to-do", "in-progress", "done", "pending"];

const BoardDisplayPage = ({ boardId }: BoardDisplayPageProps) => {
  const { boards, tags, loading: boardsTagsLoading } = useBoardsTags();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const {data: session} = useSession()
  const email = session?.user?.email as string

  /** Load tasks once boards/tags are ready (from preload); filter by selected board */
  useEffect(() => {
    if (boardsTagsLoading) return;
    let cancelled = false;
    async function loadTasks() {
      try {
        setTasksLoading(true);
        const fetchedTasks = await fetchTasks(email, boards, tags);
        if (!cancelled) {
          const filteredTasks = fetchedTasks.filter(
            (task) => task.board.id === boardId
          );
          setTasks(filteredTasks);
        }
      } catch (error) {
        console.error("Error loading board data:", error);
      } finally {
        if (!cancelled) setTasksLoading(false);
      }
    }
    loadTasks();
    return () => {
      cancelled = true;
    };
  }, [boardId, boardsTagsLoading, boards, tags, email]);

  const getTasksByProgress = (progress: Task["progress"]): Task[] => {
    return tasks.filter((task) => task.progress === progress);
  };

  const handleAddTask = (progress: Task["progress"]) => (title: string) => {
    const currentBoard = boards.find((b) => b.id === boardId);
    if (!currentBoard) return;

    const newTask = createTask(email, {
      name: title,
      progress,
      board: currentBoard,
      dueDate: new Date(),
      tags: [],
    });

    setTasks((prev) => [...prev, newTask]);
  };

  const loading = boardsTagsLoading || tasksLoading;
  if (loading) {
    return (
      <div className="flex flex-1 h-full">
        <LoadingSpinner label="Loading board..." className="flex-1" />
      </div>
    );
  }

  const currentBoard = boards.find((b) => b.id === boardId);

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden content-fade-in">
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
              elevation={0}
              className="w-80 flex flex-col max-h-full overflow-hidden shrink-0 rounded-lg border border-card-border"
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
