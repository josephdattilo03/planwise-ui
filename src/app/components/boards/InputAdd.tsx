"use client";

import React from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface InputAddProps {
  value: string;
  onChange: (value: string) => void;
  handleClose: () => void;
}

export const InputAdd = ({ value, onChange, handleClose }: InputAddProps) => {
  return (
    <TextField
      label="Card title"
      variant="outlined"
      fullWidth
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleClose} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};




