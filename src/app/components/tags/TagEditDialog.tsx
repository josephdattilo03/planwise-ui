"use client";

import { generateTagColors } from "../../utils/colorUtils";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import type { Tag } from "../../types";
import FormButton from "@/src/common/button/FormButton";

type Props = {
  open: boolean;
  tag: Tag | null;
  onClose: () => void;
  onSave: (tag: Tag) => void;
};

export default function TagEditDialog({ open, tag, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#E0E0E0");

  // Load current tag values when opening
  useEffect(() => {
    if (tag) {
      setName(tag.name);
      setBackgroundColor(tag.backgroundColor);
    }
  }, [tag]);

  const handleSave = () => {
    if (!tag) return;

    const { textColor, borderColor } = generateTagColors(backgroundColor);

    const updated: Tag = {
      ...tag,
      name,
      backgroundColor,
      textColor: textColor,
      borderColor: borderColor,
    };

    onSave(updated);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle className="font-sans">Edit Tag</DialogTitle>

      <DialogContent className="flex flex-col gap-4 mt-2 font-sans">
        <TextField
          label="Tag Name"
          variant="filled"
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          color="success"
        />

        <Box className="flex flex-col gap-1">
          <label className="text-sm text-dark-green-2 font-medium">
            Background Color
          </label>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="w-12 h-10 rounded cursor-pointer border border-green-3"
          />
        </Box>
      </DialogContent>

      <DialogActions className="px-6 pb-4">
        <FormButton onClick={onClose} text="Cancel" variant="clear" />
        <FormButton onClick={handleSave} text="Save" variant="confirm" />
      </DialogActions>
    </Dialog>
  );
}
