"use client";

import React, { useState, FormEvent, useRef } from "react";
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
  Autocomplete,
  createFilterOptions,
  IconButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { useTask } from "../../providers/tasks/useTask";
import FormButton from "@/src/common/button/FormButton";
import BoardChip from "../boards/BoardChip";
import { Tag, TagOption } from "../../types";
import TagChip from "../tags/TagChip";

import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import TagEditDialog from "../tags/TagEditDialog";

const filter = createFilterOptions<TagOption>();
interface NewTaskComponentProps {
  onSaveSuccess?: () => void;
}

export default function NewTaskComponent({
  onSaveSuccess,
}: NewTaskComponentProps) {
  const {
    isEditMode,

    /** form fields from TaskContext */
    id,
    title,
    description,
    dueDate,
    priorityLevel,
    status,

    setTitle,
    setDescription,
    setDueDate,
    setPriorityLevel,
    setStatus,

    /** board + tag selections */
    boards,
    tags,
    progressOptions,
    priorityOptions,
    newBoardId,
    newTagIds,

    changeBoard,
    toggleTag,
    createTag,
    editTag,

    resetTaskState,
    clearTaskState,
  } = useTask();

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [isEditTag, setIsEditTag] = useState<Tag | null>(null);

  const selectedBoard = boards.find((b) => b.id === newBoardId) || null;

  const selectedTagOptions: TagOption[] = tags.filter((t) => newTagIds.has(t.id));
  const selectedTags = tags.filter((t) => newTagIds.has(t.id));

  /** Validate */
  const validate = () => {
    if (!title.trim()) return "Task title is required";
    if (newBoardId === "") return "Please choose a board";
    return null;
  };

  /** Submit handler */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      if (!isEditMode) {
        // BUILD PAYLOAD FOR CREATE
        const payload = {
          id: id,
          name: title.trim(),
          description: description.trim(),
          dueDate: dueDate,
          priorityLevel: priorityLevel,
          progress: status,
          boardId: newBoardId,
          tagIds: Array.from(newTagIds),
        };

        console.log("✔ CREATE TASK PAYLOAD:", payload);

        // TODO: call your create task service
        // Save to localStorage for demo
        const existingTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        existingTasks.push(payload);
        localStorage.setItem("tasks", JSON.stringify(existingTasks));

        clearTaskState();
        onSaveSuccess?.();
      } else {
        // EDIT MODE
        const payload = {
          id: id,
          name: title.trim(),
          description: description.trim(),
          dueDate: dueDate,
          priorityLevel: priorityLevel,
          progress: status,
          boardId: newBoardId,
          tagIds: Array.from(newTagIds),
        };

        console.log("✔ EDIT TASK PAYLOAD:", payload);

        // TODO: call your update task service
        // Save to localStorage for demo
        const existingTasks = JSON.parse(localStorage.getItem("tasks") || "[]");

        // find the index
        const index = existingTasks.findIndex((t: any) => t.id === id);

        if (index !== -1) {
          existingTasks[index] = payload; // overwrite
        } else {
          console.warn("⚠ Task not found, adding instead");
          existingTasks.push(payload);
        }

        localStorage.setItem("tasks", JSON.stringify(existingTasks));

        clearTaskState();
        onSaveSuccess?.();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to save task. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="w-full h-full max-w-xs border-l border-green-4 bg-sidebar-bg flex flex-col pt-4">
      {/* Header */}
      <Typography
        variant="h6"
        className="text-section-sub-header px-4 pb-2 bg-sidebar-bg"
        sx={{
          color: "var(--Dark-Green-1)",
          textTransform: "uppercase",
        }}
      >
        + {isEditMode ? "Edit Task" : "Create New Task"}
      </Typography>
      {/* Form fills the rest of the column */}
      <form
        onSubmit={handleSubmit}
        className="scroll-shadows w-full h-full overflow-y-scroll flex flex-col justify-between gap-4 px-4 pb-4 pt-2 text-body text-dark-green-1"
      >
        <div className="flex flex-col gap-4">
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="TASK TITLE"
            placeholder="Enter task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            variant="filled"
            color="success"
            sx={{
              "& .MuiFormLabel-root": {
                textTransform: "uppercase",
                fontSize: "14px",
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
                fontSize: "14px",
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
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={submitting}
            >
              {Object.entries(progressOptions).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
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
                fontSize: "14px",
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
              value={priorityLevel}
              onChange={(e) => setPriorityLevel(Number(e.target.value))}
            >
              {Object.entries(priorityOptions).map(([value, label]) => (
                <MenuItem key={value} value={Number(value)}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* DUE DATE */}
          <DatePicker
            label="DUE DATE"
            value={dueDate ? new Date(dueDate) : null}
            onChange={(newValue) => {
              if (newValue) {
                setDueDate(newValue);
              }
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: "filled",
                color: "success",
                sx: {
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "var(--input-bg)",
                    color: "var(--input-text)",
                    "& fieldset": {
                      borderColor: "var(--input-border)",
                    },
                    "&:hover fieldset": {
                      borderColor: "var(--Green-2)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--Green-2)",
                    },
                    "& .MuiInputAdornment-root .MuiIconButton-root": {
                      color: "var(--input-text)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "var(--input-text)",
                  },
                },
              },
              openPickerIcon: {
                sx: {
                  color: "var(--input-text)",
                },
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
            <Autocomplete
              options={boards}
              value={selectedBoard}
              onChange={(e, value) => changeBoard(value?.id ?? "")}
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
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="BOARD"
                  variant="filled"
                  color="success"
                  className="font-sans"
                />
              )}
              renderValue={(selected) => {
                return (
                  <div className="pl-1">
                    <BoardChip board={selected} fullWidth={false} />
                  </div>
                );
              }}
              sx={{
                "& .MuiFormLabel-root": {
                  fontSize: "14px",
                },
              }}
            />
          </FormControl>

          {/* TAGS */}
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
            <Autocomplete<TagOption, true, false, true>
              multiple
              freeSolo
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              forcePopupIcon
              value={selectedTagOptions}
              options={tags as TagOption[]}
              size="small"
              filterOptions={(options, params) => {
                const filtered = filter(options, params);

                if (params.inputValue !== "") {
                  filtered.push({
                    // synthetic option for “Add "<input>”
                    id: -1,
                    name: params.inputValue,
                    backgroundColor: "#E0E0E0",
                    textColor: "#333333",
                    borderColor: "#999999",
                    inputValue: params.inputValue,
                  });
                }

                return filtered;
              }}
              getOptionLabel={(option) => {
                // typed in directly as string
                if (typeof option === "string") {
                  return option;
                }
                // “Add …” synthetic option
                if (option.inputValue) {
                  return option.inputValue;
                }
                // regular Tag
                return option.name;
              }}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;

                return (
                  <li key={key} {...optionProps}>
                    <div className="group flex w-full items-center justify-between gap-2 font-sans">
                      <TagChip tag={option} />
                      {!option.inputValue && option.id !== -1 && (
                        <IconButton
                          size="small"
                          sx={{ "& .MuiSvgIcon-root": { fontSize: 16 } }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditTag(option); // open edit dialog
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizRoundedIcon fontSize="small" />
                        </IconButton>
                      )}
                    </div>
                  </li>
                );
              }}
              onChange={(event, newValue) => {
                // Handle “create new tag” first
                let createdTagId: number | null = null;

                newValue.forEach((option) => {
                  if (typeof option === "string") {
                    const name = option.trim();
                    if (!name) return;
                    createdTagId = createTag({ name }).id;
                  } else if (option.inputValue) {
                    const name = option.inputValue.trim();
                    if (!name) return;
                    createdTagId = createTag({ name }).id;
                  }
                });

                if (createdTagId !== null) {
                  // ensure newly created tag is selected
                  toggleTag(createdTagId);
                  return;
                }

                // For existing tags, compute new selection set
                const newIdSet = new Set(
                  newValue
                    .filter(
                      (opt): opt is TagOption =>
                        typeof opt !== "string" && !opt.inputValue
                    )
                    .map((t) => t.id)
                );

                // Diff vs previous selection and call onToggleTag as needed
                tags.forEach((tag) => {
                  const wasSelected = newTagIds.has(tag.id);
                  const isSelectedNow = newIdSet.has(tag.id);
                  if (wasSelected !== isSelectedNow) {
                    toggleTag(tag.id);
                  }
                });
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              disableCloseOnSelect
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="TAGS"
                  variant="filled"
                  size="small"
                  color="success"
                  className="font-sans"
                />
              )}
              renderValue={(value, getItemProps) => (
                <span className="pl-1 italic">{`${value.length} ${value.length > 1 ? "tags" : "tag"} selected`}</span>
              )}
              sx={{
                "& .MuiChip-label": {
                  fontSize: "12px",
                },
                "& .MuiFormLabel-root": {
                  fontSize: "14px",
                },
              }}
            />
          </FormControl>
          <TagEditDialog
            open={!!isEditTag}
            tag={isEditTag}
            onClose={() => setIsEditTag(null)}
            onSave={(updated) => {
              editTag(updated);
              setIsEditTag(null);
            }}
          />

          <div className="flex flex-wrap gap-2">
            {selectedTags.length > 0 &&
              selectedTags.map((tag) => (
                <div
                  key={tag.id}
                  className="transition rounded-md"
                  onClick={() => toggleTag(tag.id)}
                >
                  <TagChip
                    tag={tag}
                    showRemoveButton={newTagIds.has(tag.id)}
                    onRemoveClick={() => toggleTag(tag.id)}
                  />
                </div>
              ))}
          </div>

          {/* DESCRIPTION */}
          <TextField
            multiline
            rows={3}
            label="DESCRIPTION"
            placeholder="Add task description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
            fullWidth
            color="success"
            variant="filled"
            sx={{
              "& .MuiFormLabel-root": {
                textTransform: "uppercase",
                fontSize: "14px",
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
            className={`w-full rounded-md py-2 text-small-header transition ${submitting
              ? "bg-gray-400 text-gray-200"
              : "bg-green-1 text-white hover:bg-green-2"
              }`}
            disabled={submitting}
          >
            {submitting
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
                ? "Save Changes"
                : "Create Task"}
          </Button>
          <FormButton
            onClick={resetTaskState}
            text={isEditMode ? "Reset" : "Clear"}
            variant="clear"
            disabled={submitting}
          />
        </div>
      </form>
    </aside>
  );
}
