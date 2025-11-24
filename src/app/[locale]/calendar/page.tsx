"use client";

import dynamic from "next/dynamic";

const CalendarView = dynamic(
  () => import("@/src/components/Calendar/CalendarView"),
  { ssr: false }
);

export default function CalendarPage() {
  return (
    <main className="min-h-screen bg-off-white px-10 py-10">
      <div className="mx-auto max-w-7xl">
        <CalendarView />
      </div>
    </main>
  );
}
