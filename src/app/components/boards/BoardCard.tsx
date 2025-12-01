"use client";

import React from "react";
import { Card, CardContent, Chip, Typography, Box } from "@mui/material";
import { Task } from "../../types/task";
import TagChip from "../tags/TagChip";

interface BoardCardProps {
  task: Task;
}

export const BoardCard = ({ task }: BoardCardProps) => {
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
        "&:hover": {
          boxShadow: 2,
        },
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

        {task.tags.length > 0 && (
          <Box className="flex flex-wrap gap-1 mt-1">
            {task.tags.map((tag) => (
              <TagChip key={tag.id} tag={tag} />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
