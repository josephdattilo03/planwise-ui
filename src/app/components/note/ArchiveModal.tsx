"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InboxIcon from "@mui/icons-material/Inbox";
import ArchivedNoteChip from "./ArchivedNoteChip";

export default function ArchiveModal({
  archivedNotes,
  restoreNote,
  isOpen,
  onClose,
}: {
  archivedNotes: any[];
  restoreNote: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          className: "bg-sidebar-bg border border-sidebar-border rounded-lg",
          elevation: 4,
        },
      }}
    >
      <DialogTitle className="flex items-center justify-between px-6 pt-5 pb-3">
        <Typography className="text-small-header text-dark-green-2">
          Archived Notes
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Close archive"
          className="text-dark-green-2"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent className="px-6 pb-6 pt-1">
        {archivedNotes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-dark-green-2 opacity-50">
            <InboxIcon sx={{ fontSize: 40 }} />
            <p className="text-body">No archived notes</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {archivedNotes.map((note) => (
              <ArchivedNoteChip
                key={note.id}
                title={note.title}
                color={note.color}
                onRestore={() => {
                  restoreNote(note.id);
                }}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
