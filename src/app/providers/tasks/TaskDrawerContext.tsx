"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Task } from "../../types";

type TaskDrawerMode = "create" | "edit";

type TaskDrawerContextType = {
  isOpen: boolean;
  mode: TaskDrawerMode;
  task: Task | null;
  /**
   * Increments whenever we need to hard-reset the form UI.
   * Used as a React `key` to force remounting and discard unsaved edits.
   */
  instanceId: number;

  openCreate: () => void;
  openEdit: (task: Task) => void;
  close: () => void;

  /**
   * Register a handler that should run after a successful save.
   * Useful so the current page can refresh its local data.
   */
  setOnSaveSuccessHandler: (
    handler: (() => void | Promise<void>) | null
  ) => void;

  runOnSaveSuccessHandler: () => void;
};

const TaskDrawerContext = createContext<TaskDrawerContextType | undefined>(
  undefined
);

export function TaskDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<TaskDrawerMode>("create");
  const [task, setTask] = useState<Task | null>(null);
  const [instanceId, setInstanceId] = useState(0);

  // Ref avoids forcing re-renders when handler changes.
  const onSaveSuccessRef = useRef<(() => void | Promise<void>) | null>(null);

  const openCreate = useCallback(() => {
    setTask(null);
    setMode("create");
    setIsOpen(true);
    setInstanceId((x) => x + 1);
  }, []);

  const openEdit = useCallback((t: Task) => {
    setTask(t);
    setMode("edit");
    setIsOpen(true);
    setInstanceId((x) => x + 1);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Reset any unsaved edits next time it opens.
    setInstanceId((x) => x + 1);
  }, []);

  const setOnSaveSuccessHandler = useCallback(
    (handler: (() => void | Promise<void>) | null) => {
      onSaveSuccessRef.current = handler;
    },
    []
  );

  const runOnSaveSuccessHandler = useCallback(() => {
    const handler = onSaveSuccessRef.current;
    if (!handler) return;
    void handler();
  }, []);

  const value = useMemo<TaskDrawerContextType>(
    () => ({
      isOpen,
      mode,
      task,
      instanceId,
      openCreate,
      openEdit,
      close,
      setOnSaveSuccessHandler,
      runOnSaveSuccessHandler,
    }),
    [
      isOpen,
      mode,
      task,
      instanceId,
      openCreate,
      openEdit,
      close,
      setOnSaveSuccessHandler,
      runOnSaveSuccessHandler,
    ]
  );

  return (
    <TaskDrawerContext.Provider value={value}>
      {children}
    </TaskDrawerContext.Provider>
  );
}

export function useTaskDrawer() {
  const ctx = useContext(TaskDrawerContext);
  if (!ctx) {
    throw new Error("useTaskDrawer must be used inside TaskDrawerProvider");
  }
  return ctx;
}

