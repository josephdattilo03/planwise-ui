"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import FilterSidebar from "../../components/filters/FilterSidebar";
import FolderTreeDisplay from "../../components/folderTree/FolderTreeDisplay";
import BoardDisplayPage from "../../components/boards/BoardDisplayPage";
import { createBoardNode } from "../../services/folders/folderService";
import { createBoard } from "../../services/boards/boardService";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FormButton from "@/src/common/button/FormButton";
import BoardCreateDialog from "../../components/boards/BoardCreateDialog";

export default function FoldersPage() {
  const searchParams = useSearchParams();
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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

  const handleCreateBoard = (
    name: string,
    color: string,
    parentFolderId: string
  ) => {
    // Save to "boards" localStorage (for fetchBoards / FiltersContext)
    const newBoard = createBoard(name, color);

    createBoardNode(parentFolderId, newBoard);

    // Trigger tree refresh
    setRefreshKey((prev) => prev + 1);
  };

  const addBoardButton = (
    <button
      onClick={() => setCreateDialogOpen(true)}
      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white rounded-lg border border-dashed border-green-3 text-dark-green-2 text-small-header hover:bg-green-4/30 hover:border-green-2 transition-colors cursor-pointer"
    >
      <AddRoundedIcon className="w-4 h-4" />
      <span>New</span>
    </button>
  );

  return (
    <div className="flex flex-row w-full h-full">
      <FilterSidebar
        showSmartRecommendations={false}
        showClearAll={false}
        topContent={addBoardButton}
      >
        <FolderTreeDisplay onSelectBoard={handleBoardSelect} />
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
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a board from the sidebar to view its tasks
          </div>
        )}
      </div>
    </div>
  );
}
