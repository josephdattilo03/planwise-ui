"use client"
import { useState, useEffect } from "react";
import { FolderNode, BoardNode, WorkspaceNode } from "../../types/workspace";
import TreeItem from "./TreeItem";
import { fetchRootFolder, fetchChildrenByParentId } from "../../services/folders/folderService";

export default function FolderTreeDisplay() {
  const [workspace, setWorkspace] = useState<FolderNode | null>(null);
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    return new Set(['root']);
  });
  const [selectedNode, setSelectedNode] = useState<WorkspaceNode | null>(null);


  // Load children for a specific folder
  const loadChildren = async (folderId: string) => {
    // Don't load if already loading
    if (loadingFolders.has(folderId)) return;
    
    setLoadingFolders(prev => new Set(prev).add(folderId));
    
    try {
      const children = await fetchChildrenByParentId(folderId);
      
      // Update the workspace tree with the loaded children
      setWorkspace(prevWorkspace => {
        if (!prevWorkspace) return null;
        return updateFolderChildren(prevWorkspace, folderId, children);
      });
    } finally {
      setLoadingFolders(prev => {
        const newSet = new Set(prev);
        newSet.delete(folderId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const loadRoot = async () => {
      const root = await fetchRootFolder();
      if (root) {
        setWorkspace(root);
        await loadChildren(root.id);
      }
    };
    loadRoot();
  }, []);

  // Recursively update a folder's children in the tree
  const updateFolderChildren = (
    node: FolderNode,
    targetId: string,
    children: WorkspaceNode[]
  ): FolderNode => {
    if (node.id === targetId) {
      return { ...node, children };
    }

    return {
      ...node,
      children: node.children.map(child => {
        if (child.type === 'folder') {
          return updateFolderChildren(child as FolderNode, targetId, children);
        }
        return child;
      })
    };
  };

  // Toggle folder expansion and load children if needed
  const toggleFolder = async (folderId: string) => {
    const wasExpanded = expandedFolders.has(folderId);
    
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (wasExpanded) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });

    // Load children when expanding (if not already loaded)
    if (!wasExpanded) {
      await loadChildren(folderId);
    }
  };

  if (!workspace) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Loading workspace...</div>
      </div>
    );
  }

  return (
    <div className="h-screen">
        <TreeItem
          node={workspace}
          expandedFolders={expandedFolders}
          toggleFolder={toggleFolder}
          onSelectNode={setSelectedNode}
        />
    </div>
  );
}