import { NativeModules } from 'react-native';
import { AlarmNativeModule, AlarmScheduleConfig } from '../types/Alarm';

const { AlarmModule } = NativeModules;

export class AlarmService {
  private readonly nativeModule: AlarmNativeModule;

  constructor() {
    this.nativeModule = AlarmModule as AlarmNativeModule;
  }

  // ALARM SCHEDULING METHODS
  async scheduleAlarm(config: AlarmScheduleConfig): Promise<string> {
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

    this.validateScheduleConfig(config);

    // Build recurrence pattern based on recurrence type
    const recurrencePattern = this.buildRecurrencePattern(
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

  private buildRecurrencePattern(
    recurrenceType: string,
    daysOfWeek: number[] = [],
    dayOfMonth: number = 0,
    interval: number = 1,
  ): string {
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
  }

  private async generateRequestCode(): Promise<string> {
    // Use the native method to generate a request code
    return this.nativeModule.generateRequestCode();
  }

  private validateScheduleConfig(config: AlarmScheduleConfig): void {
    const {
      timestamp,
      recurrenceType,
      daysOfWeek = [],
      dayOfMonth = 0,
    } = config;

    if (timestamp <= Date.now() && recurrenceType === 'ONCE') {
      throw new Error('Alarm timestamp must be in the future');
    }

    if (recurrenceType !== 'ONCE' && timestamp <= Date.now()) {
      console.warn(
        'Recurring alarm timestamp is in the past. It will trigger at the next scheduled occurrence.',
      );
    }

    if (recurrenceType === 'WEEKLY' && daysOfWeek.length === 0) {
      throw new Error(
        'Weekly recurrence requires at least one day of the week',
      );
    }

    if (recurrenceType === 'MONTHLY' && (dayOfMonth < 1 || dayOfMonth > 31)) {
      throw new Error(
        'Monthly recurrence requires a valid day of month (1-31)',
      );
    }
  }

  // UPDATE ALARM METHOD
  async updateAlarm(
    config: AlarmScheduleConfig & { requestCodeStr: string },
  ): Promise<string> {
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

    this.validateScheduleConfig(config);

    const recurrencePattern = this.buildRecurrencePattern(
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
