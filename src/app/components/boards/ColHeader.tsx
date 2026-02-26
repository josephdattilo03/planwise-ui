"use client";

import React from "react";
import { Typography, Badge } from "@mui/material";
import { useTranslations } from "next-intl";
import { Task } from "../../types";

interface ColHeaderProps {
  taskID: Task["progress"];
  count: number;
}

export const ColHeader = ({ taskID, count }: ColHeaderProps) => {
  const t = useTranslations("TaskCard");
  const getProgressClass = (progress: Task["progress"]) => {
    switch (progress) {
      case "to-do":
        return "bg-task-status-to-do-button text-task-status-to-do-text inset-ring-task-status-to-do-stroke";
      case "in-progress":
        return "bg-task-status-in-prog-button text-task-status-in-prog-text inset-ring-task-status-in-prog-stroke";
      case "done":
        return "bg-task-status-done-button text-task-status-done-text inset-ring-task-status-done-stroke";
      case "pending":
        return "bg-task-status-pending-button text-task-status-pending-text inset-ring-task-status-pending-stroke";
      default:
        return "";
    }
  };
  return (
    <div className={`flex items-center justify-between p-4`}>
      <Typography
        variant="h6"
        className={
          "inline-flex items-center rounded-sm px-2 py-1 font-semibold inset-ring " +
          getProgressClass(taskID)
        }
      >
        {t(`task-${taskID}`)}
      </Typography>
      <Badge
        badgeContent={count}
        color="primary"
        sx={{
          "& .MuiBadge-badge": {
            position: "static",
            transform: "none",
          },
        }}
      />
    </div>
  );
};
