"use client";

import React from "react";
import { Popover, TextField, Box, Autocomplete, Checkbox } from "@mui/material";

import BoardChip from "./BoardChip";
import type { Board } from "../../types";

type Props = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;

  boards: Board[];
  selectedBoardIds: Set<string>;

  onToggleBoard: (id: string) => void;
};

export default function BoardManagerPopover({
  anchorEl,
  open,
  onClose,
  boards,
  selectedBoardIds,
  onToggleBoard,
}: Props) {
  const selectedValues = boards.filter((b) => selectedBoardIds.has(b.id));

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      slotProps={{
        paper: {
          sx: {
            ml: 2,
            width: 280,
            borderRadius: "var(--radius-md)",
            p: 1.5,
          },
        },
      }}
    >
      <Box sx={{ width: "100%" }}>
        <Autocomplete
          multiple
          disableCloseOnSelect
          options={boards}
          value={selectedValues}
          size="small"
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(opt, val) => opt.id === val.id}
          renderOption={(props, option) => {
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps}>
                <BoardChip board={option} />
              </li>
            );
          }}
          onChange={(event, newValue) => {
            const newSet = new Set(newValue.map((b) => b.id));
            boards.forEach((b) => {
              const was = selectedBoardIds.has(b.id);
              const is = newSet.has(b.id);
              if (was !== is) onToggleBoard(b.id);
            });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search boards"
              variant="filled"
              size="small"
              color="success"
              className="font-sans"
            />
          )}
          renderValue={(value, getItemProps) => (
            <span className="pl-1 italic">{`${value.length} ${value.length > 1 ? "boards" : "board"} selected`}</span>
          )}
          sx={{
            "& .MuiFormLabel-root": {
              fontSize: "14px",
            },
          }}
        />
      </Box>
    </Popover>
  );
}
