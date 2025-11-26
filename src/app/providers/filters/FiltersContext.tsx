"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Board, Tag } from "../../types";
import { fetchBoards } from "../../services/boards/boardService";
import {
  fetchTags,
  createTag as createTagService,
  updateTag as updateTagService,
} from "../../services/tags/tagService";

type FiltersContextType = {
  loading: boolean;
  error: string | null;

  boards: Board[];
  tags: Tag[];

  selectedBoardIds: Set<number>;
  selectedTagIds: Set<number>;
  selectedDate: Date | null;
  smartRecs: boolean;

  toggleBoard: (id: number) => void;
  toggleTag: (id: number) => void;
  setSelectedDate: (date: Date | null) => void;
  setSmartRecs: (v: boolean) => void;

  createTag: (data: Partial<Tag>) => Promise<Tag>;
  editTag: (tag: Tag) => Promise<void>;

  clearAll: () => void;
};

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBoardIds, setSelectedBoardIds] = useState<Set<number>>(
    new Set()
  );
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [smartRecs, setSmartRecs] = useState(true);

  // Fetch the boards & tags once
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
        setError("Failed to load filter data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Toggle board
  const toggleBoard = (id: number) => {
    setSelectedBoardIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
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

  // Clear all filters
  const clearAll = () => {
    setSelectedDate(null);
    setSmartRecs(false);
    setSelectedBoardIds(new Set());
    setSelectedTagIds(new Set());
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
        smartRecs,
        toggleBoard,
        toggleTag,
        setSelectedDate,
        setSmartRecs,
        createTag,
        editTag,
        clearAll,
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
