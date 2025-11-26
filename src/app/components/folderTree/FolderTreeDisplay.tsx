"use client"
import { useState } from "react";
import { FolderNode, BoardNode, WorkspaceNode} from "../../types/workspace";
import TreeItem from "./TreeItem";

export default function FolderTreeDisplay() {
  // Sample workspace data
  const [workspace] = useState<FolderNode>({
    id: 'root',
    name: 'My Workspace',
    parentId: null,
    type: 'folder',
    children: [
      {
        id: 'folder-1',
        name: 'Projects',
        parentId: 'root',
        type: 'folder',
        children: [
          {
            parentId: 'folder-1',
            type: 'board',
            board: {
            id: 'board-1',
            name: 'Website Redesign',
            color: '#3b82f6',

            }
          },
          {
            parentId: 'folder-1',
            type: 'board',
            board: {
            color: '#10b981',
            id: 'board-2',
            name: 'Mobile App',
            }
          }
        ]
      },
      {
        id: 'folder-2',
        name: 'Archive',
        parentId: 'root',
        type: 'folder',
        children: [
          {
            id: 'folder-3',
            name: '2024',
            parentId: 'folder-2',
            type: 'folder',
            children: [
              {
                parentId: 'folder-3',
                type: 'board',
                board: {
                color: '#f59e0b',
                id: 'board-3',
                name: 'Q1 Planning',
                }
              }
            ]
          }
        ]
      },
      {
        parentId: 'root',
        type: 'board',
        board: {
        color: '#8b5cf6',
        id: 'board-4',
        name: 'Quick Notes',

        }
      }
    ]
  });

  // Track expanded folders in state
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    // Initialize from memory
    return new Set(['root']);
  });

  const [selectedNode, setSelectedNode] = useState<WorkspaceNode | null>(null);

  // Toggle folder expansion
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  return (
    <div className="flex h-screen">
      {/* Left sidebar with tree */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Workspace</h2>
        <TreeItem 
          node={workspace}
          expandedFolders={expandedFolders}
          toggleFolder={toggleFolder}
          onSelectNode={setSelectedNode}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 p-8 bg-gray-50">
        {selectedNode ? (
          <div>
            <h1 className="text-2xl font-bold mb-2">{selectedNode.type == 'folder' ? (selectedNode as FolderNode).name : (selectedNode as BoardNode).board.name}</h1>
            <p className="text-gray-600">
              Type: {selectedNode.type === 'folder' ? 'Folder' : 'Board'}
            </p>
            {selectedNode.type === 'board' && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-gray-600">Color:</span>
                <div 
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: (selectedNode as BoardNode).board.color }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500">Select a folder or board to view details</div>
        )}
      </div>
    </div>
  );
}