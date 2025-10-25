import { AlarmScheduleConfig } from '../types/Alarm';

export const validateScheduleConfig = (config: AlarmScheduleConfig): void => {
  const { timestamp, recurrenceType, daysOfWeek = [], dayOfMonth = 0 } = config;

  if (timestamp <= Date.now() && recurrenceType === 'ONCE') {
    throw new Error('Alarm timestamp must be in the future');
  }

  if (recurrenceType !== 'ONCE' && timestamp <= Date.now()) {
    console.warn(
      'Recurring alarm timestamp is in the past. It will trigger at the next scheduled occurrence.',
    );
  }

  if (recurrenceType === 'WEEKLY' && daysOfWeek.length === 0) {
    throw new Error('Weekly recurrence requires at least one day of the week');
  }

  if (recurrenceType === 'MONTHLY' && (dayOfMonth < 1 || dayOfMonth > 31)) {
    throw new Error('Monthly recurrence requires a valid day of month (1-31)');
  }
};

export const buildRecurrencePattern = (
  recurrenceType: string,
  daysOfWeek: number[] = [],
  dayOfMonth: number = 0,
  interval: number = 1,
): string => {
  const pattern: any = {};

  switch (recurrenceType) {
    case 'WEEKLY':
      if (daysOfWeek && daysOfWeek.length > 0) {
        pattern.daysOfWeek = daysOfWeek;
      }
      break;
    case 'MONTHLY':
      if (dayOfMonth && dayOfMonth >= 1 && dayOfMonth <= 31) {
        pattern.dayOfMonth = dayOfMonth;
      }
      break;
    case 'DAILY':
    case 'CUSTOM':
      pattern.interval = interval || 1;
      break;
    case 'YEARLY':
      // Yearly might not need additional pattern data
      break;
    case 'ONCE':
    default:
      // Empty pattern for one-time alarms
      break;
  }

  return JSON.stringify(pattern);
};

/**
 * Combines optional date + required time ISO strings into a single timestamp.
 * 
 * @param timeISO  - A UTC ISO string from time picker (e.g. "2025-10-19T06:41:00.000Z")
 * @param dateISO? - Optional UTC ISO string from date picker (e.g. "2026-11-10T06:40:00.000Z")
 * 
 * @returns A timestamp (number) in milliseconds representing the next alarm time in local timezone.
 */
export function getOneTimeAlarmFromUtcString(
  timeISO: string,
  dateISO?: string,
): number {
  const time = new Date(timeISO);
  const now = new Date();

  let finalDate: Date;

  if (dateISO) {
    // 🗓 Combine date (Y/M/D) with time (H/M/S)
    const date = new Date(dateISO);
    finalDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes(),
      time.getSeconds(),
      0,
    );
  } else {
    // Time-only: use today's date, move to tomorrow if time has passed
    finalDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      time.getHours(),
      time.getMinutes(),
      time.getSeconds(),
      0,
    );

    // If that time already passed today → schedule for tomorrow
    if (finalDate.getTime() <= now.getTime()) {
      finalDate.setDate(finalDate.getDate() + 1);
    }
  }

  // Prevent scheduling alarms in the past (in case of wrong date)
  if (finalDate.getTime() <= now.getTime()) {
    throw new Error('Cannot schedule alarm in the past.');
  }

  return finalDate.getTime(); // epoch milliseconds
}

/**
 * Converts a UTC ISO string like "2025-10-19T04:35:00.000Z"
 * to the next local timestamp for a DAILY alarm at that local wall time.
 */
export const getNextDailyAlarmFromUtcString = (utcString: string): number => {
  const utcDate = new Date(utcString);

  // Extract the *intended local wall-clock time* (04:35)
  const hour = utcDate.getUTCHours();
  const minute = utcDate.getUTCMinutes();

  // Build a local date for today with that time
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);

  // If that local time has already passed today, move to tomorrow
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime(); // epoch milliseconds (local time)
}

/**
 * Converts a UTC ISO string like "2025-10-19T04:35:00.000Z"
 * to the next local timestamp for a WEEKLY alarm at that local weekday/time.
 */
export const getNextWeeklyAlarmFromUtcString = (utcString: string): number => {
  const utcDate = new Date(utcString);

  const targetDay = utcDate.getUTCDay(); // 0 = Sunday, 1 = Monday, ...
  const hour = utcDate.getUTCHours();
  const minute = utcDate.getUTCMinutes();

  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);

  // Adjust to next matching weekday
  let daysUntilNext = (targetDay - now.getDay() + 7) % 7;
  if (daysUntilNext === 0 && target.getTime() <= now.getTime()) {
    daysUntilNext = 7; // same day but time passed
  }
  target.setDate(now.getDate() + daysUntilNext);

  return target.getTime();
};

/**
 * Converts UTC ISO strings to the next local timestamp for a MONTHLY alarm.
 * 
 * @param timeISO - UTC ISO string for the intended time (e.g. "2025-10-19T06:41:00.000Z")
 * @param dateISO - UTC ISO string for the intended date (e.g. "2025-10-15T06:00:00.000Z")
 * 
 * @returns number (timestamp in milliseconds)
 */
export function getNextMonthlyAlarmFromUtcString(
  timeISO: string,
  dateISO: string,
): number {
  const time = new Date(timeISO);
  const now = new Date();

  let targetDay = dateISO ? new Date(dateISO).getDate() : now.getDate();

  // Build target date for this month
  let target = new Date(
    now.getFullYear(),
    now.getMonth(),
    targetDay,
    time.getHours(),
    time.getMinutes(),
    time.getSeconds(),
    0,
  );

  // If that date/time already passed this month, move to next month
  if (target.getTime() <= now.getTime()) {
    target = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      targetDay,
      time.getHours(),
      time.getMinutes(),
      time.getSeconds(),
      0,
    );
  }

  return target.getTime();
}

/**
 * Converts UTC ISO strings to the next local timestamp for a YEARLY alarm.
 * 
 * @param timeISO - UTC ISO string for the intended time (e.g. "2025-10-19T06:41:00.000Z")
 * @param dateISO - UTC ISO string for the intended date (e.g. "2025-12-25T00:00:00.000Z")
 * 
 * @returns number (timestamp in milliseconds)
 */
export function getNextYearlyAlarmFromUtcString(
  timeISO: string,
  dateISO: string,
): number {
  const time = new Date(timeISO);
  const now = new Date();

  let targetYear = now.getFullYear();
  let targetMonth = dateISO ? new Date(dateISO).getMonth() : now.getMonth();
  let targetDay = dateISO ? new Date(dateISO).getDate() : now.getDate();

  // Build target datetime for this year
  let target = new Date(
    targetYear,
    targetMonth,
    targetDay,
    time.getHours(),
    time.getMinutes(),
    time.getSeconds(),
    0,
  );

  // If it already passed this year → schedule for next year
  if (target.getTime() <= now.getTime()) {
    target = new Date(
      targetYear + 1,
      targetMonth,
      targetDay,
      time.getHours(),
      time.getMinutes(),
      time.getSeconds(),
      0,
    );
  }

  return target.getTime();
}

export enum AlarmRepeatType {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export const getAlarmTriggerTime = (
  type: AlarmRepeatType,
  utcString: string,
  dateISO?: string,
): number => {
  switch (type) {
    case AlarmRepeatType.DAILY:
      return getNextDailyAlarmFromUtcString(utcString);
    case AlarmRepeatType.WEEKLY:
      return getNextWeeklyAlarmFromUtcString(utcString);
    case AlarmRepeatType.MONTHLY:
      return getNextMonthlyAlarmFromUtcString(utcString, dateISO ?? '');
    case AlarmRepeatType.YEARLY:
      return getNextYearlyAlarmFromUtcString(utcString, dateISO ?? '');
    case AlarmRepeatType.ONCE:
      return getOneTimeAlarmFromUtcString(utcString, dateISO ?? '');
    default:
      return getOneTimeAlarmFromUtcString(utcString, dateISO ?? '');
  }
};
