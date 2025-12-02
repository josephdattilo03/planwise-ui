"use client";
import { useEffect, useState } from "react";
import { TaskProvider } from "../../providers/tasks/TaskContext";
import NewTaskComponent from "../../components/tasks/NewTaskComponent";
import { Board, Tag, Task } from "../../types";
import { fetchBoards } from "../../services/boards/boardService";
import { fetchTags } from "../../services/tags/tagService";
import { fetchTasks } from "../../services/tasks/taskService";
import TaskList from "../../components/tasks/TaskList";
import TaskFilterComponent from "../../components/tasks/TaskFilterComponent";
import { FiltersProvider } from "../../providers/filters/FiltersContext";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [view, setView] = useState<"list" | "grid">("list");
  const [boards, setBoards] = useState<Board[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);


  useEffect(() => {
  console.log('Tasks updated:', tasks.length, tasks.map(t => t.id));
}, [tasks]);

  /** Load tasks from localStorage */
  useEffect(() => {
    async function load() {
      console.log('Loading tasks...');
      try {
        const [boardData, tagData] = await Promise.all([
          fetchBoards(),
          fetchTags(),
        ]);
        setBoards(boardData);
        setTags(tagData);
        const taskData = await fetchTasks(boardData, tagData);
        console.log('Fetched tasks:', taskData.length, taskData.map(t => t.id));
        setTasks(taskData);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const handleSelectTask = (task: Task) => {
    setEditingTask(task);
    setMode("edit");
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setMode("create");
  };

  const handleSaveSuccess = async () => {
    const taskData = await fetchTasks(boards, tags);
    setTasks(taskData);
    setMode("create");
  };

  /** LIST VIEW */
  if (view === "list") {
    return (
      <FiltersProvider>
        <div className="flex flex-row w-full h-full overflow-hidden">
          {/* Task Filters */}
          <TaskFilterComponent />
          
          <div className="flex flex-col overflow-y-scroll w-full px-6 py-4">
            <h1 className="text-2xl font-semibold text-dark-green-1">
              Task Testing UI
            </h1>
            
            {/* Create button */}
            <button
              onClick={handleCreateTask}
              className="px-4 py-2 rounded-md bg-green-1 text-white hover:bg-green-2"
            >
              + Create Task
            </button>
            
            {/* Task list - now has access to FiltersContext */}
            <div className="mt-4 space-y-2">
              {tasks.length === 0 && (
                <p className="text-gray-500">No tasks found in localStorage.</p>
              )}
              <TaskList
                taskList={tasks}
                onSelectTask={handleSelectTask}
              />
            </div>
          </div>
          
          {mode === "create" && (
            <TaskProvider task={null}>
              <NewTaskComponent onSaveSuccess={handleSaveSuccess} />
            </TaskProvider>
          )}
          
          {mode === "edit" && editingTask && (
            <TaskProvider task={editingTask}>
              <NewTaskComponent onSaveSuccess={handleSaveSuccess} />
            </TaskProvider>
          )}
        </div>
      </FiltersProvider>
    );
  }
  
  return null;
}