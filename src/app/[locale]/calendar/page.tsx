"use client";

import dynamic from "next/dynamic";
import CalendarFilterComponent from "../../components/calendar/CalendarFilterComponent";
import { FiltersProvider } from "../../providers/filters/FiltersContext";

const CalendarView = dynamic(
  () => import("../../components/calendar/CalendarView"),
  { ssr: false }
);

export default function CalendarPage() {
  return (
    <main className="min-h-screen bg-off-white flex w-full">
      <FiltersProvider>
        <CalendarFilterComponent />
        <div className="flex-1 ml-80 p-8">
          <div className="max-w-7xl mx-auto h-full">
            <CalendarView />
          </div>
        </div>
      </FiltersProvider>
    </main>
  );
}
