import { NativeModules } from 'react-native';
import {
  AlarmNativeModule,
  AlarmScheduleConfig,
  SystemInfo,
  InitializationStatus,
} from '../types/Alarm';
import { buildRecurrencePattern, validateScheduleConfig } from '../utils/alarm';

const { AlarmModule } = NativeModules;

export class AlarmService {
  private readonly nativeModule: AlarmNativeModule;
  private isInitialized: boolean = false;

  constructor() {
    this.nativeModule = AlarmModule as AlarmNativeModule;
  }

  // INITIALIZATION METHODS
  async initialize(): Promise<string> {
    try {
      const result = await this.nativeModule.initializeAlarmSystem();

      if (result === 'INITIALIZED') {
        this.isInitialized = true;

        // Also ensure full screen intent permission for Android 14+
        await this.ensureFullScreenIntentPermission();
      }

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

  // ALARM SCHEDULING METHODS
  async scheduleAlarm(config: AlarmScheduleConfig): Promise<string> {
    await this.ensureInitialized();

    const {
      timestamp,
      title = 'Alarm',
      message,
      requestCodeStr = await this.generateRequestCode(),
      recurrenceType = 'ONCE',
      daysOfWeek = [],
      dayOfMonth = 0,
      interval = 1,
    } = config;

    validateScheduleConfig(config);

    // Check exact alarm permission for Android 12+
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

  // UPDATE ALARM METHOD
  async updateAlarm(
    config: AlarmScheduleConfig & { requestCodeStr: string },
  ): Promise<string> {
    await this.ensureInitialized();

    const {
      requestCodeStr,
      timestamp,
      title = 'Alarm',
      message,
      recurrenceType = 'ONCE',
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

  // OTHER ALARM MANAGEMENT METHODS
  async cancelAlarm(requestCodeStr: string): Promise<boolean> {
    return this.nativeModule.cancelAlarm(requestCodeStr);
  }

  async cancelAllAlarms(): Promise<boolean> {
    return this.nativeModule.cancelAllAlarms();
  }

  async getAllScheduledAlarms(): Promise<any[]> {
    return this.nativeModule.getAllScheduledAlarms();
  }

  async getAlarm(requestCodeStr: string): Promise<any> {
    return this.nativeModule.getAlarm(requestCodeStr);
  }

  async isAlarmScheduled(requestCodeStr: string): Promise<boolean> {
    return this.nativeModule.isAlarmScheduled(requestCodeStr);
  }

  async requestNotificationPermission(): Promise<string> {
    try {
      return await this.nativeModule.requestNotificationPermission();
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      throw error;
    }
  }

  async checkNotificationPermission(): Promise<string> {
    try {
      return await this.nativeModule.checkNotificationPermission();
    } catch (error) {
      console.error('Failed to check notification permission:', error);
      throw error;
    }
  }

  // OTHER ALARM MANAGEMENT METHODS
  async clearAllAlarms() {
    return await this.nativeModule.clearAllAlarms();
  }
}