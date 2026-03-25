"use client";

import React from "react";
import { Box, Drawer, IconButton } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { TaskProvider } from "../../providers/tasks/TaskContext";
import NewTaskComponent from "./NewTaskComponent";
import { useTaskDrawer } from "../../providers/tasks/TaskDrawerContext";
import { usePathname } from "next/navigation";
import TaskDetailPanel from "./TaskDetailPanel";

export default function TaskDrawer() {
  const { isOpen, mode, task, instanceId, close, runOnSaveSuccessHandler } =
    useTaskDrawer();
  const pathname = usePathname();

  const [originPage, setOriginPage] = React.useState<
    "tasks" | "folders" | null
  >(null);

  // Keep open only while the user stays on the same page type it was opened from.
  // (So it closes when switching tasks <-> board, but still stays open on query changes within that page.)
  React.useEffect(() => {
    if (!isOpen) return;
    if (!pathname) return;
    const currentPage =
      pathname.endsWith("/tasks") ? "tasks" : pathname.endsWith("/folders") ? "folders" : null;

    if (!currentPage) {
      close();
      return;
    }

    // Capture where the panel was opened from.
    if (!originPage) {
      setOriginPage(currentPage);
      return;
    }

    // If user navigates to a different page type, close.
    if (originPage !== currentPage) {
      close();
      return;
    }
  }, [isOpen, pathname, close, originPage]);

  React.useEffect(() => {
    if (!isOpen) {
      setOriginPage(null);
    }
  }, [isOpen]);

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={isOpen}
      onClose={close}
      PaperProps={{
        sx: {
          width: "min(720px, 46vw)",
          minWidth: 520,
          bgcolor: "var(--sidebar-bg)",
          borderLeft: "1px solid var(--sidebar-border)",
        },
      }}
    >
      <Box sx={{ height: "100%", position: "relative" }}>
        <IconButton
          aria-label="Close task drawer"
          onClick={close}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
            bgcolor: "var(--menu-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>

        {/* TaskProvider + NewTaskComponent reuse your existing form */}
        <Box sx={{ height: "100%", pt: 6 }}>
          {mode === "create" ? (
            <Box key={`create:${instanceId}`} sx={{ height: "100%" }}>
              <TaskDetailPanel
                mode="create"
                onSaveSuccess={async () => {
                  close();
                  runOnSaveSuccessHandler();
                }}
              />
            </Box>
          ) : task ? (
            <Box key={`edit:${task.id}:${instanceId}`} sx={{ height: "100%" }}>
              <TaskDetailPanel
                task={task}
                onSaveSuccess={async () => {
                  runOnSaveSuccessHandler();
                }}
              />
            </Box>
          ) : null}
        </Box>
      </Box>
    </Drawer>
  );
}

