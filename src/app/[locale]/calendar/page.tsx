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
import { fetchTags } from "../../services/tags/tagService";
import { fetchBoards } from "../../services/boards/boardService";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/src/common/LoadingSpinner";
import { useBoardsTags } from "../../providers/boardsTags/BoardsTagsContext";
import {fetchTasks} from "../../services/tasks/taskService"

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
  const { boards, tags, loading: boardsTagsLoading } = useBoardsTags();
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const {data: session} = useSession()
  const email = session?.user?.email as string;

  /** Load events and tasks once boards/tags are ready (from preload) */
  useEffect(() => {
    if (boardsTagsLoading) return;
    let cancelled = false;
    async function loadData() {
      try {
        const [boardData] = await Promise.all([
          fetchBoards(email),
        ]);

        setBoards(boardData);

        const [tagData] = await Promise.all([
          fetchTags(email),
        ]);

        setTags(tagData);

        setDataLoading(true);
        const [eventData, taskData] = await Promise.all([
          fetchEvents(boardData),
          fetchTasks(email, boardData, tagData),
        ]);
        if (!cancelled) {
          setEvents(eventData);
          setTasks(taskData);
        }
      } catch (err) {
        console.error("Failed to load calendar data:", err);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [boardsTagsLoading, boards, tags, email]);

  const taskEvents = convertTasksToEvents(tasks, boards);
  const calendarEventData = convertEventsForCalendar(events);
  const allCalendarEvents = [...taskEvents, ...calendarEventData];

  /** Layout always visible: sidebar + main. Only the main content area shows loading. */
  return (
    <div className="flex flex-row w-full h-full">
      <FiltersProvider>
        {/* Filter sidebar – always visible (uses preloaded boards/tags) */}
        <CalendarFilterComponent />
        <div className="flex-1 h-full overflow-hidden">
          {dataLoading ? (
            <LoadingSpinner label="Loading calendar..." className="flex-1" />
          ) : (
            <div className="flex flex-col flex-1 h-full overflow-hidden content-fade-in">
              <CalendarView taskEvents={allCalendarEvents} />
            </div>
          )}
        </div>
      </FiltersProvider>
    </div>
  );
}
