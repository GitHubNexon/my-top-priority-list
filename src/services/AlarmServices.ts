import { NativeModules } from 'react-native';
import { AlarmNativeModule, AlarmScheduleConfig, } from '../types/Alarm';

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
      requestCodeStr = this.generateRequestCode(),
      recurrenceType = 'ONCE',
      daysOfWeek = [],
      dayOfMonth = 0,
      interval = 1,
    } = config;

    this.validateScheduleConfig(config);

    if (recurrenceType === 'ONCE') {
      return this.nativeModule.scheduleAlarm(
        timestamp,
        title,
        message,
        requestCodeStr,
        recurrenceType,
        JSON.stringify({}), // Empty pattern for once
      );
    } else {
      return this.nativeModule.scheduleRecurringAlarm(
        timestamp,
        title,
        message,
        requestCodeStr,
        recurrenceType,
        daysOfWeek,
        dayOfMonth,
        interval,
      );
    }
  }

  async cancelAlarm(requestCodeStr: string): Promise<boolean> {
    if (!requestCodeStr || requestCodeStr.trim().length === 0) {
      throw new Error('Request code cannot be empty');
    }
    return this.nativeModule.cancelAlarm(requestCodeStr);
  }

  async cancelAllAlarms(): Promise<boolean> {
    return this.nativeModule.cancelAllAlarms();
  }

  // CONVENIENCE METHODS
  async scheduleDailyAlarm(
    time: string,
    message: string,
    title: string = 'Daily Alarm',
    requestCodeStr?: string,
  ): Promise<string> {
    const timestamp = this.getTimestampFromTime(time);
    return this.scheduleAlarm({
      timestamp,
      title,
      message,
      requestCodeStr: requestCodeStr || `daily_${time}_${Date.now()}`,
      recurrenceType: 'DAILY',
      interval: 1,
    });
  }

  async scheduleWeeklyAlarm(
    time: string,
    message: string,
    daysOfWeek: number[],
    title: string = 'Weekly Alarm',
    requestCodeStr?: string,
  ): Promise<string> {
    const timestamp = this.getTimestampFromTime(time);
    return this.scheduleAlarm({
      timestamp,
      title,
      message,
      requestCodeStr: requestCodeStr || `weekly_${time}_${Date.now()}`,
      recurrenceType: 'WEEKLY',
      daysOfWeek,
      interval: 1,
    });
  }

  async scheduleMonthlyAlarm(
    time: string,
    message: string,
    dayOfMonth: number,
    title: string = 'Monthly Alarm',
    requestCodeStr?: string,
  ): Promise<string> {
    const timestamp = this.getTimestampFromTime(time);
    return this.scheduleAlarm({
      timestamp,
      title,
      message,
      requestCodeStr: requestCodeStr || `monthly_${time}_${Date.now()}`,
      recurrenceType: 'MONTHLY',
      dayOfMonth,
      interval: 1,
    });
  }

  async scheduleCustomIntervalAlarm(
    time: string,
    message: string,
    intervalDays: number,
    title: string = 'Custom Alarm',
    requestCodeStr?: string,
  ): Promise<string> {
    const timestamp = this.getTimestampFromTime(time);
    return this.scheduleAlarm({
      timestamp,
      title,
      message,
      requestCodeStr: requestCodeStr || `custom_${intervalDays}_${Date.now()}`,
      recurrenceType: 'CUSTOM',
      interval: intervalDays,
    });
  }

  async scheduleSpecificDateAlarm(
    date: Date,
    message: string,
    title: string = 'Alarm',
    requestCodeStr?: string,
  ): Promise<string> {
    return this.scheduleAlarm({
      timestamp: date.getTime(),
      title,
      message,
      requestCodeStr: requestCodeStr || `date_${date.getTime()}`,
      recurrenceType: 'ONCE',
    });
  }

  // UTILITY METHODS
  private validateScheduleConfig(config: AlarmScheduleConfig): void {
    if (config.timestamp <= Date.now()) {
      throw new Error('Alarm timestamp must be in the future');
    }

    if (!config.message || config.message.trim().length === 0) {
      throw new Error('Alarm message cannot be empty');
    }

    if (
      config.recurrenceType === 'WEEKLY' &&
      (!config.daysOfWeek || config.daysOfWeek.length === 0)
    ) {
      throw new Error('Weekly alarms require at least one day of the week');
    }

    if (config.recurrenceType === 'MONTHLY' && (config.dayOfMonth || 0) < 1) {
      throw new Error('Monthly alarms require a valid day of month (1-31)');
    }

    if (config.recurrenceType === 'CUSTOM' && (config.interval || 0) < 1) {
      throw new Error('Custom interval must be at least 1 day');
    }
  }

  // Add to AlarmServices.ts class
  public getTimestampFromTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);

    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      throw new Error('Invalid time format. Use HH:MM (24-hour format)');
    }

    const now = new Date();
    const alarmTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0,
      0,
    );

    if (alarmTime.getTime() <= now.getTime()) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    return alarmTime.getTime();
  }

  // Make generateRequestCode public
  public generateRequestCode(prefix: string = 'alarm'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Day of week constants
  static readonly DayOfWeek = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  } as const;
}
