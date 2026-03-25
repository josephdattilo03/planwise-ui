"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import TreeItem from "./TreeItem";
import LoadingSpinner from "@/src/common/LoadingSpinner";
import { useWorkspace } from "../../providers/workspace/WorkspaceContext";
import {
  collectFolderSubtreeIds,
  findFolderInTree,
  findBoardNameInTree,
} from "./workspaceTreeUtils";
import { getDataMode } from "../../services/dataMode";
import {
  moveFolderRemote,
  deleteFolderRemote,
} from "../../services/folders/folderService";
import { moveBoardToFolder, deleteBoard } from "../../services/boards/boardService";

interface Props {
  onSelectBoard: (node: string) => void;
  refreshKey?: number;
  userId?: string;
  /** Called after create/delete/move so parents can bump keys or refresh caches. */
  onStructureChange?: () => void;
  /** If user deletes the open board, parent should clear the main pane. */
  selectedBoardId?: string | null;
  onBoardRemovedFromTree?: (boardId: string) => void;
}

type PendingDelete =
  | { kind: "folder"; id: string; name: string }
  | { kind: "board"; id: string; name: string };

export default function FolderTreeDisplay({
  onSelectBoard,
  refreshKey,
  userId,
  onStructureChange,
  selectedBoardId,
  onBoardRemovedFromTree,
}: Props) {
  const {
    workspace,
    loading,
    loadChildren: loadChildrenFromContext,
    refetch,
    expandedFolderIds,
    setExpandedFolderIds,
  } = useWorkspace();
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set());
  const refreshKeyRef = useRef(refreshKey);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null
  );
  const [deleteBusy, setDeleteBusy] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const enableDnD = getDataMode() === "mock" || Boolean(userId);
  const showTreeActions = getDataMode() === "mock" || Boolean(userId);

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
    if (!workspace) return;
    const wasExpanded = expandedFolderIds.has(folderId);
    const subtreeIds = collectFolderSubtreeIds(workspace, folderId);

    setExpandedFolderIds((prev) => {
      const next = new Set(prev);
      if (wasExpanded) {
        for (const id of subtreeIds) next.delete(id);
      } else {
        for (const id of subtreeIds) {
          if (id !== folderId) next.delete(id);
        }
        next.add(folderId);
      }
      return next;
    });

    if (!wasExpanded) await loadChildren(folderId);
  };

  const bump = useCallback(() => {
    onStructureChange?.();
  }, [onStructureChange]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (getDataMode() !== "mock" && !userId) return;
    const overId = String(over.id);
    if (!overId.startsWith("drop:")) return;
    const targetFolderId = overId.slice("drop:".length);
    const activeId = String(active.id);

    const uid =
      getDataMode() === "mock" ? (userId ?? "") : (userId as string);
    try {
      if (activeId.startsWith("board:")) {
        const boardId = activeId.slice("board:".length);
        await moveBoardToFolder(uid, boardId, targetFolderId);
      } else if (activeId.startsWith("folder:")) {
        const folderId = activeId.slice("folder:".length);
        if (folderId === targetFolderId) return;
        await moveFolderRemote(uid, folderId, targetFolderId);
      }
      bump();
    } catch (e) {
      console.error(e);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    if (getDataMode() !== "mock" && !userId) return;
    setDeleteBusy(true);
    const uid =
      getDataMode() === "mock" ? (userId ?? "") : (userId as string);
    try {
      if (pendingDelete.kind === "folder") {
        await deleteFolderRemote(uid, pendingDelete.id);
      } else {
        await deleteBoard(uid, pendingDelete.id);
        if (selectedBoardId === pendingDelete.id) {
          onBoardRemovedFromTree?.(pendingDelete.id);
        }
      }
      setPendingDelete(null);
      bump();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteBusy(false);
    }
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

  const tree = (
    <TreeItem
      node={workspace}
      expandedFolders={expandedFolderIds}
      toggleFolder={toggleFolder}
      onSelectNode={() => {}}
      onSelectBoard={onSelectBoard}
      enableDnD={enableDnD}
      onRequestDeleteFolder={
        showTreeActions
          ? (id) => {
              const name =
                findFolderInTree(workspace, id)?.name ?? id;
              setPendingDelete({
                kind: "folder",
                id,
                name,
              });
            }
          : undefined
      }
      onRequestDeleteBoard={
        showTreeActions
          ? (boardId) => {
              setPendingDelete({
                kind: "board",
                id: boardId,
                name: findBoardNameInTree(workspace, boardId) ?? boardId,
              });
            }
          : undefined
      }
    />
  );

  return (
    <>
      {enableDnD ? (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="h-screen bg-sidebar-bg content-fade-in">{tree}</div>
        </DndContext>
      ) : (
        <div className="h-screen bg-sidebar-bg content-fade-in">{tree}</div>
      )}

      <Dialog
        open={pendingDelete !== null}
        onClose={() => !deleteBusy && setPendingDelete(null)}
      >
        <DialogTitle className="font-sans">
          Delete {pendingDelete?.kind === "folder" ? "folder" : "board"}?
        </DialogTitle>
        <DialogContent className="font-sans">
          <Typography variant="body2">
            {pendingDelete?.kind === "folder"
              ? `Delete “${pendingDelete.name}” and everything inside it? This cannot be undone.`
              : `Delete board “${pendingDelete?.name}”? Events and tasks on this board may remain in the database until cleaned up separately.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)} disabled={deleteBusy}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteBusy}
            onClick={() => void confirmDelete()}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
