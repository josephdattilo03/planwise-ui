"use client";

import React, { useState } from "react";
import { Button, CardActionArea, CardContent, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { InputAdd } from "./InputAdd";

interface ColFooterProps {
  onAddTask?: (title: string) => void;
}

export const ColFooter = ({ onAddTask }: ColFooterProps) => {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleAddCard = () => {
    setShowInput(true);
  };

  const handleCloseInput = () => {
    setShowInput(false);
    setInputValue("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && onAddTask) {
      onAddTask(inputValue.trim());
      handleCloseInput();
    }
  };

  if (!showInput) {
    return (
      <CardActionArea onClick={handleAddCard}>
        <CardContent className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
          <AddIcon fontSize="small" />
          <Typography variant="body2">Add another card</Typography>
        </CardContent>
      </CardActionArea>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <InputAdd
        value={inputValue}
        onChange={setInputValue}
        handleClose={handleCloseInput}
      />
      <Button
        type="submit"
        variant="contained"
        size="small"
        color="primary"
        className="mt-2"
        disabled={!inputValue.trim()}
      >
        Add
      </Button>
    </form>
  );
};
