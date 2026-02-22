"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Board, Tag } from "../../types";
import {
  fetchBoards,
  createBoard as createBoardService,
} from "../../services/boards/boardService";
import {
  fetchTags,
  createTag as createTagService,
  updateTag as updateTagService,
} from "../../services/tags/tagService";
import { useSession } from "next-auth/react";

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
  selectedTagIds: Set<string>;
  selectedDate: Date | null;
  smartRecs: boolean;

  toggleBoard: (id: string) => void;
  toggleTag: (id: string) => void;
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
  const [boards, setBoards] = useState<Board[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBoardIds, setSelectedBoardIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
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
  const {data: session} = useSession()
  const email = session?.user?.email as string

  // Fetch the boards & tags once
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [boardData, tagData] = await Promise.all([
          fetchBoards(email),
          fetchTags(email),
        ]);

        setBoards(boardData);
        setTags(tagData);

        // Check for board parameter in URL and set filter
        const boardParam = searchParams.get('board');
        if (boardParam && boardData.some((board: Board) => board.id === boardParam)) {
          setSelectedBoardIds(new Set([boardParam]));
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load filter data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [searchParams, email]);

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
  const toggleTag = (id: string) => {
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

  // Create tag
  const createTag = async (data: Partial<Tag>) => {
    const newTag = createTagService(data);
    setTags((prev) => [...prev, newTag]);
    return Promise.resolve(newTag);
  };

  // Edit tag
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
