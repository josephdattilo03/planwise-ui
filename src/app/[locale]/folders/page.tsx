"use client";

import { useState } from "react";
import FilterSidebar from "../../components/filters/FilterSidebar";
import FolderTreeDisplay from "../../components/folderTree/FolderTreeDisplay";
import BoardDisplayPage from "../../components/boards/BoardDisplayPage";

export default function FoldersPage() {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>();

  const handleBoardSelect = (boardId: string) => {
    setSelectedBoardId(boardId);
  };

  return (
    <div className="flex flex-row w-full h-full">
      <FilterSidebar showSmartRecommendations={false} showClearAll={false}>
        <FolderTreeDisplay onSelectBoard={handleBoardSelect} />
      </FilterSidebar>

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
