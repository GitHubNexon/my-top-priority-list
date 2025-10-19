export enum RecurrenceType {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM',
}

export enum InitializationResult {
  INITIALIZED = 'INITIALIZED',
  PERMISSION_NEEDED = 'PERMISSION_NEEDED',
  ERROR = 'ERROR',
}

export enum NotificationPermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  SHOULD_REQUEST = 'should_request',
}

export interface AlarmNativeModule {
  initializeAlarmSystem(): Promise<InitializationResult>;
  ensureFullScreenIntentPermission(): Promise<boolean>;
  canScheduleExactAlarms(): Promise<boolean>;
  openAppSettings(): Promise<boolean>;
  getSystemInfo(): Promise<SystemInfo>;
  getInitializationStatus(): Promise<InitializationStatus>;

  scheduleAlarm(
    timestamp: number,
    title: string,
    message: string,
    requestCodeStr: string | null,
    recurrenceType: RecurrenceType,
    recurrencePattern: string,
  ): Promise<string>;

  updateAlarm(
    requestCodeStr: string,
    timestamp: number,
    title: string,
    message: string,
    recurrenceType: RecurrenceType,
    recurrencePattern: string,
  ): Promise<string>;

  cancelAlarm(requestCodeStr: string): Promise<boolean>;
  cancelAllAlarms(): Promise<boolean>;
  getAllScheduledAlarms(): Promise<AlarmScheduleConfig[]>;
  getAlarm(requestCodeStr: string): Promise<AlarmScheduleConfig | null>;
  generateRequestCode(): Promise<string>;
  isAlarmScheduled(requestCodeStr: string): Promise<boolean>;
  requestNotificationPermission(): Promise<NotificationPermissionStatus>;
  checkNotificationPermission(): Promise<NotificationPermissionStatus>;
  clearAllAlarms(): Promise<boolean>;
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

export interface AlarmError {
  code: string;
  message: string;
  details?: unknown;
}

export interface AlarmState {
  isLoading: boolean;
  isInitializing: boolean;
  error: AlarmError | null;
  hasExactAlarmPermission: boolean | null;
  systemInfo: SystemInfo | null;
  initializationStatus: InitializationStatus | null;
  scheduledAlarms: AlarmScheduleConfig[];
}