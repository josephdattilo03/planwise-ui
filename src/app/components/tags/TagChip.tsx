import React from "react";
import { Tag } from "../../types";
import { IconButton } from "@mui/material";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";

type TagChipProps = {
  tag: Tag;
  showRemoveButton?: boolean;
  onRemoveClick?: (tag: Tag) => void;
};

export default function TagChip({
  tag,
  showRemoveButton = false,
  onRemoveClick,
}: TagChipProps) {
  return (
    <div>
      <p
        className="inline-flex items-center rounded-full w-fit px-2 py-1.5 gap-1 text-xs font-medium text-chip-info"
        style={{
          backgroundColor: tag.backgroundColor,
          color: tag.textColor,
          border: `1px solid ${tag.borderColor}`,
        }}
      >
        {tag.name}
        {showRemoveButton && onRemoveClick && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveClick(tag);
            }}
            className="p-0"
          >
            <RemoveCircleOutlineRoundedIcon
              className="w-4 h-4"
              style={{
                color: tag.textColor,
              }}
            />
          </IconButton>
        )}
      </p>
    </div>
  );
}
