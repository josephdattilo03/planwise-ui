"use client";

import React, { useState } from "react";
import FilterSection from "../FilterSection";
import BoardChip from "../../boards/BoardChip";
import BoardManagerPopover from "../../boards/BoardManagerPopover";
import type { Board } from "../../../types";
import { useFilters } from "../../../providers/filters/useFilters";

export default function BoardsFilterSection() {
  const { boards, selectedBoardIds, toggleBoard } = useFilters();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const selectedBoards = boards.filter((b) => selectedBoardIds.has(b.id));

  return (
    <FilterSection
      title="Boards"
      onAddClick={(e) => setAnchorEl(e.currentTarget)}
    >
      <BoardManagerPopover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        boards={boards}
        selectedBoardIds={selectedBoardIds}
        onToggleBoard={toggleBoard}
      />

      <div className="flex flex-col mt-2 gap-1.5 text-chip-info">
        {selectedBoards.length === 0 ? (
          <p className="text-xs text-dark-green-2 italic">No boards selected</p>
        ) : (
          selectedBoards.map((board) => (
            <div
              key={board.id}
              className="flex flex-row justify-start text-left w-full rounded-xl pl-2 hover:bg-beige transition-colors"
            >
              <BoardChip
                board={board}
                showRemoveButton
                onRemoveClick={() => toggleBoard(board.id)}
              />
            </div>
          ))
        )}
      </div>
    </FilterSection>
  );
}
