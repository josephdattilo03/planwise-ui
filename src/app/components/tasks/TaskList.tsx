import React, { useMemo } from "react";
import { Task } from "../../types";
import TaskCard from "./TaskCard";
import { useFilters } from "../../providers/filters/useFilters";

interface TaskListProps {
  taskList: Task[];
  onSelectTask?: (task: Task) => void;
}

export default function TaskList({ taskList, onSelectTask }: TaskListProps) {
  const {
    selectedBoardIds,
    selectedTagIds,
    selectedPriorities,
    selectedDueDateRange,
    selectedDate,
  } = useFilters()

  const filteredTasks = useMemo(() => {
    return taskList.filter((task) => {
      // Filter by board
      if (selectedBoardIds.size > 0 && !selectedBoardIds.has(task.board.id)) {
        return false;
      }

      // Filter by priority
      if (selectedPriorities.size > 0 && !selectedPriorities.has(task.priorityLevel)) {
        return false;
      }

      // Filter by tags (task must have at least one of the selected tags)
      if (selectedTagIds.size > 0) {
        const hasSelectedTag = task.tags.some((tag) => selectedTagIds.has(tag.id));
        if (!hasSelectedTag) {
          return false;
        }
      }

      // Filter by due date range
      if (selectedDueDateRange.startDate || selectedDueDateRange.endDate) {
        const taskDueDate = new Date(task.dueDate);
        
        if (selectedDueDateRange.startDate) {
          const startDate = new Date(selectedDueDateRange.startDate);
          startDate.setHours(0, 0, 0, 0);
          if (taskDueDate < startDate) {
            return false;
          }
        }

        if (selectedDueDateRange.endDate) {
          const endDate = new Date(selectedDueDateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (taskDueDate > endDate) {
            return false;
          }
        }
      }

      if (selectedDate) {
        const taskDueDate = new Date(task.dueDate);
        const filterDate = new Date(selectedDate);
        
        taskDueDate.setHours(0, 0, 0, 0);
        filterDate.setHours(0, 0, 0, 0);
        
        if (taskDueDate.getTime() !== filterDate.getTime()) {
          return false;
        }
      }

      return true;
    });
  }, [taskList, selectedBoardIds, selectedTagIds, selectedPriorities, selectedDueDateRange, selectedDate]);

  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-dark-green-2">
        <p className="text-lg">No tasks match the current filters</p>
        <p className="text-sm mt-2">Try adjusting your filter criteria</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {filteredTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onClick={() => onSelectTask?.(task)}
        />
      ))}
    </div>
  );
}