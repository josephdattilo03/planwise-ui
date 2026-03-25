"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import FormButton from "@/src/common/button/FormButton";
import type { FolderNode } from "../../types/workspace";
import { fetchAllFolders } from "../../services/folders/folderService";
import { useSession } from "next-auth/react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, parentFolderId: string) => void | Promise<void>;
};

export default function FolderCreateDialog({ open, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [parentFolderId, setParentFolderId] = useState("root");
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const { data: session } = useSession();
  const userId = session?.user?.email ?? undefined;

  useEffect(() => {
    if (open) {
      fetchAllFolders(userId).then(setFolders);
    }
  }, [open, userId]);

  const handleSave = async () => {
    if (!name.trim()) return;
    await onSave(name.trim(), parentFolderId);
    setName("");
    setParentFolderId("root");
    onClose();
  };

  const handleClose = () => {
    setName("");
    setParentFolderId("root");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle className="font-sans">Create New Folder</DialogTitle>
      <DialogContent className="flex flex-col gap-4 mt-2 font-sans">
        <TextField
          label="Folder name"
          variant="filled"
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          color="success"
          autoFocus
        />
        <FormControl variant="filled" size="small" color="success">
          <InputLabel>Parent folder</InputLabel>
          <Select
            value={parentFolderId}
            onChange={(e) => setParentFolderId(e.target.value)}
            label="Parent folder"
          >
            {folders.map((folder) => (
              <MenuItem key={folder.id} value={folder.id}>
                {folder.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        <FormButton onClick={handleClose} text="Cancel" variant="clear" />
        <FormButton
          onClick={() => void handleSave()}
          text="Create"
          variant="confirm"
          disabled={!name.trim()}
        />
      </DialogActions>
    </Dialog>
  );
}
