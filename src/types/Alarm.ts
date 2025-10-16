export interface AlarmNativeModule {
  initializeAlarmSystem(): Promise<string>;
  ensureFullScreenIntentPermission(): Promise<boolean>;
  canScheduleExactAlarms(): Promise<boolean>;
  openAppSettings(): Promise<boolean>;
  getSystemInfo(): Promise<SystemInfo>;
  getInitializationStatus(): Promise<InitializationStatus>;

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
  requestNotificationPermission(): Promise<string>;
  checkNotificationPermission(): Promise<string>;
  clearAllAlarms(): Promise<string>;
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

export interface SystemInfo {
  sdkVersion: number;
  manufacturer: string;
  model: string;
  canScheduleExactAlarms: boolean;
}

export interface InitializationStatus {
  isInitialized: boolean;
  canScheduleExactAlarms: boolean;
  requiresExactAlarmPermission: boolean;
  errorMessage?: string;
}