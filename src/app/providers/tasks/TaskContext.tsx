"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import type { Board, Tag, Task } from "../../types";
import { fetchBoards } from "../../services/boards/boardService";
import {
  fetchTags,
  createTag as createTagService,
  updateTag as updateTagService,
} from "../../services/tags/tagService";
import { fetchPriority, fetchProgress } from "../../services/dataService";

const progressOptions = fetchProgress();
const priorityOptions = fetchPriority();

type TaskContextType = {
  loading: boolean;
  error: string | null;

  /** Which mode */
  currTask: Task | null;
  isEditMode: boolean;

  /** FORM fields (always used in both modes) */
  id: number;
  title: string;
  description: string;
  dueDate: Date | null;
  priorityLevel: number;
  status: string;

  newBoardId: string;
  newTagIds: Set<number>;

  /** All boards and tags available */
  boards: Board[];
  tags: Tag[];

  progressOptions: { [key: string]: string };
  priorityOptions: { [key: number]: string };

  /** Update form fields */
  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
  setDueDate: (d: Date) => void;
  setPriorityLevel: (v: number) => void;
  setStatus: (v: string) => void;

  changeBoard: (id: string) => void;
  toggleTag: (id: number) => void;

  createTag: (data: Partial<Tag>) => Tag;
  editTag: (tag: Tag) => void;

  /** Reset form fields to current task (Edit mode) or defaults (Create mode) */
  resetTaskState: () => void;
  clearTaskState: () => void;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({
  children,
  task,
}: {
  children: ReactNode;
  task: Task | null;
}) {
  /** GLOBAL data */
  const [boards, setBoards] = useState<Board[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Current task (edit mode) */
  const [currTask, setCurrTask] = useState<Task | null>(task);

  const isEditMode = !!currTask;

  /** FORM STATE — always used, even in edit mode */
  const [id, setId] = useState<number>(task?.id ?? -1);
  const [title, setTitle] = useState<string>(task?.name ?? "");
  const [description, setDescription] = useState<string>(
    task?.description ?? ""
  );
  const [dueDate, setDueDate] = useState<Date>(task?.dueDate ?? new Date());
  const [priorityLevel, setPriorityLevel] = useState<number>(
    task?.priorityLevel ?? 0
  );
  const [status, setStatus] = useState<string>(task?.progress ?? "to-do");

  /** Board / Tag form fields */
  const [newBoardId, setNewBoardId] = useState<string>(task?.board?.id ?? "");

  const [newTagIds, setNewTagIds] = useState<Set<number>>(
    new Set(task?.tags?.map((t) => t.id) ?? [])
  );

  /** Fetch boards + tags on load */
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [boardData, tagData] = await Promise.all([
          fetchBoards(),
          fetchTags(),
        ]);

        setBoards(boardData);
        setTags(tagData);
      } catch (err) {
        console.error(err);
        setError("Failed to load task data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /** When parent passes a NEW task to edit, reset form fields */
  useEffect(() => {
    setCurrTask(task);

    setTitle(task?.name ?? "");
    setDescription(task?.description ?? "");
    setDueDate(task?.dueDate ?? new Date());
    setPriorityLevel(task?.priorityLevel ?? 0);
    setStatus(task?.progress ?? "to-do");

    setNewBoardId(task?.board?.id ?? "");
    setNewTagIds(new Set(task?.tags?.map((t) => t.id) ?? []));
  }, [task]);

  /** Board selection */
  const changeBoard = (id: string) => {
    setNewBoardId(id);
  };

  /** Tag toggle */
  const toggleTag = (id: number) => {
    setNewTagIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Create tag
  const createTag = (data: Partial<Tag>) => {
    const newTag = createTagService(data);
    setTags((prev) => [...prev, newTag]);
    return newTag;
  };

  // Edit tag
  const editTag = (tag: Tag) => {
    updateTagService(tag);
    setTags((prev) => prev.map((t) => (t.id === tag.id ? tag : t)));
  };

  /** Reset form back to original task OR empty create mode */
  const resetTaskState = () => {
    setTitle(currTask?.name ?? "");
    setDescription(currTask?.description ?? "");
    setDueDate(task?.dueDate ?? new Date());
    setPriorityLevel(task?.priorityLevel ?? 0);
    setStatus(task?.progress ?? "to-do");

    setNewBoardId(currTask?.board?.id ?? "");
    setNewTagIds(new Set(currTask?.tags?.map((t) => t.id) ?? []));
  };

  const clearTaskState = () => {
    setTitle("");
    setDescription("");
    setDueDate(new Date());
    setPriorityLevel(0);
    setStatus("to-do");

    setNewBoardId("");
    setNewTagIds(new Set([]));
  };

  return (
    <TaskContext.Provider
      value={{
        loading,
        error,
        currTask,
        isEditMode,

        /** form state */
        id,
        title,
        description,
        dueDate,
        priorityLevel,
        status,

        newBoardId,
        newTagIds,

        boards,
        tags,

        progressOptions,
        priorityOptions,

        setTitle,
        setDescription,
        setDueDate,
        setPriorityLevel,
        setStatus,

        changeBoard,
        toggleTag,
        createTag,
        editTag,
        resetTaskState,
        clearTaskState,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error("useTaskContext must be used inside TaskProvider");
  }
  return ctx;
}
