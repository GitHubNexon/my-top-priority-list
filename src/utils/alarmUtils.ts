import { addDays, addWeeks, addMonths } from 'date-fns';

// Daily alarm (on selected weekdays: 0=Sun, 1=Mon...)
export function getNextDailyAlarm(start: Date, weekdays: number[]): Date {
  let next = new Date(start);
  while (!weekdays.includes(next.getDay())) {
    next = addDays(next, 1);
  }
  return next;
}

// Every N weeks
export function getNextNWeeklyAlarm(start: Date, interval: number): Date {
  return addWeeks(start, interval);
}

// Monthly on specific day (1st, 2nd, 3rd...)
export function getNextMonthlyAlarm(start: Date, day: number): Date {
  const next = addMonths(start, 1);
  next.setDate(day);
  return next;
}

// Specific one-time date
export function scheduleOneTime(date: Date): Date {
  return date;
}

// Every N days
export function getNextEveryNDays(start: Date, interval: number): Date {
  return addDays(start, interval);
}