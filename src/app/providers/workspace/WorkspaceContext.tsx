"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { FolderNode, WorkspaceNode } from "../../types/workspace";
import {
  fetchRootFolder,
  fetchChildrenByParentId,
} from "../../services/folders/folderService";

type WorkspaceContextType = {
  workspace: FolderNode | null;
  loading: boolean;
  error: string | null;
  loadChildren: (folderId: string) => Promise<void>;
  refetch: () => Promise<void>;
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

/**
 * Preloads the workspace folder tree (root + root's children) so the boards
 * page sidebar can show the tree without a loading state on every visit.
 */
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<FolderNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRoot = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const root = await fetchRootFolder();
      if (root) {
        const children = await fetchChildrenByParentId(root.id);
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
  }, []);

  useEffect(() => {
    loadRoot();
  }, [loadRoot]);

  const loadChildren = useCallback(async (folderId: string) => {
    const children = await fetchChildrenByParentId(folderId);
    setWorkspace((prev) => {
      if (!prev) return null;
      return updateFolderChildren(prev, folderId, children);
    });
  }, []);

  const refetch = useCallback(async () => {
    await loadRoot();
  }, [loadRoot]);

  return (
    <WorkspaceContext.Provider
      value={{ workspace, loading, error, loadChildren, refetch }}
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
