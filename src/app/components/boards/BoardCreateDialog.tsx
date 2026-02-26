"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import FormButton from "@/src/common/button/FormButton";
import { FolderNode } from "../../types/workspace";
import { fetchAllFolders } from "../../services/folders/folderService";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, color: string, parentFolderId: string) => void;
};

const PRESET_COLORS = [
  "#FFB3B3", // Pastel Red
  "#FFCBA4", // Pastel Orange
  "#FFE5A0", // Pastel Yellow
  "#C1E1C1", // Pastel Green
  "#A8D8EA", // Pastel Cyan
  "#A0C4FF", // Pastel Blue
  "#BDB2FF", // Pastel Indigo
  "#E4B8D5", // Pastel Violet/Pink
  "#F5CAC3", // Pastel Coral
  "#D4A5A5", // Pastel Rose
];

export default function BoardCreateDialog({ open, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [parentFolderId, setParentFolderId] = useState("root");
  const [folders, setFolders] = useState<FolderNode[]>([]);

  // Load folders when dialog opens
  useEffect(() => {
    if (open) {
      fetchAllFolders().then((data) => {
        setFolders(data);
      });
    }
  }, [open]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), color, parentFolderId);
    // Reset form
    setName("");
    setColor(PRESET_COLORS[0]);
    setParentFolderId("root");
    onClose();
  };

  const handleClose = () => {
    setName("");
    setColor(PRESET_COLORS[0]);
    setParentFolderId("root");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle className="font-sans">Create New Board</DialogTitle>

      <DialogContent className="flex flex-col gap-4 mt-2 font-sans">
        <TextField
          label="Board Name"
          variant="filled"
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          color="success"
          autoFocus
        />

        {/* Parent Folder Select */}
        <FormControl variant="filled" size="small" color="success">
          <InputLabel>Parent Folder</InputLabel>
          <Select
            value={parentFolderId}
            onChange={(e) => setParentFolderId(e.target.value)}
            label="Parent Folder"
          >
            {folders.map((folder) => (
              <MenuItem key={folder.id} value={folder.id}>
                {folder.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box className="flex flex-col gap-2">
          <label className="text-sm text-dark-green-2 font-medium">
            Board Color
          </label>

          {/* Preset color swatches */}
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                onClick={() => setColor(presetColor)}
                className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-transform hover:scale-110 ${color === presetColor
                  ? "border-dark-green-1 ring-2 ring-green-3"
                  : "border-transparent"
                  }`}
                style={{ backgroundColor: presetColor }}
                aria-label={`Select color ${presetColor}`}
              />
            ))}
          </div>

          {/* Custom color picker */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-dark-green-2">Custom:</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-8 rounded-sm cursor-pointer border border-green-3"
            />
            <span className="text-xs text-dark-green-2 uppercase">{color}</span>
          </div>
        </Box>

        {/* Preview */}
        <Box className="flex items-center gap-2 p-3 rounded-md bg-beige/30">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm text-dark-green-1">
            {name || "Board Preview"}
          </span>
        </Box>
      </DialogContent>

      <DialogActions className="px-6 pb-4">
        <FormButton onClick={handleClose} text="Cancel" variant="clear" />
        <FormButton
          onClick={handleSave}
          text="Create"
          variant="confirm"
          disabled={!name.trim()}
        />
      </DialogActions>
    </Dialog>
  );
}
