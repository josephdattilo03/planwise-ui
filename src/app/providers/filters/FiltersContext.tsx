"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Board, Tag } from "../../types";
import {
  createBoard as createBoardService,
} from "../../services/boards/boardService";
import {
  createTag as createTagService,
  updateTag as updateTagService,
} from "../../services/tags/tagService";
import { useBoardsTags } from "../boardsTags/BoardsTagsContext";

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
  rangeSelected: number | null;
}

type FiltersContextType = {
  loading: boolean;
  error: string | null;

  boards: Board[];
  tags: Tag[];

  selectedPriorities: Set<number>;
  togglePriority: (priority: number) => void;
  selectedDueDateRange: DateRange;
  toggleDateRange: (dateRange: DateRange) => void;

  selectedBoardIds: Set<string>;
  selectedTagIds: Set<number>;
  selectedDate: Date | null;
  smartRecs: boolean;

  toggleBoard: (id: string) => void;
  toggleTag: (id: number) => void;
  setSelectedDate: (date: Date | null) => void;
  setSmartRecs: (v: boolean) => void;

  createTag: (data: Partial<Tag>) => Promise<Tag>;
  editTag: (tag: Tag) => Promise<void>;

  clearAll: () => void;
  createBoard: (name: string, color: string) => Board;
};

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const { boards, tags, loading, error, setBoards, setTags } = useBoardsTags();

  const [selectedBoardIds, setSelectedBoardIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());
  const [selectedPriorities, setSelectedPriorities] = useState<Set<number>>(
    new Set()
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [smartRecs, setSmartRecs] = useState(true);
  const [selectedDueDateRange, setSelectedDueDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
    rangeSelected: null,
  });

  // Apply board from URL when boards are available (from preload)
  useEffect(() => {
    const boardParam = searchParams.get("board");
    if (
      boardParam &&
      boards.length > 0 &&
      boards.some((board: Board) => board.id === boardParam)
    ) {
      setSelectedBoardIds(new Set([boardParam]));
    }
  }, [searchParams, boards]);

  // Toggle board
  const toggleBoard = (id: string) => {
    setSelectedBoardIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Toggle priority
  const togglePriority = (priority: number) => {
    setSelectedPriorities((prev) => {
      const next = new Set(prev);
      next.has(priority) ? next.delete(priority) : next.add(priority);
      return next;
    });
  };

  // Toggle tag
  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Toggle date range
  const toggleDateRange = (dateRange: DateRange) => {
    setSelectedDueDateRange(dateRange);
  };

  // Create tag (updates preload cache so sidebar stays in sync)
  const createTag = async (data: Partial<Tag>) => {
    const newTag = createTagService(data);
    setTags((prev) => [...prev, newTag]);
    return Promise.resolve(newTag);
  };

  // Edit tag (updates preload cache)
  const editTag = async (tag: Tag) => {
    updateTagService(tag);
    setTags((prev) => prev.map((t) => (t.id === tag.id ? tag : t)));
    return Promise.resolve();
  };

  // Clear all filters
  const clearAll = () => {
    setSelectedDate(null);
    setSmartRecs(false);
    setSelectedBoardIds(new Set());
    setSelectedTagIds(new Set());
    setSelectedPriorities(new Set());
    setSelectedDueDateRange({
      startDate: null,
      endDate: null,
      rangeSelected: null,
    });
  };

  // Create board (updates preload cache so sidebar stays in sync)
  const createBoard = (name: string, color: string): Board => {
    const newBoard = createBoardService(name, color);
    setBoards((prev) => [...prev, newBoard]);
    return newBoard;
  };

  return (
    <FiltersContext.Provider
      value={{
        loading,
        error,
        boards,
        tags,
        selectedBoardIds,
        selectedTagIds,
        selectedDate,
        selectedPriorities,
        smartRecs,
        toggleBoard,
        toggleTag,
        togglePriority,
        setSelectedDate,
        setSmartRecs,
        selectedDueDateRange,
        toggleDateRange,
        createTag,
        editTag,
        clearAll,
        createBoard,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
}

export function useFiltersContext() {
  const ctx = useContext(FiltersContext);
  if (!ctx) {
    throw new Error("useFiltersContext must be used inside FiltersProvider");
  }
  return ctx;
}
