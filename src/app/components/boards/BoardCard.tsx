"use client";

import React, { useMemo } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { Task } from "../../types/task";
import TagChip from "../tags/TagChip";
import { useBoardsTags } from "../../providers/boardsTags/BoardsTagsContext";
import { resolveTagsWithCatalog } from "../../services/tags/tagService";

interface BoardCardProps {
  task: Task;
}

export const BoardCard = ({ task }: BoardCardProps) => {
  const { tags: tagCatalog } = useBoardsTags();
  const displayTags = useMemo(
    () => resolveTagsWithCatalog(task.tags, tagCatalog),
    [task.tags, tagCatalog]
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card
      variant="outlined"
      className="mx-2 mb-4"
      sx={{
        borderLeft: `4px solid ${task.board.color}`,
        borderRadius: "var(--radius-md)",
      }}
    >
      <CardContent className="flex flex-col gap-2 p-4">
        <Typography variant="subtitle1" className="font-semibold">
          {task.name}
        </Typography>

        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            className="line-clamp-2"
          >
            {task.description}
          </Typography>
        )}

        <Box className="flex items-center gap-2 mt-1">
          <Typography variant="caption" color="text.secondary">
            {formatDate(task.dueDate)}
          </Typography>
          <p>
            {Array.from({ length: task.priorityLevel + 1 }).map((_, i) => (
              <span className="text-red" key={i}>
                !
              </span>
            ))}
          </p>
        </Box>

        {displayTags.length > 0 && (
          <Box className="flex flex-wrap gap-1 mt-1">
            {displayTags.map((tag) => (
              <TagChip key={tag.id} tag={tag} />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
