"use client";

import { useState, useEffect, useRef } from "react";
import { FolderNode, WorkspaceNode } from "../../types/workspace";
import TreeItem from "./TreeItem";
import LoadingSpinner from "@/src/common/LoadingSpinner";
import { useWorkspace } from "../../providers/workspace/WorkspaceContext";

interface Props {
  onSelectBoard: (node: string) => void;
  refreshKey?: number;
}

export default function FolderTreeDisplay({
  onSelectBoard,
  refreshKey,
}: Props) {
  const { workspace, loading, loadChildren: loadChildrenFromContext, refetch } = useWorkspace();
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => new Set(["root"]));
  const [selectedNode, setSelectedNode] = useState<WorkspaceNode | null>(null);
  const refreshKeyRef = useRef(refreshKey);

  // Refetch workspace when Folders page triggers refresh (e.g. after creating a board)
  useEffect(() => {
    if (refreshKey !== undefined && refreshKey !== refreshKeyRef.current) {
      refreshKeyRef.current = refreshKey;
      refetch();
    }
  }, [refreshKey, refetch]);

  const loadChildren = async (folderId: string) => {
    if (loadingFolders.has(folderId)) return;
    setLoadingFolders((prev) => new Set(prev).add(folderId));
    try {
      await loadChildrenFromContext(folderId);
    } finally {
      setLoadingFolders((prev) => {
        const next = new Set(prev);
        next.delete(folderId);
        return next;
      });
    }
  };

  const toggleFolder = async (folderId: string) => {
    const wasExpanded = expandedFolders.has(folderId);
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (wasExpanded) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
    if (!wasExpanded) await loadChildren(folderId);
  };

  if (loading && !workspace) {
    return (
      <div className="flex h-screen items-center justify-center bg-sidebar-bg">
        <LoadingSpinner label="Loading workspace..." fullPage={false} />
      </div>
    );
  }

  if (!workspace) {
    return null;
  }

  return (
    <div className="h-screen bg-sidebar-bg content-fade-in">
      <TreeItem
        node={workspace}
        expandedFolders={expandedFolders}
        toggleFolder={toggleFolder}
        onSelectNode={setSelectedNode}
        onSelectBoard={onSelectBoard}
      />
    </div>
  );
}
