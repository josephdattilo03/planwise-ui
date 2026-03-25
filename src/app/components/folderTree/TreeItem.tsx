import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { IconButton } from "@mui/material";
import type { WorkspaceNode, FolderNode, BoardNode } from "../../types/workspace";
import BoardChip from "../boards/BoardChip";
import FolderChip from "./FolderChip";

type TreeItemProps = {
  node: WorkspaceNode;
  expandedFolders: Set<string>;
  toggleFolder: (id: string) => void;
  onSelectNode: (node: WorkspaceNode) => void;
  onSelectBoard: (boardId: string) => void;
  enableDnD?: boolean;
  onRequestDeleteFolder?: (folderId: string) => void;
  onRequestDeleteBoard?: (boardId: string) => void;
};

export default function TreeItem({
  node,
  expandedFolders,
  toggleFolder,
  onSelectNode,
  onSelectBoard,
  enableDnD = false,
  onRequestDeleteFolder,
  onRequestDeleteBoard,
}: TreeItemProps) {
  const isFolder = node.type === "folder";
  const folderNode = isFolder ? (node as FolderNode) : null;
  const boardNode = !isFolder ? (node as BoardNode) : null;
  const isExpanded =
    Boolean(folderNode) && expandedFolders.has(folderNode!.id);
  const isRootFolder = Boolean(folderNode) && folderNode!.id === "root";

  const draggableId = folderNode
    ? `folder:${folderNode.id}`
    : `board:${boardNode!.board.id}`;
  const droppableId = folderNode
    ? `drop:${folderNode.id}`
    : `__leaf__:${boardNode!.board.id}`;

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: draggableId,
    disabled: !enableDnD || isRootFolder,
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: droppableId,
    disabled: !enableDnD || !isFolder,
  });

  const setCombinedRef = (el: HTMLDivElement | null) => {
    setDragRef(el);
    if (isFolder) setDropRef(el);
  };

  const dragStyle = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: 50 }
    : undefined;

  const showFolderDelete =
    isFolder && !isRootFolder && Boolean(onRequestDeleteFolder);
  const showBoardDelete = !isFolder && Boolean(onRequestDeleteBoard);

  return (
    <div className="select-none h-full">
      <div
        ref={setCombinedRef}
        style={dragStyle}
        className={`group flex items-center gap-0.5 py-1 px-2 rounded-sm cursor-pointer hover:bg-tree-hover ${
          isOver && isFolder && enableDnD ? "bg-green-4/40 ring-1 ring-green-3" : ""
        } ${isDragging ? "opacity-60" : ""}`}
        onClick={() => {
          if (folderNode) {
            toggleFolder(folderNode.id);
          } else if (boardNode) {
            onSelectBoard(boardNode.board.id);
          }
          onSelectNode(node);
        }}
      >
        {enableDnD && !isRootFolder && (
          <span
            {...listeners}
            {...attributes}
            className="shrink-0 touch-none text-dark-green-2 opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <DragIndicatorIcon sx={{ fontSize: 18 }} />
          </span>
        )}
        {isRootFolder && enableDnD && (
          <span className="w-[18px] shrink-0" aria-hidden />
        )}
        {isFolder ? (
          <FolderChip
            node={node}
            toggleFolder={toggleFolder}
            isExpanded={isExpanded}
          />
        ) : (
          <BoardChip board={(node as BoardNode).board} />
        )}
        {showFolderDelete && (
          <IconButton
            size="small"
            aria-label="Delete folder"
            className="!p-0.5 ml-auto opacity-0 group-hover:opacity-100 text-dark-green-2"
            onClick={(e) => {
              e.stopPropagation();
              onRequestDeleteFolder?.(folderNode!.id);
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
        {showBoardDelete && (
          <IconButton
            size="small"
            aria-label="Delete board"
            className="!p-0.5 ml-auto opacity-0 group-hover:opacity-100 text-dark-green-2"
            onClick={(e) => {
              e.stopPropagation();
              onRequestDeleteBoard?.((node as BoardNode).board.id);
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </div>

      {isFolder && isExpanded && (node as FolderNode).children.length > 0 && (
        <div className="ml-4 border-l border-tree-line">
          {(node as FolderNode).children.map((child) => (
            <TreeItem
              key={
                child.type === "folder"
                  ? (child as FolderNode).id
                  : (child as BoardNode).board.id
              }
              node={child}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              onSelectNode={onSelectNode}
              onSelectBoard={onSelectBoard}
              enableDnD={enableDnD}
              onRequestDeleteFolder={onRequestDeleteFolder}
              onRequestDeleteBoard={onRequestDeleteBoard}
            />
          ))}
        </div>
      )}
    </div>
  );
}
