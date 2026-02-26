"use client";

import React from "react";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { useFilters } from "../../../providers/filters/useFilters";

export default function CalendarFilterSection() {
  const { selectedDate, setSelectedDate } = useFilters();

  return (
    <div className="w-full bg-card-bg border border-card-border rounded-lg">
      <DateCalendar
        showDaysOutsideCurrentMonth
        fixedWeekNumber={6}
        value={selectedDate}
        onChange={(newDate) => setSelectedDate(newDate)}
        views={["day"]}
        sx={{
          backgroundColor: "transparent",
          "& .MuiPickersCalendarHeader-root": {
            margin: "4px 0",
            paddingRight: 0.5,
            paddingLeft: 2.5,
            backgroundColor: "transparent",
            "& .MuiIconButton-root": {
              color: "var(--dark-green-1)",
            },
          },
          "& .MuiPickersDay-dayOutsideMonth": {
            color: "var(--green-3)",
          },
          "& .MuiPickersCalendarHeader-labelContainer": {
            textTransform: "uppercase",
            fontSize: "14px",
            color: "var(--dark-green-1)",
            backgroundColor: "transparent",
          },
          "& .MuiPickersSlideTransition-root": {
            minHeight: "200px",
            backgroundColor: "transparent",
          },
          "& .MuiDayCalendar-root": {
            backgroundColor: "transparent",
          },
          "& .MuiDayCalendar-weekContainer": {
            backgroundColor: "transparent",
          },
          "& .MuiDayCalendar-weekDayLabel": {
            fontSize: "12px",
            height: "30px",
            width: "30px",
            color: "var(--dark-green-2)",
            backgroundColor: "transparent",
          },
          "& .MuiPickersDay-root": {
            borderRadius: "9999px",
            fontSize: "12px",
            height: "30px",
            width: "30px",
            color: "var(--dark-green-1)",
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor: "var(--green-4)",
            },
          },
          "& .Mui-selected": {
            backgroundColor: "var(--green-1) !important",
            color: "white",
            "&:hover": {
              backgroundColor: "var(--green-2) !important",
            },
          },
          "& .MuiPickersArrowSwitcher-root": {
            backgroundColor: "transparent",
          },
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
