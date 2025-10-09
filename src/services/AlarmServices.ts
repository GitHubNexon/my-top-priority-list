import { NativeModules } from 'react-native';
import { AlarmNativeModule, AlarmScheduleConfig } from '../types/Alarm';
import { buildRecurrencePattern, validateScheduleConfig } from '../utils/alarm';

const { AlarmModule } = NativeModules;

export class AlarmService {
  private readonly nativeModule: AlarmNativeModule;
  private isInitialized: boolean = false;

  constructor() {
    this.nativeModule = AlarmModule as AlarmNativeModule;
  }

  // INITIALIZATION METHODS
  async initializeAlarm(): Promise<string> {
    try {
      const result = await this.nativeModule.initializeAlarmSystem();

      if (result === 'INITIALIZED') {
        this.isInitialized = true;
      }

      return result;
    } catch (error) {
      console.error('Failed to initialize alarm system:', error);
      throw error;
    }
  }

  async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeAlarm();
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

    // Build recurrence pattern based on recurrence type
    const recurrencePattern = buildRecurrencePattern(
      recurrenceType,
      daysOfWeek,
      dayOfMonth,
      interval,
    );

    // Use the single scheduleAlarm method for both single and recurring alarms
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
    // Use the native method to generate a request code
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
}