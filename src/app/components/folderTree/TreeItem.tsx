import { WorkspaceNode } from "../../types/workspace";
import { FolderNode, BoardNode } from "../../types/workspace";
import BoardChip from "../boards/BoardChip";

type TreeItemProps = {
    node: WorkspaceNode;
    expandedFolders: Set<string>;
    toggleFolder: (id: string) => void;
    onSelectNode: (node: WorkspaceNode) => void;
}

export default function TreeItem({
    node,
    expandedFolders,
    toggleFolder,
    onSelectNode
}: TreeItemProps) {
    const isFolder = node.type === 'folder';
    const isExpanded = isFolder && expandedFolders.has(node.id);

    return (
        <div className="select-none">
            <div
                className="flex items-center gap-1 py-1 px-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => {
                    if (isFolder) {
                        toggleFolder(node.id);
                    }
                    onSelectNode(node);
                }}
            >
                {isFolder ? (
                    <>
                        <button
                            className="p-0.5 hover:bg-gray-200 rounded"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFolder(node.id);
                            }}
                        >
                            {isExpanded ? (
                                <span className="text-gray-600">▼</span>
                            ) : (
                                <span className="text-gray-600">▶</span>
                            )}
                        </button>
                        <span className="text-blue-500">📁</span>
                        <span className="text-sm">{node.name}</span>
                    </>
                ) : (
                    <BoardChip board={(node as BoardNode).board}></BoardChip>
                )}
            </div>

            {isFolder && isExpanded && (node as FolderNode).children.length > 0 && (
                <div className="ml-4 border-l border-gray-200">
                    {(node as FolderNode).children.map(child => (
                        <TreeItem
                            key={child.type == "folder" ? (child as FolderNode).id : (child as BoardNode).board.id}
                            node={child}
                            expandedFolders={expandedFolders}
                            toggleFolder={toggleFolder}
                            onSelectNode={onSelectNode}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};