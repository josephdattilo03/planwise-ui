"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import type { FolderNode, WorkspaceNode } from "../../types/workspace";
import { useSession } from "next-auth/react";
import {
  fetchRootFolder,
  fetchChildrenByParentId,
} from "../../services/folders/folderService";
import { getDataMode } from "../../services/dataMode";
import { SCHEDULE_AGENT_MUTATED_EVENT } from "../../services/scheduleAgentRefresh";

type WorkspaceContextType = {
  workspace: FolderNode | null;
  loading: boolean;
  error: string | null;
  loadChildren: (folderId: string) => Promise<void>;
  refetch: () => Promise<void>;
  /** Persists across client navigations until full reload (same as provider lifetime). */
  expandedFolderIds: Set<string>;
  setExpandedFolderIds: React.Dispatch<React.SetStateAction<Set<string>>>;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

function updateFolderChildren(
  node: FolderNode,
  targetId: string,
  children: WorkspaceNode[]
): FolderNode {
  if (node.id === targetId) {
    return { ...node, children };
  }
  return {
    ...node,
    children: node.children.map((child) => {
      if (child.type === "folder") {
        return updateFolderChildren(child as FolderNode, targetId, children);
      }
      return child;
    }),
  };
}

function collectAllFolderIds(node: FolderNode): Set<string> {
  const ids = new Set<string>([node.id]);
  for (const child of node.children) {
    if (child.type === "folder") {
      for (const id of collectAllFolderIds(child as FolderNode)) {
        ids.add(id);
      }
    }
  }
  return ids;
}

/**
 * Preloads the workspace folder tree (root + root's children) so the boards
 * page sidebar can show the tree without a loading state on every visit.
 */
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<FolderNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(
    () => new Set()
  );

  const { data: session, status } = useSession();
  const userId = session?.user?.email ?? undefined;
  const backendMode = getDataMode() === "backend";

  const loadRoot = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const root = await fetchRootFolder(userId);
      if (root) {
        const children = await fetchChildrenByParentId(root.id, userId);
        setWorkspace({ ...root, children });
      } else {
        setWorkspace(null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load workspace");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (backendMode) {
      if (status === "loading") {
        return;
      }
      if (status === "unauthenticated") {
        setWorkspace(null);
        setLoading(false);
        return;
      }
      if (!userId) {
        setWorkspace(null);
        setLoading(false);
        return;
      }
    }
    loadRoot();
  }, [loadRoot, backendMode, status, userId]);

  useLayoutEffect(() => {
    if (!workspace) {
      setExpandedFolderIds(new Set());
      return;
    }
    setExpandedFolderIds((prev) => {
      const validIds = collectAllFolderIds(workspace);
      const next = new Set<string>();
      for (const id of prev) {
        if (validIds.has(id)) next.add(id);
      }
      if (next.size === 0) {
        next.add(workspace.id);
      }
      return next;
    });
  }, [workspace]);

  const loadChildren = useCallback(
    async (folderId: string) => {
      if (backendMode && !userId) return;
      const children = await fetchChildrenByParentId(folderId, userId);
      setWorkspace((prev) => {
        if (!prev) return null;
        return updateFolderChildren(prev, folderId, children);
      });
    },
    [userId, backendMode]
  );

  const refetch = useCallback(async () => {
    await loadRoot();
  }, [loadRoot]);

  useEffect(() => {
    if (!backendMode) return;
    const onAgentMutated = () => {
      void loadRoot();
    };
    window.addEventListener(SCHEDULE_AGENT_MUTATED_EVENT, onAgentMutated);
    return () =>
      window.removeEventListener(SCHEDULE_AGENT_MUTATED_EVENT, onAgentMutated);
  }, [backendMode, loadRoot]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        loading,
        error,
        loadChildren,
        refetch,
        expandedFolderIds,
        setExpandedFolderIds,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }
  return ctx;
}

export function useOptionalWorkspace() {
  return useContext(WorkspaceContext);
}
