"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import FilterSidebar from "../../components/filters/FilterSidebar";
import FolderTreeDisplay from "../../components/folderTree/FolderTreeDisplay";
import BoardDisplayPage from "../../components/boards/BoardDisplayPage";
import { createBoardNode } from "../../services/folders/folderService";
import { createBoard } from "../../services/boards/boardService";
import { getDataMode } from "../../services/dataMode";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Button } from "@mui/material";
import BoardCreateDialog from "../../components/boards/BoardCreateDialog";
import { useSession } from "next-auth/react";

export default function FoldersPage() {
  const searchParams = useSearchParams();
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: session } = useSession();
  const userId = session?.user?.email ?? undefined;
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
    // Save to "boards" localStorage (for fetchBoards / FiltersContext) only in mock mode.
    if (mode === "mock" || !userId || parentFolderId === "root") {
      const newBoard = await createBoard(name, color);
      createBoardNode(parentFolderId, newBoard);
      setRefreshKey((prev) => prev + 1);
      return;
    }

    await createBoard(name, color, userId, parentFolderId);
    setRefreshKey((prev) => prev + 1);
  };

  const addBoardButton = (
    <Button
      onClick={() => setCreateDialogOpen(true)}
      className="flex items-center justify-center gap-1.5 py-2 font-sans rounded-md text-small-header border border-beige text-dark-green-1 bg-off-white hover:bg-beige transition"
    >
      <AddRoundedIcon className="w-4 h-4" />
      <span>Create New Board</span>
    </Button>
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
        />
      </FilterSidebar>

      <BoardCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSave={handleCreateBoard}
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
