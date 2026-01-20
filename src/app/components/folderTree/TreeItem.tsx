import { WorkspaceNode } from "../../types/workspace";
import { FolderNode, BoardNode } from "../../types/workspace";
import BoardChip from "../boards/BoardChip";
import FolderChip from "./FolderChip";

type TreeItemProps = {
  node: WorkspaceNode;
  expandedFolders: Set<string>;
  toggleFolder: (id: string) => void;
  onSelectNode: (node: WorkspaceNode) => void;
  onSelectBoard: (boardId: string) => void;
};

export default function TreeItem({
  node,
  expandedFolders,
  toggleFolder,
  onSelectNode,
  onSelectBoard,
}: TreeItemProps) {
  const isFolder = node.type === "folder";
  const isExpanded = isFolder && expandedFolders.has(node.id);

  return (
    <div className="select-none h-full">
      <div
        className="flex items-center gap-1 py-1 px-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-tree-hover"
        onClick={() => {
          if (isFolder) {
            toggleFolder(node.id);
          } else {
            // It's a board - call onSelectBoard with the board ID
            onSelectBoard((node as BoardNode).board.id);
          }
          onSelectNode(node);
        }}
      >
        {isFolder ? (
          <FolderChip
            node={node}
            toggleFolder={toggleFolder}
            isExpanded={isExpanded}
          ></FolderChip>
        ) : (
          <BoardChip board={(node as BoardNode).board}></BoardChip>
        )}
      </div>

      {isFolder && isExpanded && (node as FolderNode).children.length > 0 && (
        <div className="ml-4 border-l border-gray-200 dark:border-tree-line">
          {(node as FolderNode).children.map((child) => (
            <TreeItem
              key={
                child.type == "folder"
                  ? (child as FolderNode).id
                  : (child as BoardNode).board.id
              }
              node={child}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              onSelectNode={onSelectNode}
              onSelectBoard={onSelectBoard}
            />
          ))}
        </div>
      )}
    </div>
  );
}
