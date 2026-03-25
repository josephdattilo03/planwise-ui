"use client";

import React, { useEffect, useState } from "react";
import { Divider, Paper } from "@mui/material";
import { ColHeader } from "./ColHeader";
import { ColFooter } from "./ColFooter";
import { BoardCardList } from "./BoardCardList";
import { Task } from "../../types/task";
import { fetchTasks, createTask, updateTask } from "../../services/tasks/taskService";
import LoadingSpinner from "@/src/common/LoadingSpinner";
import { useBoardsTags } from "../../providers/boardsTags/BoardsTagsContext";
import { useSession } from "next-auth/react";
import { useTaskDrawer } from "../../providers/tasks/TaskDrawerContext";

interface BoardDisplayPageProps {
  boardId: string;
}

const COLUMNS: Task["progress"][] = ["to-do", "in-progress", "done", "pending"];

const BoardDisplayPage = ({ boardId }: BoardDisplayPageProps) => {
  const { boards, tags, loading: boardsTagsLoading } = useBoardsTags();
  const { data: session, status: sessionStatus } = useSession();
  const { openEdit, setOnSaveSuccessHandler } = useTaskDrawer();
  const userId = session?.user?.email ?? undefined;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  const refreshBoardTasks = React.useCallback(async () => {
    try {
      setTasksLoading(true);
      const fetchedTasks = await fetchTasks(userId, boards, tags);
      const filteredTasks = fetchedTasks.filter((task) => task.board.id === boardId);
      setTasks(filteredTasks);
    } catch (error) {
      console.error("Error loading board data:", error);
    } finally {
      setTasksLoading(false);
    }
  }, [boardId, boards, tags, userId]);

  /** Load tasks once boards/tags are ready (from preload); filter by selected board */
  useEffect(() => {
    if (boardsTagsLoading) return;
    if (sessionStatus === "loading") return;
    let cancelled = false;
    async function loadTasks() {
      try {
        setTasksLoading(true);
        const fetchedTasks = await fetchTasks(userId, boards, tags);
        if (!cancelled) {
          const filteredTasks = fetchedTasks.filter((task) => task.board.id === boardId);
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
  }, [boardId, boardsTagsLoading, boards, tags, userId, sessionStatus]);

  useEffect(() => {
    setOnSaveSuccessHandler(refreshBoardTasks);
    return () => setOnSaveSuccessHandler(null);
  }, [refreshBoardTasks, setOnSaveSuccessHandler]);

  const getTasksByProgress = (progress: Task["progress"]): Task[] => {
    return tasks.filter((task) => task.progress === progress);
  };

  const handleAddTask =
    (progress: Task["progress"]) =>
    async (title: string) => {
      const currentBoard = boards.find((b) => b.id === boardId);
      if (!currentBoard) return;

      const newTask = await createTask(
        {
          name: title,
          progress,
          board: currentBoard,
          dueDate: new Date(),
          tags: [],
        },
        userId
      );

      setTasks((prev) => [...prev, newTask]);
    };

  const handleMoveTask = async (taskId: string, toProgress: Task["progress"]) => {
    const movingTask = tasks.find((t) => t.id === taskId);
    if (!movingTask || movingTask.progress === toProgress) return;

    const prevTasks = tasks;
    const nextTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, progress: toProgress } : t
    );
    setTasks(nextTasks);

    try {
      await updateTask({ ...movingTask, progress: toProgress }, userId);
    } catch (error) {
      console.error("Failed to move task:", error);
      setTasks(prevTasks);
    }
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
              <BoardCardList
                tasks={columnTasks}
                progress={col}
                onSelectTask={openEdit}
                onMoveTask={handleMoveTask}
              />
              <Divider />
              <ColFooter onAddTask={handleAddTask(col)} />
            </Paper>
          );
        })}
      </div>
    </div>
  );
};

export default BoardDisplayPage;
