
export interface AlarmNativeModule {
  scheduleAlarm(
    timestamp: number,
    title: string,
    message: string,
    requestCodeStr: string,
    recurrenceType: string,
    recurrencePattern: string,
  ): Promise<string>;

  scheduleRecurringAlarm(
    timestamp: number,
    title: string,
    message: string,
    requestCodeStr: string,
    recurrenceType: string,
    daysOfWeek: number[],
    dayOfMonth: number,
    interval: number,
  ): Promise<string>;

  cancelAlarm(requestCodeStr: string): Promise<boolean>;
  cancelAllAlarms(): Promise<boolean>;
}

export interface AlarmScheduleConfig {
  timestamp: number;
  title?: string;
  message: string;
  requestCodeStr?: string;
  recurrenceType?: RecurrenceType;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  interval?: number;
}

export type RecurrenceType =
  | 'ONCE'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'YEARLY'
  | 'CUSTOM';