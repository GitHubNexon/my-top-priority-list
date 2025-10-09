export interface AlarmNativeModule {
  initializeAlarmSystem(): Promise<string>;
  canScheduleExactAlarms(): Promise<boolean>;
  // Single method for both single and recurring alarms
  scheduleAlarm(
    timestamp: number,
    title: string,
    message: string,
    requestCodeStr: string | null,
    recurrenceType: string,
    recurrencePattern: string,
  ): Promise<string>;

  updateAlarm(
    requestCodeStr: string,
    timestamp: number,
    title: string,
    message: string,
    recurrenceType: string,
    recurrencePattern: string,
  ): Promise<string>;

  cancelAlarm(requestCodeStr: string): Promise<boolean>;
  cancelAllAlarms(): Promise<boolean>;
  getAllScheduledAlarms(): Promise<AlarmScheduleConfig[]>;
  getAlarm(requestCodeStr: string): Promise<AlarmScheduleConfig | null>;
  generateRequestCode(): Promise<string>;
  isAlarmScheduled(requestCodeStr: string): Promise<boolean>;
}

export interface AlarmScheduleConfig {
  timestamp: number;
  title?: string;
  message: string;
  requestCodeStr?: string;
  recurrenceType?:
    | 'ONCE'
    | 'DAILY'
    | 'WEEKLY'
    | 'MONTHLY'
    | 'YEARLY'
    | 'CUSTOM';
  daysOfWeek?: number[]; // 0-6 (Sunday=0) - required for WEEKLY
  dayOfMonth?: number; // 1-31 - required for MONTHLY
  interval?: number; // for DAILY and CUSTOM recurrences
}