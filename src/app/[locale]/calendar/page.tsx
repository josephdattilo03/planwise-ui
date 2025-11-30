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
    <div className="flex flex-row w-full h-full">
      <FiltersProvider>
        <CalendarFilterComponent />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto h-full">
            <CalendarView />
          </div>
        </div>
      </FiltersProvider>
    </div>
  );
}
