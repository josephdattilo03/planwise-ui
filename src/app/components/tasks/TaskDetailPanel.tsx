"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Divider,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
  Autocomplete,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useSession } from "next-auth/react";

import type { Board, Tag, Task } from "../../types";
import { useBoardsTags } from "../../providers/boardsTags/BoardsTagsContext";
import { createTask, updateTask } from "../../services/tasks/taskService";
import { fetchProgress } from "../../services/dataService";
import TagChip from "../tags/TagChip";
import BoardChip from "../boards/BoardChip";
import FormButton from "@/src/common/button/FormButton";

type Props = {
  mode?: "edit" | "create";
  task?: Task;
  onSaveSuccess?: () => void | Promise<void>;
};

type Field =
  | "title"
  | "description"
  | "board"
  | "dueDate"
  | "status"
  | "priority"
  | "tags"
  | null;

const progressOptions = fetchProgress();

export default function TaskDetailPanel({
  task,
  mode = task ? "edit" : "create",
  onSaveSuccess,
}: Props) {
  const { data: session } = useSession();
  const userId = session?.user?.email ?? undefined;
  const { boards, tags } = useBoardsTags();

  const [activeField, setActiveField] = useState<Field>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [autosaveState, setAutosaveState] = useState<
    "idle" | "dirty" | "saving" | "saved" | "error"
  >("idle");

  const autosaveTimerRef = useRef<number | null>(null);
  const baselineRef = useRef<{
    task: Task;
    key: {
      name: string;
      description: string;
      boardId: string;
      dueDateIso: string;
      progress: Task["progress"];
      priorityLevel: number;
      tagIdsKey: string;
    };
  } | null>(null);
  const pendingDiscardRef = useRef(false);
  const [savedKey, setSavedKey] = useState<{
    name: string;
    description: string;
    boardId: string;
    dueDateIso: string;
    progress: Task["progress"];
    priorityLevel: number;
    tagIdsKey: string;
  } | null>(null);

  const baseTask: Task = useMemo(() => {
    if (task) return task;
    return {
      id: "",
      name: "",
      description: "",
      progress: "to-do",
      priorityLevel: 1,
      dueDate: new Date(),
      board: { id: "", name: "Select board", color: "#ccc" },
      tags: [],
    };
  }, [task]);

  const [draft, setDraft] = useState(() => ({
    name: baseTask.name ?? "",
    description: baseTask.description ?? "",
    boardId: baseTask.board?.id ?? "",
    dueDate: baseTask.dueDate ? new Date(baseTask.dueDate) : new Date(),
    progress: baseTask.progress ?? "to-do",
    priorityLevel:
      typeof baseTask.priorityLevel === "number" ? baseTask.priorityLevel : 0,
    tagIds: new Set<string>((baseTask.tags ?? []).map((t) => t.id)),
  }));

  const selectedBoard = useMemo(
    () => boards.find((b) => b.id === draft.boardId) ?? baseTask.board ?? null,
    [boards, draft.boardId, baseTask.board]
  );

  const selectedTags = useMemo(() => {
    const byId = new Map(tags.map((t) => [t.id, t]));
    const list: Tag[] = [];
    draft.tagIds.forEach((id) => {
      const found = byId.get(id);
      if (found) list.push(found);
    });
    return list;
  }, [draft.tagIds, tags]);

  const draftKey = useMemo(() => {
    const dueDateIso = new Date(draft.dueDate).toISOString().split("T")[0];
    const tagIdsKey = Array.from(draft.tagIds).sort().join(",");
    return {
      name: draft.name,
      description: draft.description ?? "",
      boardId: draft.boardId ?? "",
      dueDateIso,
      progress: draft.progress as Task["progress"],
      priorityLevel: draft.priorityLevel,
      tagIdsKey,
    };
  }, [draft]);

  const hasChanges = useMemo(() => {
    if (mode === "create") {
      return (
        !!draft.name.trim() ||
        !!draft.description.trim() ||
        !!draft.boardId ||
        draft.progress !== "to-do" ||
        draft.priorityLevel !== 1 ||
        draft.tagIds.size > 0
      );
    }

    const last = savedKey;
    if (last !== null) {
      return (
        last.name !== draftKey.name ||
        last.description !== draftKey.description ||
        last.boardId !== draftKey.boardId ||
        last.dueDateIso !== draftKey.dueDateIso ||
        last.progress !== draftKey.progress ||
        last.priorityLevel !== draftKey.priorityLevel ||
        last.tagIdsKey !== draftKey.tagIdsKey
      );
    }

    // Fallback: compare to base task props.
    const baseDueIso = new Date(baseTask.dueDate).toISOString().split("T")[0];
    const baseTagsKey = (baseTask.tags ?? [])
      .map((t) => t.id)
      .sort()
      .join(",");
    return (
      baseTask.name !== draftKey.name ||
      (baseTask.description ?? "") !== draftKey.description ||
      (baseTask.board?.id ?? "") !== draftKey.boardId ||
      baseDueIso !== draftKey.dueDateIso ||
      baseTask.progress !== draftKey.progress ||
      baseTask.priorityLevel !== draftKey.priorityLevel ||
      baseTagsKey !== draftKey.tagIdsKey
    );
  }, [mode, draftKey, baseTask, savedKey]);

  const hasBaselineChanges = useMemo(() => {
    if (mode !== "edit") return hasChanges;
    const baseline = baselineRef.current?.key;
    if (!baseline) return hasChanges;
    return (
      baseline.name !== draftKey.name ||
      baseline.description !== draftKey.description ||
      baseline.boardId !== draftKey.boardId ||
      baseline.dueDateIso !== draftKey.dueDateIso ||
      baseline.progress !== draftKey.progress ||
      baseline.priorityLevel !== draftKey.priorityLevel ||
      baseline.tagIdsKey !== draftKey.tagIdsKey
    );
  }, [mode, hasChanges, draftKey]);

  // Initialize baseline + saved snapshot for edit mode.
  useEffect(() => {
    if (mode !== "edit") return;
    if (!task?.id) return;
    const baseDueIso = new Date(baseTask.dueDate).toISOString().split("T")[0];
    const baseTagsKey = (baseTask.tags ?? [])
      .map((t) => t.id)
      .sort()
      .join(",");
    const key = {
      name: baseTask.name,
      description: baseTask.description ?? "",
      boardId: baseTask.board?.id ?? "",
      dueDateIso: baseDueIso,
      progress: baseTask.progress,
      priorityLevel: baseTask.priorityLevel,
      tagIdsKey: baseTagsKey,
    };
    baselineRef.current = { task: baseTask, key };
    setSavedKey(key);
    setAutosaveState("saved");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, task?.id]);

  // Debounced autosave for edit mode.
  useEffect(() => {
    if (mode !== "edit") return;
    if (!task?.id) return;
    if (!hasChanges) {
      if (autosaveState === "dirty") setAutosaveState("idle");
      return;
    }

    setAutosaveState((s) => (s === "saving" ? s : "dirty"));

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = window.setTimeout(() => {
      void (async () => {
        if (!selectedBoard || !selectedBoard.id) {
          // For edit, board should always exist; don't autosave if somehow missing.
          return;
        }
        setAutosaveState("saving");
        setSaving(true);
        setError(null);
        try {
          const updated: Task = {
            ...baseTask,
            name: draft.name.trim() || "Untitled Task",
            description: draft.description,
            board: selectedBoard,
            dueDate: new Date(draft.dueDate),
            progress: draft.progress as Task["progress"],
            priorityLevel: draft.priorityLevel,
            tags: selectedTags,
          };
          await updateTask(updated, userId);
          setSavedKey({ ...draftKey });
          setAutosaveState("saved");
          await onSaveSuccess?.();
        } catch (e) {
          console.error(e);
          setAutosaveState("error");
          setError("Autosave failed. Check connection and try again.");
        } finally {
          setSaving(false);
          if (pendingDiscardRef.current) {
            pendingDiscardRef.current = false;
            void resetDraft();
          }
        }
      })();
    }, 650);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [
    mode,
    task?.id,
    hasChanges,
    draftKey,
    baseTask,
    draft,
    selectedBoard,
    selectedTags,
    userId,
    onSaveSuccess,
    autosaveState,
  ]);

  const resetDraft = async () => {
    // Allow discarding even while an autosave request is in-flight.
    // We can't cancel the request, so we queue the discard and run it as soon as saving finishes.
    if (mode === "edit" && saving) {
      pendingDiscardRef.current = true;
      return;
    }

    setDraft({
      name: baseTask.name ?? "",
      description: baseTask.description ?? "",
      boardId: baseTask.board?.id ?? "",
      dueDate: baseTask.dueDate ? new Date(baseTask.dueDate) : new Date(),
      progress: baseTask.progress ?? "to-do",
      priorityLevel:
        typeof baseTask.priorityLevel === "number" ? baseTask.priorityLevel : 0,
      tagIds: new Set<string>((baseTask.tags ?? []).map((t) => t.id)),
    });
    setActiveField(null);
    setError(null);
    if (mode === "edit") {
      // Cancel pending autosave and revert in backend to baseline-at-open.
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }

      const baseline = baselineRef.current;
      if (baseline?.task?.id) {
        try {
          setAutosaveState("saving");
          setSaving(true);
          await updateTask(baseline.task, userId);
          setSavedKey(baseline.key);
          setAutosaveState("saved");
          await onSaveSuccess?.();
        } catch (e) {
          console.error(e);
          setAutosaveState("error");
          setError("Failed to discard. Try again.");
        } finally {
          setSaving(false);
        }
      } else {
        setAutosaveState("saved");
      }
    }
  };

  const doSave = async () => {
    if (!selectedBoard) {
      setError("Please choose a board.");
      return;
    }
    if (mode === "create" && !selectedBoard.id) {
      setError("Please choose a board.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (mode === "create") {
        await createTask(
          {
            name: draft.name.trim() || "Untitled Task",
            description: draft.description,
            board: selectedBoard,
            dueDate: new Date(draft.dueDate),
            progress: draft.progress as Task["progress"],
            priorityLevel: draft.priorityLevel,
            tags: selectedTags,
          },
          userId
        );
      } else {
        const updated: Task = {
          ...baseTask,
          name: draft.name.trim() || "Untitled Task",
          description: draft.description,
          board: selectedBoard,
          dueDate: new Date(draft.dueDate),
          progress: draft.progress as Task["progress"],
          priorityLevel: draft.priorityLevel,
          tags: selectedTags,
        };
        await updateTask(updated, userId);
      }
      await onSaveSuccess?.();
      setActiveField(null);
    } catch (e) {
      console.error(e);
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const Row = ({
    label,
    children,
    field,
  }: {
    label: string;
    children: React.ReactNode;
    field: Exclude<Field, "title" | "description" | null>;
  }) => (
    <Box
      onClick={() => setActiveField(field)}
      sx={{
        display: "grid",
        gridTemplateColumns: "110px 1fr",
        gap: 2,
        py: 1.25,
        px: 2,
        minHeight: 56,
        cursor: "text",
        borderRadius: "var(--radius-md)",
        "&:hover": { bgcolor: "var(--menu-item-hover)" },
        alignItems: "center",
      }}
    >
      <Typography
        sx={{
          color: "var(--dark-green-2)",
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          height: "100%",
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          "& > *": { width: "100%" },
        }}
      >
        {children}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 4, pt: 2, pb: 2 }}>
        {mode === "create" && (
          <Typography sx={{ color: "var(--dark-green-2)", fontSize: 13, mb: 1 }}>
            New task
          </Typography>
        )}
        {/* Reserve height so switching display/edit doesn't jump */}
        <Box sx={{ minHeight: 44, display: "flex", alignItems: "center" }}>
          {activeField === "title" ? (
            <TextField
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              variant="standard"
              autoFocus
              fullWidth
              InputProps={{
                sx: { fontSize: 32, fontWeight: 800, color: "var(--foreground)" },
                disableUnderline: true,
              }}
            />
          ) : (
            <Typography
              onClick={() => setActiveField("title")}
              sx={{
                fontSize: 32,
                fontWeight: 800,
                color: "var(--foreground)",
                cursor: "text",
                lineHeight: 1.1,
              }}
            >
              {draft.name || "Untitled"}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ px: 4, pb: 2 }}>
        <Row label="Board" field="board">
          {activeField === "board" ? (
            <Autocomplete<Board, false, false, false>
              options={boards}
              value={selectedBoard}
              open={boardOpen}
              onOpen={() => setBoardOpen(true)}
              onClose={(_, reason) => {
                // Keep open behavior controlled; close on explicit dismiss.
                if (reason === "escape" || reason === "blur") {
                  setBoardOpen(false);
                  setActiveField(null);
                }
              }}
              onChange={(_, value) => {
                setDraft((d) => ({ ...d, boardId: value?.id ?? "" }));
                // Close after a single selection.
                setBoardOpen(false);
                setActiveField(null);
              }}
              getOptionLabel={(o) => o.name}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              fullWidth
              sx={{ width: "100%" }}
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
                  size="small"
                  placeholder="Select board"
                  sx={{
                    "& .MuiInputBase-root": { height: 40 },
                    "& .MuiInputBase-input": {
                      fontSize: "var(--text-chip-info-font-size)",
                      fontWeight: "var(--text-chip-info-font-weight)",
                    },
                    "& .MuiInputBase-input::placeholder": {
                      fontSize: "var(--text-chip-info-font-size)",
                      fontWeight: "var(--text-chip-info-font-weight)",
                    },
                  }}
                />
              )}
            />
          ) : selectedBoard ? (
            <Box sx={{ display: "inline-flex" }}>
              <BoardChip board={selectedBoard} />
            </Box>
          ) : (
            <Typography sx={{ color: "var(--dark-green-2)", fontSize: "var(--text-chip-info-font-size)" }}>
              Click to set
            </Typography>
          )}
        </Row>

        <Row label="Date" field="dueDate">
          {activeField === "dueDate" ? (
            <DatePicker
              value={draft.dueDate ? new Date(draft.dueDate) : null}
              onChange={(newValue) => {
                if (newValue) {
                  setDraft((d) => ({ ...d, dueDate: new Date(newValue) }));
                }
              }}
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    "& .MuiInputBase-root": { height: 40 },
                    "& .MuiInputBase-input": {
                      fontSize: "var(--text-chip-info-font-size)",
                      fontWeight: "var(--text-chip-info-font-weight)",
                    },
                    "& .MuiInputBase-input::placeholder": {
                      fontSize: "var(--text-chip-info-font-size)",
                      fontWeight: "var(--text-chip-info-font-weight)",
                    },
                  },
                },
              }}
            />
          ) : (
            <Typography sx={{ color: "var(--foreground)", fontSize: "var(--text-chip-info-font-size)" }}>
              {new Date(draft.dueDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Typography>
          )}
        </Row>

        <Row label="Status" field="status">
          {activeField === "status" ? (
            <FormControl size="small" fullWidth sx={{ width: "100%" }}>
              <Select
                value={draft.progress}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    progress: e.target.value as Task["progress"],
                  }))
                }
                fullWidth
                sx={{
                  height: 40,
                  width: "100%",
                  "& .MuiSelect-select": {
                    fontSize: "var(--text-chip-info-font-size)",
                    fontWeight: "var(--text-chip-info-font-weight)",
                  },
                }}
              >
                {Object.entries(progressOptions).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography sx={{ color: "var(--foreground)", fontSize: "var(--text-chip-info-font-size)" }}>
              {progressOptions[draft.progress] ?? draft.progress}
            </Typography>
          )}
        </Row>

        <Row label="Priority" field="priority">
          {activeField === "priority" ? (
            <FormControl size="small" fullWidth sx={{ width: "100%" }}>
              <Select
                value={draft.priorityLevel}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    priorityLevel: Number(e.target.value),
                  }))
                }
                fullWidth
                sx={{
                  height: 40,
                  width: "100%",
                  "& .MuiSelect-select": {
                    fontSize: "var(--text-chip-info-font-size)",
                    fontWeight: "var(--text-chip-info-font-weight)",
                  },
                }}
              >
                {[0, 1, 2, 3].map((n) => (
                  <MenuItem key={n} value={n}>
                    {"!".repeat(n + 1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography sx={{ color: "var(--foreground)", fontSize: "var(--text-chip-info-font-size)" }}>
              {"!".repeat(draft.priorityLevel + 1)}
            </Typography>
          )}
        </Row>

        <Row label="Tags" field="tags">
          {activeField === "tags" ? (
            <Autocomplete<Tag, true, false, false>
              multiple
              options={tags}
              value={selectedTags}
              open={tagsOpen}
              onOpen={() => setTagsOpen(true)}
              onClose={(_, reason) => {
                // Keep it open after selecting; close only on explicit dismiss.
                if (reason === "escape" || reason === "blur") {
                  setTagsOpen(false);
                  setActiveField(null);
                }
              }}
              // onBlur={() => {
              //   setTagsOpen(false);
              //   setActiveField(null);
              // }}
              onChange={(_, value) => {
                setDraft((d) => ({
                  ...d,
                  tagIds: new Set(value.map((t) => t.id)),
                }));
              }}
              getOptionLabel={(o) => o.name}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              disableCloseOnSelect
              fullWidth
              sx={{ width: "100%" }}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <li key={key} {...optionProps}>
                    <TagChip tag={option} />
                  </li>
                );
              }}
              renderValue={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return (
                    <Box key={key} component="span" {...tagProps} sx={{ mr: 0.5 }}>
                      <TagChip tag={option} />
                    </Box>
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder="Select tags"
                  sx={{
                    "& .MuiInputBase-root": { minHeight: 40, py: 0.25 },
                    "& .MuiInputBase-input": {
                      fontSize: "var(--text-chip-info-font-size)",
                      fontWeight: "var(--text-chip-info-font-weight)",
                    },
                    "& .MuiInputBase-input::placeholder": {
                      fontSize: "var(--text-chip-info-font-size)",
                      fontWeight: "var(--text-chip-info-font-weight)",
                    },
                  }}
                />
              )}
            />
          ) : selectedTags.length > 0 ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {selectedTags.map((tag) => (
                <TagChip key={tag.id} tag={tag} />
              ))}
            </Box>
          ) : (
            <Typography sx={{ color: "var(--dark-green-2)", fontSize: "var(--text-chip-info-font-size)" }}>
              Click to add
            </Typography>
          )}
        </Row>
      </Box>

      <Divider />

      <Box sx={{ px: 4, py: 2 }}>
        <Typography sx={{ color: "var(--dark-green-2)", fontSize: 13, mb: 1 }}>
          Description
        </Typography>
        {activeField === "description" ? (
          <TextField
            value={draft.description}
            onChange={(e) =>
              setDraft((d) => ({ ...d, description: e.target.value }))
            }
            multiline
            minRows={5}
            fullWidth
            placeholder="Add a description..."
            onBlur={() => setActiveField(null)}
            slotProps={{
              input: {
                style: {
                  borderRadius: "var(--radius-md)",
                }
              }
            }}
          />
        ) : (
          <Box
            onClick={() => setActiveField("description")}
            sx={{
              cursor: "text",
              borderRadius: "var(--radius-md)",
              p: 1.5,
              bgcolor: "var(--menu-bg)",
              border: "1px solid var(--card-border)",
              "&:hover": { bgcolor: "var(--menu-item-hover)" },
              minHeight: 133,
            }}
          >
            <Typography sx={{ color: "var(--foreground)", whiteSpace: "pre-wrap" }}>
              {draft.description?.trim()
                ? draft.description
                : "Click to add a description..."}
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ mt: "auto", px: 4, pb: 2 }}>
        {error && (
          <Typography sx={{ color: "var(--red)", fontSize: 13, mb: 1 }}>
            {error}
          </Typography>
        )}
        {mode === "edit" ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography sx={{ color: "var(--dark-green-2)", fontSize: 13 }}>
              {autosaveState === "saving"
                ? "Saving…"
                : autosaveState === "saved"
                  ? "Saved"
                  : autosaveState === "error"
                    ? "Autosave failed"
                    : hasChanges
                      ? "Unsaved changes…"
                      : "Saved"}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Box sx={{ width: 180 }}>
              <FormButton
                onClick={resetDraft}
                disabled={!hasBaselineChanges}
                text="Discard changes"
                variant="clear"
                fullWidth
              />
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Box sx={{ flex: 1 }}>
              <FormButton
                onClick={doSave}
                disabled={!draft.boardId || saving}
                text={saving ? "Saving..." : "Create"}
                variant="confirm"
                fullWidth
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FormButton
                onClick={resetDraft}
                disabled={!hasChanges || saving}
                text="Clear"
                variant="clear"
                fullWidth
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

