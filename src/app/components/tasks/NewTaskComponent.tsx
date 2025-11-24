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
const BOARD_OPTIONS = ["Design Projects", "Senior Design", "PennOS", "House", "Personal"];

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
    setFormData(prev => ({ ...prev, [field]: value }));
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
        .map(tag => tag.trim())
        .filter(Boolean),
      ...(formData.dueDate && { due_date: formData.dueDate }),
      ...(formData.description.trim() && { description: formData.description.trim() }),
    };

    try {
      // Save to localStorage for demo
      const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      existingTasks.push(payload);
      localStorage.setItem('tasks', JSON.stringify(existingTasks));

      alert('Task created successfully!');
      setFormData(initialFormData); // Reset form
    } catch (err) {
      setError('Failed to save task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData(initialFormData);
    setError(null);
  };

  return (
    <aside
      className="bg-off-white ml-auto border-l-2 border-green-4 w-96 h-screen flex flex-col"
    >
      {/* Header */}
      <Typography
        variant="h6"
        className="text-section-sub-header px-6 pt-6 pb-3 bg-off-white"
        sx={{
          color: "var(--Dark-Green-1)",
          textTransform: "uppercase",
        }}
      >
        + Create New Task
      </Typography>

      {/* Form fills the rest of the column */}
      <div className="flex-1 bg-off-white">
        <form
          onSubmit={handleSubmit}
          className="bg-off-white flex flex-col justify-start gap-6 px-6 py-6 text-body text-dark-green-1"
        >
          <div className="flex flex-col gap-6">
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="TASK TITLE"
              placeholder="Enter task title..."
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              disabled={isSubmitting}
              required
              fullWidth
              sx={{
                "& .MuiFormLabel-root": {
                  textTransform: "uppercase",
                  fontSize: "14px",
                  color: "var(--Dark-Green-1)",
                },
                "& .MuiInputBase-input": {
                  color: "var(--Dark-Green-1)",
                },
              }}
            />

            {/* STATUS */}
            <FormControl
              fullWidth
              sx={{
                "& .MuiFormLabel-root": {
                  textTransform: "uppercase",
                  fontSize: "14px",
                  color: "var(--Dark-Green-1)",
                },
                "& .MuiInputBase-input": {
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
              sx={{
                "& .MuiFormLabel-root": {
                  textTransform: "uppercase",
                  fontSize: "14px",
                  color: "var(--Dark-Green-1)",
                },
                "& .MuiInputBase-input": {
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
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiFormLabel-root": {
                  textTransform: "uppercase",
                  fontSize: "14px",
                  color: "var(--Dark-Green-1)",
                },
                "& .MuiInputBase-input": {
                  color: "var(--Dark-Green-1)",
                },
              }}
            />

            {/* BOARD */}
            <FormControl
              fullWidth
              sx={{
                "& .MuiFormLabel-root": {
                  textTransform: "uppercase",
                  fontSize: "14px",
                  color: "var(--Dark-Green-1)",
                },
                "& .MuiInputBase-input": {
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
              sx={{
                "& .MuiFormLabel-root": {
                  textTransform: "uppercase",
                  fontSize: "14px",
                  color: "var(--Dark-Green-1)",
                },
                "& .MuiInputBase-input": {
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
              onChange={(e) =>
                handleInputChange("description", e.target.value)
              }
              disabled={isSubmitting}
              fullWidth
              sx={{
                "& .MuiFormLabel-root": {
                  textTransform: "uppercase",
                  fontSize: "14px",
                  color: "var(--Dark-Green-1)",
                },
                "& .MuiInputBase-input": {
                  color: "var(--Dark-Green-1)",
                },
              }}
            />
          </div>

          {/* Buttons pinned to bottom */}
          <div className="mt-0 flex gap-5">
            <Button
              type="submit"
              className={`flex-1 rounded-full px-4 py-2 text-button transition ${
                isSubmitting
                  ? "bg-gray-400 text-gray-200"
                  : "bg-green-2 text-off-white hover:bg-green-1"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-full border border-green-3 bg-off-white text-button text-dark-green-1 py-2 hover:bg-beige transition"
              onClick={handleClear}
              disabled={isSubmitting}
            >
              Clear
            </Button>
          </div>
        </form>
      </div>
    </aside>
  );
}
