import { NativeModules } from 'react-native';
import {
  AlarmNativeModule,
  AlarmScheduleConfig,
  SystemInfo,
  InitializationStatus,
  RecurrenceType,
  NotificationPermissionStatus,
  InitializationResult,
} from '../types/Alarm';
import { buildRecurrencePattern, validateScheduleConfig } from '../utils/alarm';

const { AlarmModule } = NativeModules;

export class AlarmService {
  private readonly nativeModule: AlarmNativeModule;
  private isInitialized: boolean = false;

  constructor() {
    this.nativeModule = AlarmModule as AlarmNativeModule;
  }

  async initialize(): Promise<InitializationResult> {
    try {
      const result = await this.nativeModule.initializeAlarmSystem();
      this.isInitialized = result === InitializationResult.INITIALIZED;
      return result;
    } catch (error) {
      console.error('Failed to initialize alarm system:', error);
      throw error;
    }
  }

  async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  async checkExactAlarmPermission(): Promise<boolean> {
    try {
      return await this.nativeModule.canScheduleExactAlarms();
    } catch (error) {
      console.error('Failed to check exact alarm permission:', error);
      return false;
    }
  }

  async ensureFullScreenIntentPermission(): Promise<boolean> {
    try {
      return await this.nativeModule.ensureFullScreenIntentPermission();
    } catch (error) {
      console.error('Failed to ensure full screen intent permission:', error);
      return false;
    }
  }

  async openAppSettings(): Promise<boolean> {
    try {
      return await this.nativeModule.openAppSettings();
    } catch (error) {
      console.error('Failed to open app settings:', error);
      return false;
    }
  }

  async getSystemInfo(): Promise<SystemInfo> {
    try {
      return await this.nativeModule.getSystemInfo();
    } catch (error) {
      console.error('Failed to get system info:', error);
      throw error;
    }
  }

  async getInitializationStatus(): Promise<InitializationStatus> {
    try {
      return await this.nativeModule.getInitializationStatus();
    } catch (error) {
      console.error('Failed to get initialization status:', error);
      throw error;
    }
  }

  async scheduleAlarm(config: AlarmScheduleConfig): Promise<string> {
    await this.ensureInitialized();

    const {
      timestamp,
      title = 'Alarm',
      message,
      requestCodeStr = await this.generateRequestCode(),
      recurrenceType = RecurrenceType.ONCE,
      daysOfWeek = [],
      dayOfMonth = 0,
      interval = 1,
    } = config;

    validateScheduleConfig(config);

    const hasPermission = await this.checkExactAlarmPermission();
    if (!hasPermission) {
      throw new Error(
        'SCHEDULE_EXACT_ALARM permission required for Android 12+',
      );
    }

    const recurrencePattern = buildRecurrencePattern(
      recurrenceType,
      daysOfWeek,
      dayOfMonth,
      interval,
    );

    return this.nativeModule.scheduleAlarm(
      timestamp,
      title,
      message,
      requestCodeStr,
      recurrenceType,
      recurrencePattern,
    );
  }

  private async generateRequestCode(): Promise<string> {
    return this.nativeModule.generateRequestCode();
  }

  async updateAlarm(
    config: AlarmScheduleConfig & { requestCodeStr: string },
  ): Promise<string> {
    await this.ensureInitialized();

    const {
      requestCodeStr,
      timestamp,
      title = 'Alarm',
      message,
      recurrenceType = RecurrenceType.ONCE,
      daysOfWeek = [],
      dayOfMonth = 0,
      interval = 1,
    } = config;

    validateScheduleConfig(config);

    const recurrencePattern = buildRecurrencePattern(
      recurrenceType,
      daysOfWeek,
      dayOfMonth,
      interval,
    );

    return this.nativeModule.updateAlarm(
      requestCodeStr,
      timestamp,
      title,
      message,
      recurrenceType,
      recurrencePattern,
    );
  }

  async cancelAlarm(requestCodeStr: string): Promise<boolean> {
    return this.nativeModule.cancelAlarm(requestCodeStr);
  }

  async cancelAllAlarms(): Promise<boolean> {
    return this.nativeModule.cancelAllAlarms();
  }

  async getAllScheduledAlarms(): Promise<AlarmScheduleConfig[]> {
    return this.nativeModule.getAllScheduledAlarms();
  }

  async getAlarm(requestCodeStr: string): Promise<AlarmScheduleConfig | null> {
    return this.nativeModule.getAlarm(requestCodeStr);
  }

  async isAlarmScheduled(requestCodeStr: string): Promise<boolean> {
    return this.nativeModule.isAlarmScheduled(requestCodeStr);
  }

  async requestNotificationPermission(): Promise<NotificationPermissionStatus> {
    try {
      return await this.nativeModule.requestNotificationPermission();
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      throw error;
    }
  }

  async checkNotificationPermission(): Promise<NotificationPermissionStatus> {
    try {
      return await this.nativeModule.checkNotificationPermission();
    } catch (error) {
      console.error('Failed to check notification permission:', error);
      throw error;
    }
  }

  async clearAllAlarms(): Promise<boolean> {
    return await this.nativeModule.clearAllAlarms();
  }
}