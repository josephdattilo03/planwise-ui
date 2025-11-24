"use client";

import React from "react";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { useFilters } from "../../../providers/filters/useFilters";

export default function CalendarFilterSection() {
  const { selectedDate, setSelectedDate } = useFilters();
  return (
    <div className="w-full bg-white border border-green-4 rounded-xl">
      <DateCalendar
        showDaysOutsideCurrentMonth
        fixedWeekNumber={6}
        value={selectedDate}
        onChange={(newDate) => setSelectedDate(newDate)}
        views={["day"]}
        sx={{
          "& .MuiPickersCalendarHeader-root": {
            margin: "4px 0",
            paddingRight: 0.5,
            paddingLeft: 2.5,
          },
          "& .MuiPickersDay-dayOutsideMonth": {
            color: "var(--Green-3)",
          },
          "& .MuiPickersCalendarHeader-labelContainer": {
            textTransform: "uppercase",
            fontSize: "14px",
            color: "var(--Dark-Green-1)",
          },
          "& .MuiPickersSlideTransition-root": {
            minHeight: "200px",
          },
          "& .MuiDayCalendar-weekDayLabel": {
            fontSize: "12px",
            height: "30px",
            width: "30px",
            color: "var(--Dark-Green-2)",
          },
          "& .MuiPickersDay-root": {
            borderRadius: "9999px",
            fontSize: "12px",
            height: "30px",
            width: "30px",
          },
          "& .Mui-selected": {
            backgroundColor: "var(--Green-1) !important",
            color: "white",
          },

          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
