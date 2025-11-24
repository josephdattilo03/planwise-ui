"use client";

import React, { useState, FormEvent } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Paper,
  Typography,
  Alert,
  SelectChangeEvent,
} from "@mui/material";
import FormButton from "@/src/common/button/FormButton";

// Types
interface TaskFormData {
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  board: string;
  tagsInput: string;
  description: string;
}

interface TaskPayload {
  user_id: string;
  title: string;
  status: string;
  priority: string;
  due_date?: string;
  board: string;
  tags: string[];
  description?: string;
}

// Constants
const STATUS_OPTIONS = ["To-Do", "In Progress", "Done", "Pending"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Now"];
const BOARD_OPTIONS = [
  "Design Projects",
  "Senior Design",
  "PennOS",
  "House",
  "Personal",
];

// Component
export default function NewTaskComponent() {
  const initialFormData: TaskFormData = {
    title: "",
    status: "To-Do",
    priority: "Low",
    dueDate: "",
    board: "Design Projects",
    tagsInput: "",
    description: "",
  };

  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof TaskFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error on change
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return "Task title is required";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: TaskPayload = {
      user_id: "test_user",
      title: formData.title.trim(),
      status: formData.status,
      priority: formData.priority,
      board: formData.board,
      tags: formData.tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      ...(formData.dueDate && { due_date: formData.dueDate }),
      ...(formData.description.trim() && {
        description: formData.description.trim(),
      }),
    };

    try {
      // Save to localStorage for demo
      const existingTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
      existingTasks.push(payload);
      localStorage.setItem("tasks", JSON.stringify(existingTasks));

      alert("Task created successfully!");
      setFormData(initialFormData); // Reset form
    } catch (err) {
      setError("Failed to save task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData(initialFormData);
    setError(null);
  };

  return (
    <aside className="w-full h-full ml-auto max-w-xs border border-green-4 bg-off-white flex flex-col pt-4">
      {/* Header */}
      <Typography
        variant="h6"
        className="text-section-sub-header px-4 bg-off-white"
        sx={{
          color: "var(--Dark-Green-1)",
          textTransform: "uppercase",
        }}
      >
        + Create New Task
      </Typography>

      {/* Form fills the rest of the column */}
      <form
        onSubmit={handleSubmit}
        className="w-full h-full flex flex-col justify-between gap-4 p-4 text-body text-dark-green-1"
      >
        <div className="flex flex-col gap-4  overflow-y-scroll">
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="TASK TITLE"
            placeholder="Enter task title..."
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            disabled={isSubmitting}
            required
            fullWidth
            color="success"
            variant="filled"
            sx={{
              "& .MuiFormLabel-root": {
                textTransform: "uppercase",
                fontSize: "12px",
                color: "var(--Dark-Green-1)",
              },
              "& .MuiInputBase-input": {
                fontSize: "14px",
                color: "var(--Dark-Green-1)",
              },
            }}
          />

          {/* STATUS */}
          <FormControl
            fullWidth
            color="success"
            variant="filled"
            sx={{
              "& .MuiFormLabel-root": {
                textTransform: "uppercase",
                fontSize: "12px",
                color: "var(--Dark-Green-1)",
              },
              "& .MuiInputBase-input": {
                fontSize: "14px",
                color: "var(--Dark-Green-1)",
              },
            }}
          >
            <InputLabel>STATUS</InputLabel>
            <Select
              value={formData.status}
              label="STATUS"
              onChange={(e) =>
                handleInputChange("status", e.target.value as string)
              }
              disabled={isSubmitting}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* PRIORITY */}
          <FormControl
            fullWidth
            color="success"
            variant="filled"
            sx={{
              "& .MuiFormLabel-root": {
                textTransform: "uppercase",
                fontSize: "12px",
                color: "var(--Dark-Green-1)",
              },
              "& .MuiInputBase-input": {
                fontSize: "14px",
                color: "var(--Dark-Green-1)",
              },
            }}
          >
            <InputLabel>PRIORITY</InputLabel>
            <Select
              value={formData.priority}
              label="PRIORITY"
              onChange={(e) =>
                handleInputChange("priority", e.target.value as string)
              }
              disabled={isSubmitting}
            >
              {PRIORITY_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* DUE DATE */}
          <TextField
            type="date"
            label="DUE DATE"
            value={formData.dueDate}
            onChange={(e) => handleInputChange("dueDate", e.target.value)}
            disabled={isSubmitting}
            fullWidth
            color="success"
            variant="filled"
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={{
              "& .MuiFormLabel-root": {
                textTransform: "uppercase",
                fontSize: "12px",
                color: "var(--Dark-Green-1)",
              },
              "& .MuiInputBase-input": {
                fontSize: "14px",
                color: "var(--Dark-Green-1)",
              },
            }}
          />

          {/* BOARD */}
          <FormControl
            fullWidth
            color="success"
            variant="filled"
            sx={{
              "& .MuiFormLabel-root": {
                textTransform: "uppercase",
                fontSize: "12px",
                color: "var(--Dark-Green-1)",
              },
              "& .MuiInputBase-input": {
                fontSize: "14px",
                color: "var(--Dark-Green-1)",
              },
            }}
          >
            <InputLabel>BOARD</InputLabel>
            <Select
              value={formData.board}
              label="BOARD"
              onChange={(e) =>
                handleInputChange("board", e.target.value as string)
              }
              disabled={isSubmitting}
            >
              {BOARD_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* TAGS */}
          <TextField
            label="TAGS (COMMA SEPARATED)"
            placeholder="e.g. design, bug, urgent"
            value={formData.tagsInput}
            onChange={(e) => handleInputChange("tagsInput", e.target.value)}
            disabled={isSubmitting}
            fullWidth
            color="success"
            variant="filled"
            sx={{
              "& .MuiFormLabel-root": {
                textTransform: "uppercase",
                fontSize: "12px",
                color: "var(--Dark-Green-1)",
              },
              "& .MuiInputBase-input": {
                fontSize: "14px",
                color: "var(--Dark-Green-1)",
              },
            }}
          />

          {/* DESCRIPTION */}
          <TextField
            multiline
            rows={3}
            label="DESCRIPTION"
            placeholder="Add task description..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            disabled={isSubmitting}
            fullWidth
            color="success"
            variant="filled"
            sx={{
              "& .MuiFormLabel-root": {
                textTransform: "uppercase",
                fontSize: "12px",
                color: "var(--Dark-Green-1)",
              },
              "& .MuiInputBase-input": {
                fontSize: "14px",
                color: "var(--Dark-Green-1)",
              },
            }}
          />
        </div>

        {/* Buttons pinned to bottom */}
        <div className="flex gap-4">
          <Button
            type="submit"
            className={`w-full rounded-full py-2 text-small-header transition ${
              isSubmitting
                ? "bg-gray-400 text-gray-200"
                : "bg-green-1 text-white hover:bg-green-2"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
          <FormButton
            onClick={handleClear}
            text="Clear"
            variant="clear"
            disabled={isSubmitting}
          />
          {/* <Button
            type="button"
            className="w-full py-2 rounded-full border border-beige text-dark-green-1 text-small-header bg-off-white hover:bg-beige transition"
            onClick={handleClear}
            disabled={isSubmitting}
          >
            Clear
          </Button> */}
        </div>
      </form>
    </aside>
  );
}
