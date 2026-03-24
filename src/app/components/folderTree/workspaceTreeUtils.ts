import type { FolderNode } from "../../types/workspace";

/** Find a folder node by id in the workspace tree. */
export function findFolderInTree(
  root: FolderNode,
  folderId: string
): FolderNode | null {
  if (root.id === folderId) return root;
  for (const child of root.children) {
    if (child.type === "folder") {
      const found = findFolderInTree(child as FolderNode, folderId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * All folder ids in the subtree rooted at `folderId` (including `folderId`).
 * Used to collapse nested "open" state when toggling a parent folder.
 */
export function collectFolderSubtreeIds(
  root: FolderNode,
  folderId: string
): string[] {
  const node = findFolderInTree(root, folderId);
  if (!node) return [];
  const ids: string[] = [];
  function walk(n: FolderNode) {
    ids.push(n.id);
    for (const c of n.children) {
      if (c.type === "folder") walk(c as FolderNode);
    }
  }
  walk(node);
  return ids;
}
