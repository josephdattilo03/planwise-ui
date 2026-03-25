"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import FilterSidebar from "../../components/filters/FilterSidebar";
import FolderTreeDisplay from "../../components/folderTree/FolderTreeDisplay";
import BoardDisplayPage from "../../components/boards/BoardDisplayPage";
import {
  createBoardNode,
  createFolderRemote,
} from "../../services/folders/folderService";
import { createBoard } from "../../services/boards/boardService";
import { getDataMode } from "../../services/dataMode";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import { Button, Box } from "@mui/material";
import BoardCreateDialog from "../../components/boards/BoardCreateDialog";
import FolderCreateDialog from "../../components/folders/FolderCreateDialog";
import { useSession } from "next-auth/react";
import { useBoardsTags } from "../../providers/boardsTags/BoardsTagsContext";

export default function FoldersPage() {
  const searchParams = useSearchParams();
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: session } = useSession();
  const userId = session?.user?.email ?? undefined;
  const { setBoards } = useBoardsTags();
  const mode = getDataMode();

  // Handle board parameter from URL
  useEffect(() => {
    const boardParam = searchParams.get('board');
    if (boardParam) {
      setSelectedBoardId(boardParam);
    }
  }, [searchParams]);

  const handleBoardSelect = (boardId: string) => {
    setSelectedBoardId(boardId);
  };

  const handleCreateBoard = async (
    name: string,
    color: string,
    parentFolderId: string
  ) => {
    if (mode === "mock") {
      const newBoard = await createBoard(name, color);
      createBoardNode(parentFolderId, newBoard);
      setRefreshKey((prev) => prev + 1);
      return;
    }

    if (!userId) {
      console.error("Create board: not signed in");
      return;
    }

    await createBoard(name, color, userId, parentFolderId);
    setRefreshKey((prev) => prev + 1);
  };

  const handleCreateFolder = async (name: string, parentFolderId: string) => {
    if (mode !== "mock" && !userId) {
      console.error("Create folder: not signed in");
      return;
    }
    await createFolderRemote(userId ?? "", name, parentFolderId);
    setRefreshKey((prev) => prev + 1);
  };

  const handleBoardRemovedFromTree = (boardId: string) => {
    setSelectedBoardId((cur) => (cur === boardId ? null : cur));
    setBoards((prev) => prev.filter((b) => b.id !== boardId));
  };

  const addBoardButton = (
    <Box className="flex flex-col gap-2 w-full px-1">
      <Button
        onClick={() => setCreateDialogOpen(true)}
        className="flex items-center justify-center gap-1.5 py-2 font-sans rounded-md text-small-header border border-beige text-dark-green-1 bg-off-white hover:bg-beige transition"
      >
        <AddRoundedIcon className="w-4 h-4" />
        <span>Create New Board</span>
      </Button>
      <Button
        onClick={() => setCreateFolderDialogOpen(true)}
        className="flex items-center justify-center gap-1.5 py-2 font-sans rounded-md text-small-header border border-beige text-dark-green-1 bg-off-white hover:bg-beige transition"
      >
        <CreateNewFolderOutlinedIcon className="w-4 h-4" />
        <span>Create New Folder</span>
      </Button>
    </Box>
  );

  return (
    <div className="flex flex-row w-full h-full">
      <FilterSidebar
        showSmartRecommendations={false}
        showClearAll={false}
        topContent={addBoardButton}
      >
        <FolderTreeDisplay
          onSelectBoard={handleBoardSelect}
          refreshKey={refreshKey}
          userId={userId}
          onStructureChange={() => setRefreshKey((k) => k + 1)}
          selectedBoardId={selectedBoardId ?? null}
          onBoardRemovedFromTree={handleBoardRemovedFromTree}
        />
      </FilterSidebar>

      <BoardCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSave={handleCreateBoard}
      />
      <FolderCreateDialog
        open={createFolderDialogOpen}
        onClose={() => setCreateFolderDialogOpen(false)}
        onSave={handleCreateFolder}
      />

      <div className="flex-1 h-full overflow-hidden">
        {selectedBoardId ? (
          <BoardDisplayPage boardId={selectedBoardId} />
        ) : (
          <div className="flex items-center justify-center h-full text-dark-green-2">
            Select a board from the sidebar to view its tasks
          </div>
        )}
      </div>
    </div>
  );
}
