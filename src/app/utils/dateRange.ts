// utils/dateRanges.ts

interface DateRange {
    startDate: Date;
    endDate: Date;
}

// Helper function to get date without time
const getDateWithoutTime = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

// Calculate today's date range
export const getTodayRange = (): DateRange => {
    const today = getDateWithoutTime(new Date());
    return { startDate: today, endDate: today };
};

// Calculate this week's date range (Monday to Sunday)
export const getThisWeekRange = (): DateRange => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday start

    const monday = getDateWithoutTime(new Date(today));
    monday.setDate(today.getDate() + diff);

    const sunday = getDateWithoutTime(new Date(monday));
    sunday.setDate(monday.getDate() + 6);

    return { startDate: monday, endDate: sunday };
};

// Calculate this month's date range (1st to last day)
export const getThisMonthRange = (): DateRange => {
    const today = new Date();
    const firstDay = getDateWithoutTime(new Date(today.getFullYear(), today.getMonth(), 1));
    const lastDay = getDateWithoutTime(new Date(today.getFullYear(), today.getMonth() + 1, 0));

    return { startDate: firstDay, endDate: lastDay };
};

// Array of date range functions for easy iteration
export const dateRangeFunctions = [
    getTodayRange,
    getThisWeekRange,
    getThisMonthRange
];

// Optional: Export enum for better type safety
export enum DateRangeType {
    TODAY = 0,
    THIS_WEEK = 1,
    THIS_MONTH = 2
}