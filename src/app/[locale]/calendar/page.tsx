"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import CalendarFilterComponent from "../../components/calendar/CalendarFilterComponent";
import { FiltersProvider } from "../../providers/filters/FiltersContext";
import { Event } from "../../types/event";
import { Task } from "../../types/task";
import { Board } from "../../types/board";
import { Tag } from "../../types/tag";
import { fetchEvents } from "../../services/events/eventService";
import { fetchBoards } from "../../services/boards/boardService";
import { fetchTags } from "../../services/tags/tagService";
import { fetchTasks } from "../../services/tasks/taskService";

const CalendarView = dynamic(
  () => import("../../components/calendar/CalendarView"),
  { ssr: false }
);

// Convert events to calendar format
const convertEventsForCalendar = (events: Event[]) => {
  return events.map((event) => ({
    title: `📅 ${event.description}`,
    start: event.startTime,
    end: event.endTime,
    resource: {
      board: event.board.name.toLowerCase(),
      color: event.board.color,
      type: 'event' as const,
      event,
    },
  }));
};

// Convert tasks to calendar events
const convertTasksToEvents = (tasks: Task[], boards: Board[]) => {
  return tasks.map((task) => {
    const boardObj = boards.find(b => b.id === task.board.id);
    const boardName = boardObj ? boardObj.name.toLowerCase() : task.board.name.toLowerCase();
    return {
      title: `📋 ${task.name}`,
      start: task.dueDate,
      end: task.dueDate,
      resource: {
        board: boardName,
        color: getBoardHexColor(boardName, boards),
        type: 'task' as const,
        task,
      },
    };
  });
};

const getBoardHexColor = (boardName: string, boards: Board[]): string => {
  const boardObj = boards.find(b => b.name.toLowerCase() === boardName);
  return boardObj?.color || "#4CAF50"; // default green
};

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [boardData] = await Promise.all([
          fetchBoards(),
        ]);

        setBoards(boardData);

        const [tagData] = await Promise.all([
          fetchTags(),
        ]);

        setTags(tagData);

        const [eventData, taskData] = await Promise.all([
          fetchEvents(boardData),
          fetchTasks(boardData, tagData),
        ]);

        setEvents(eventData);
        setTasks(taskData);
      } catch (err) {
        console.error("Failed to load calendar data:", err);
      }
    }

    loadData();
  }, []);

  const taskEvents = convertTasksToEvents(tasks, boards);
  const calendarEventData = convertEventsForCalendar(events);
  const allCalendarEvents = [...taskEvents, ...calendarEventData];

  return (
    <div className="flex flex-row w-full h-full">
      <FiltersProvider>
        <CalendarFilterComponent />
        <div className="flex-1 p-4">
          <div className="w-full h-full">
            <CalendarView taskEvents={allCalendarEvents} />
          </div>
        </div>
      </FiltersProvider>
    </div>
  );
}
