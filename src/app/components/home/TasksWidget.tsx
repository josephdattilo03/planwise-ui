import { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
} from "@mui/material";
import { Task } from "../../types/task";
import { Board } from "../../types/board";
import TaskCard from "../tasks/TaskCard";

interface TasksWidgetProps {
  tasks: Task[];
  boards: Board[];
  onAddTask: (taskName: string, boardId: string, priority: number) => void | Promise<void>;
  onSelectTask?: (task: Task) => void;
}

function taskBoardsOnly(boards: Board[]): Board[] {
  return boards.filter((b) => !b.id.startsWith("gcal:"));
}

export default function TasksWidget({
  tasks,
  boards,
  onAddTask,
  onSelectTask,
}: TasksWidgetProps) {
  const [newTaskName, setNewTaskName] = useState("");
  const selectableBoards = taskBoardsOnly(boards);
  const [selectedBoardId, setSelectedBoardId] = useState("");
  const [selectedPriority, setSelectedPriority] = useState(1);
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);

  const boardSelectValue = useMemo(() => {
    if (selectableBoards.length === 0) return "";
    if (selectedBoardId && selectableBoards.some((b) => b.id === selectedBoardId)) {
      return selectedBoardId;
    }
    return selectableBoards[0].id;
  }, [selectableBoards, selectedBoardId]);

  const selectedDate = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + selectedDayOffset);
    return date;
  }, [selectedDayOffset]);

  const dayTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === selectedDate.getTime();
      })
      .sort((a, b) => (a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0))
      .slice(0, 5);
  }, [tasks, selectedDate]);

  const handleAddTask = () => {
    if (!newTaskName.trim() || !boardSelectValue) return;
    void onAddTask(newTaskName.trim(), boardSelectValue, selectedPriority);
    setNewTaskName("");
  };

  return (
    <Card
      sx={{
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--card-border)",
        backgroundColor: "var(--home-tasks-bg)",
        display: "flex",
        flexDirection: "column",
      }}
      elevation={0}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          flexGrow: 1,
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontSize: 16,
              fontWeight: "bold",
              mb: 2,
              color: "var(--dark-green-1)",
            }}
          >
            Your Tasks
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 1,
              mb: 3,
            }}
          >
            {Array.from({ length: 5 }).map((_, idx) => {
              const date = new Date();
              date.setDate(date.getDate() + idx);
              const isToday = idx === 0;
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
              const dayNumber = date.getDate();

              // Count tasks due on this specific day
              const tasksForDay = tasks.filter(task => {
                if (!task.dueDate) return false;
                const taskDate = task.dueDate;
                return taskDate.toDateString() === date.toDateString();
              }).length;

              return (
                <Paper
                  key={idx}
                  onClick={() => setSelectedDayOffset(idx)}
                  sx={{
                    textAlign: "center",
                    p: 1,
                    borderRadius: "var(--radius-md)",
                    backgroundColor:
                      selectedDayOffset === idx ? "var(--green-2)" : "var(--menu-bg)",
                    color: selectedDayOffset === idx ? "white" : "var(--foreground)",
                    fontSize: 14,
                    fontWeight: selectedDayOffset === idx ? 700 : 500,
                    border: "1px solid var(--card-border)",
                    position: "relative",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {dayName} {dayNumber}
                  {tasksForDay > 0 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundColor: "var(--green-2)",
                        color: "white",
                        fontSize: 12,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid white",
                      }}
                    >
                      {tasksForDay}
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              mb: 2,
              transition: "max-height 220ms ease, opacity 220ms ease",
              maxHeight: dayTasks.length > 0 ? 560 : 180,
              opacity: 1,
              overflow: "hidden",
            }}
          >
            {dayTasks.length > 0 ? (
              dayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onSelectTask?.(task)}
                />
              ))
            ) : (
              <Typography
                variant="body2"
                sx={{
                  color: "var(--dark-green-2)",
                  textAlign: "center",
                  py: 4,
                  fontStyle: "italic"
                }}
              >
                No tasks for this day
              </Typography>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            mt: "auto",
          }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Board and Priority selectors */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mb: 1.5,
            }}
          >
            <FormControl size="small" sx={{ minWidth: 100, flex: 1 }}>
              <InputLabel sx={{ fontSize: "12px" }}>Board</InputLabel>
              <Select
                value={boardSelectValue}
                label="Board"
                onChange={(e: SelectChangeEvent<string>) => setSelectedBoardId(e.target.value)}
                sx={{
                  borderRadius: "var(--radius-md)",
                  fontSize: "12px",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--input-text)",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--input-border)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--green-2)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--green-2)",
                  },
                  "& .MuiSelect-icon": {
                    color: "var(--input-text)",
                  },
                }}
              >
                {selectableBoards.map((board) => (
                  <MenuItem key={board.id} value={board.id} sx={{ fontSize: "12px" }}>
                    {board.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100, flex: 1 }}>
              <InputLabel sx={{ fontSize: "12px" }}>Priority</InputLabel>
              <Select
                value={selectedPriority}
                label="Priority"
                onChange={(e: SelectChangeEvent<number>) =>
                  setSelectedPriority(Number(e.target.value))
                }
                sx={{
                  borderRadius: "var(--radius-md)",
                  fontSize: "12px",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--input-text)",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--input-border)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--green-2)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--green-2)",
                  },
                  "& .MuiSelect-icon": {
                    color: "var(--input-text)",
                  },
                }}
              >
                <MenuItem value={0} sx={{ fontSize: "12px" }}>Low</MenuItem>
                <MenuItem value={1} sx={{ fontSize: "12px" }}>Medium</MenuItem>
                <MenuItem value={2} sx={{ fontSize: "12px" }}>High</MenuItem>
                <MenuItem value={3} sx={{ fontSize: "12px" }}>Now</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Task input and button */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <TextField
              fullWidth
              placeholder="Add a task..."
              value={newTaskName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                e.stopPropagation();
                setNewTaskName(e.target.value);
              }}
              onKeyPress={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                  handleAddTask();
                }
              }}
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                  backgroundColor: "var(--input-bg)",
                  color: "var(--input-text)",
                  "& fieldset": {
                    borderColor: "var(--input-border)",
                  },
                  "&:hover fieldset": {
                    borderColor: "var(--green-2)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--green-2)",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "var(--input-text)",
                },
              }}
            />
            <Button
              variant="contained"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleAddTask();
              }}
              disabled={!newTaskName.trim() || !boardSelectValue}
              sx={{
                textTransform: "none",
                borderRadius: 999,
                backgroundColor: "var(--green-2)",
                px: 2.5,
                py: 1.5,
                fontSize: 13,
                fontWeight: 600,
                color: "black",
                "&:hover": {
                  backgroundColor: "var(--green-3)"
                },
                "&:disabled": {
                  backgroundColor: "rgba(0,0,0,0.12)",
                  color: "rgba(0,0,0,0.26)"
                }
              }}
            >
              Add
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
