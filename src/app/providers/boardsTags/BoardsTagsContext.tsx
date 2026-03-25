"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Board, Tag } from "../../types";
import { fetchBoardsForFilters } from "../../services/boards/boardService";
import { fetchTags } from "../../services/tags/tagService";
import { useSession } from "next-auth/react";
import { SCHEDULE_AGENT_MUTATED_EVENT } from "../../services/scheduleAgentRefresh";

type BoardsTagsContextType = {
  boards: Board[];
  tags: Tag[];
  loading: boolean;
  error: string | null;
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
};

const BoardsTagsContext = createContext<BoardsTagsContextType | undefined>(
  undefined
);

/**
 * Preloads boards and tags once when the app loads (e.g. in layout).
 * Pages that use the filter sidebar can read from this instead of fetching again,
 * so the sidebar appears with data immediately and there's no second loading phase.
 */
export function BoardsTagsProvider({ children }: { children: React.ReactNode }) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session, status: sessionStatus } = useSession();
  const userId = session?.user?.email ?? undefined;

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }
    if (sessionStatus === "unauthenticated") {
      setBoards([]);
      setTags([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [boardData, tagData] = await Promise.all([
          fetchBoardsForFilters(userId),
          fetchTags(userId),
        ]);
        if (!cancelled) {
          setBoards(boardData);
          setTags(tagData);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("Failed to load filter data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId, sessionStatus]);

  /** Schedule agent applied writes — refetch so task/calendar/board UIs update without reload. */
  useEffect(() => {
    let cancelled = false;
    const onAgentMutated = () => {
      if (sessionStatus !== "authenticated") return;
      void (async () => {
        try {
          setLoading(true);
          setError(null);
          const [boardData, tagData] = await Promise.all([
            fetchBoardsForFilters(userId),
            fetchTags(userId),
          ]);
          if (!cancelled) {
            setBoards(boardData);
            setTags(tagData);
          }
        } catch (err) {
          if (!cancelled) {
            console.error(err);
            setError("Failed to load filter data");
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    };
    window.addEventListener(SCHEDULE_AGENT_MUTATED_EVENT, onAgentMutated);
    return () => {
      cancelled = true;
      window.removeEventListener(SCHEDULE_AGENT_MUTATED_EVENT, onAgentMutated);
    };
  }, [userId, sessionStatus]);

  return (
    <BoardsTagsContext.Provider
      value={{ boards, tags, loading, error, setBoards, setTags }}
    >
      {children}
    </BoardsTagsContext.Provider>
  );
}

export function useBoardsTags() {
  const ctx = useContext(BoardsTagsContext);
  if (!ctx) {
    throw new Error("useBoardsTags must be used inside BoardsTagsProvider");
  }
  return ctx;
}

export function useOptionalBoardsTags() {
  return useContext(BoardsTagsContext);
}
