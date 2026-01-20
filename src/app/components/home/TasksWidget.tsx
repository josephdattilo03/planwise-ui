import { useState } from "react";
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
} from "@mui/material";
import TaskIcon from "@mui/icons-material/Task";
import { useRouter } from "next/navigation";
import { Task } from "../../types/task";
import { Board } from "../../types/board";

interface TasksWidgetProps {
  tasks: Task[];
  boards: Board[];
  onAddTask: (taskName: string, boardId: string, priority: number) => void;
}

export default function TasksWidget({ tasks, boards, onAddTask }: TasksWidgetProps) {
  const router = useRouter();
  const [newTaskName, setNewTaskName] = useState("");
  const [selectedBoardId, setSelectedBoardId] = useState(boards[0]?.id || "");
  const [selectedPriority, setSelectedPriority] = useState(1);

  // Get recent tasks (next 5 upcoming tasks)
  const recentTasks = tasks
    .filter(task => task.dueDate >= new Date())
    .sort((a, b) => a.dueDate - b.dueDate)
    .slice(0, 5);

  const handleAddTask = () => {
    if (!newTaskName.trim()) return;
    onAddTask(newTaskName.trim(), selectedBoardId, selectedPriority);
    setNewTaskName("");
  };

  return (
    <Card
      sx={{
        borderRadius: "20px",
        border: "1px solid var(--card-border)",
        backgroundColor: "var(--home-tasks-bg)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      elevation={0}
      onClick={() => router.push("/tasks")}
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
              color: "var(--Dark-Green-1)",
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
                const taskDate = new Date(task.dueDate);
                return taskDate.toDateString() === date.toDateString();
              }).length;

              return (
                <Paper
                  key={idx}
                  sx={{
                    textAlign: "center",
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: isToday ? "var(--Green-2)" : "var(--menu-bg)",
                    color: isToday ? "white" : "var(--foreground)",
                    fontSize: 14,
                    fontWeight: isToday ? 700 : 500,
                    boxShadow: "none",
                    border: "1px solid var(--card-border)",
                    position: "relative",
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
                        backgroundColor: "var(--Green-2)",
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
            }}
          >
            {recentTasks.length > 0 ? recentTasks.map((task) => {
              // Convert priority number to string
              const priorityLabels = { 0: "Low", 1: "Medium", 2: "High", 3: "Now" };
              const priorityString = priorityLabels[task.priorityLevel as keyof typeof priorityLabels] || "Low";

              return (
                <Paper
                  key={task.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    backgroundColor: "var(--menu-bg)",
                    border: "1px solid var(--card-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
                      transform: "translateY(-2px)",
                      backgroundColor: "var(--menu-item-hover)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--Dark-Green-1)",
                      }}
                    >
                      {task.name}
                    </Typography>
                    <TaskIcon
                      sx={{ fontSize: 14, color: "var(--Green-2)" }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 500,
                          color: "var(--Dark-Green-2)",
                          fontSize: 11,
                        }}
                      >
                        {task.board.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "var(--Dark-Green-2)" }}
                      >
                        Due {task.dueDate.toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color:
                            priorityString === "High"
                              ? "#d32f2f"
                              : priorityString === "Medium"
                                ? "#f57c00"
                                : "#2e7d32",
                          px: 2,
                          py: 0.5,
                          borderRadius: 10,
                          backgroundColor:
                            priorityString === "High"
                              ? "rgba(211, 47, 47, 0.1)"
                              : priorityString === "Medium"
                                ? "rgba(245, 124, 0, 0.1)"
                                : "rgba(46, 125, 50, 0.1)",
                          fontSize: 11,
                        }}
                      >
                        {priorityString}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              );
            }) : (
              <Typography
                variant="body2"
                sx={{
                  color: "var(--Dark-Green-2)",
                  textAlign: "center",
                  py: 4,
                  fontStyle: "italic"
                }}
              >
                No upcoming tasks
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
                value={selectedBoardId}
                label="Board"
                onChange={(e: any) => setSelectedBoardId(e.target.value)}
                sx={{
                  borderRadius: 2,
                  fontSize: "12px",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--input-text)",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--input-border)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--Green-2)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--Green-2)",
                  },
                  "& .MuiSelect-icon": {
                    color: "var(--input-text)",
                  },
                }}
              >
                {boards.map((board) => (
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
                onChange={(e: any) => setSelectedPriority(Number(e.target.value))}
                sx={{
                  borderRadius: 2,
                  fontSize: "12px",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--input-text)",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--input-border)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--Green-2)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--Green-2)",
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
                    borderColor: "var(--Green-2)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--Green-2)",
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
              disabled={!newTaskName.trim()}
              sx={{
                textTransform: "none",
                borderRadius: 999,
                backgroundColor: "var(--Green-2)",
                px: 2.5,
                py: 1.5,
                fontSize: 13,
                fontWeight: 600,
                color: "black",
                "&:hover": {
                  backgroundColor: "var(--Green-3)"
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
