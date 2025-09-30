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