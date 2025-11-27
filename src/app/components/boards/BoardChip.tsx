import React from "react";
import { Board } from "../../types";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import { IconButton } from "@mui/material";

type BoardChipProps = {
    board: Board;
    /**
     * Whether to show the minus / remove icon button.
     * This is optional so other pages can omit it.
     */
    showRemoveButton?: boolean;

    fullWidth?: boolean;

    /**
     * Called when the minus icon is clicked.
     * Only used when showRemoveButton is true.
     */
    onRemoveClick?: (board: Board) => void;
};

export default function BoardChip({
    board,
    showRemoveButton = false,
    fullWidth = true,
    onRemoveClick,
}: BoardChipProps) {
    return (
        <div
            className={`${fullWidth ? "w-full " : ""}group flex items-center justify-between text-chip-info`}
        >
            <div className="flex items-center gap-1">
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: board.color }}
                ></div>
                <p>{board.name}</p>
            </div>
            {showRemoveButton && onRemoveClick && (
                <IconButton
                    size="small"
                    aria-label={`Remove ${board.name}`}
                    onClick={(event) => {
                        event.stopPropagation(); // avoid triggering parent click handlers
                        onRemoveClick(board);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <RemoveCircleOutlineRoundedIcon className="w-4 h-4" />
                </IconButton>
            )}
        </div>
    );
}
