"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import CalendarFilterComponent from "../../components/calendar/CalendarFilterComponent";
import { FiltersProvider } from "../../providers/filters/FiltersContext";
import { Event, Event as AppEvent } from "../../types/event";
import { Task } from "../../types/task";
import { Board } from "../../types/board";
import { fetchEvents } from "../../services/events/eventService";
import { fetchTasks } from "../../services/tasks/taskService";
import LoadingSpinner from "@/src/common/LoadingSpinner";
import { useBoardsTags } from "../../providers/boardsTags/BoardsTagsContext";
import { CalendarEvent } from "../../components/calendar/CalendarView";

const CalendarView = dynamic(
  () => import("../../components/calendar/CalendarView"),
  { ssr: false }
);

// ── Converters ─────────────────────────────────────────────────────────────

const convertEventsForCalendar = (events: Event[]): CalendarEvent[] =>
  events.map((event) => ({
    title: `📅 ${event.description}`,
    start: event.startTime,
    end: event.endTime,
    resource: {
      board: event.board.name.toLowerCase(),
      color: event.board.color,
      type: "event" as const,
      event,
    },
  }));

const getBoardHexColor = (boardName: string, boards: Board[]): string => {
  const boardObj = boards.find((b) => b.name.toLowerCase() === boardName);
  return boardObj?.color ?? "#4CAF50";
};

const convertTasksToEvents = (tasks: Task[], boards: Board[]): CalendarEvent[] =>
  tasks.map((task) => {
    const boardName =
      boards.find((b) => b.id === task.board.id)?.name.toLowerCase() ??
      task.board.name.toLowerCase();
    return {
      title: `📋 ${task.name}`,
      start: task.dueDate,
      end: task.dueDate,
      resource: {
        board: boardName,
        color: getBoardHexColor(boardName, boards),
        type: "task" as const,
        task,
      },
    };
  });

// ── Page ───────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { boards, tags, loading: boardsTagsLoading } = useBoardsTags();
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  /** Re-fetch the full events list (used after create / delete) */
  const refreshEvents = useCallback(async () => {
    if (boardsTagsLoading) return;
    const eventData = await fetchEvents(boards);
    setEvents(eventData);
  }, [boards, boardsTagsLoading]);

  /**
   * In-place update after a drag/resize — replaces the single changed event in
   * state directly so the calendar updates instantly with no re-fetch round-trip.
   */
  const handleEventUpdated = useCallback((updated: AppEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }, []);

  /** Same pattern for task drops — updates dueDate in-place. */
  const handleTaskUpdated = useCallback((updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  /** Initial load: fetch events and tasks together once boards/tags are ready */
  useEffect(() => {
    if (boardsTagsLoading) return;
    let cancelled = false;
    async function loadData() {
      try {
        setDataLoading(true);
        const [eventData, taskData] = await Promise.all([
          fetchEvents(boards),
          fetchTasks(boards, tags),
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
  }, [boardsTagsLoading, boards, tags]);

  const calendarEvents = convertEventsForCalendar(events);
  const taskEvents = convertTasksToEvents(tasks, boards);

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
              <CalendarView
                calendarEvents={calendarEvents}
                taskEvents={taskEvents}
                onEventsChanged={refreshEvents}
                onEventUpdated={handleEventUpdated}
                onTaskUpdated={handleTaskUpdated}
              />
            </div>
          )}
        </div>
      </FiltersProvider>
    </div>
  );
}
