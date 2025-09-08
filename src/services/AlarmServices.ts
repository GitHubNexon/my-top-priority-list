import { NativeModules } from 'react-native';

const { AlarmModule } = NativeModules;

interface AlarmConfig {
  timestamp: number;
  title?: string;
  message: string;
  requestCodeStr?: string;
  recurrenceType?: RecurrenceType;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  interval?: number;
}

interface AlarmConfigOptions {
  sound?: string;
  vibrate?: boolean;
  snoozeMinutes?: number;
  smallIcon?: string;
  bigIcon?: string;
}

type RecurrenceType =
  | 'ONCE'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'YEARLY'
  | 'CUSTOM';

interface AlarmModuleInterface {
  // Configuration methods
  alarmConfig: (
    sound: string | null,
    vibrate: boolean | null,
    snoozeMinutes: number | null,
    smallIcon: string | null,
    bigIcon: string | null,
  ) => Promise<boolean>;

  getAlarmConfig: () => Promise<{
    sound_uri: string;
    vibrate: boolean;
    snooze_minutes: number;
    small_icon: string;
    big_icon: string;
  }>;

  getRingtone: (uri: string) => Promise<{
    title: string;
    uri: string;
  }>;

  getAllRingtones: () => Promise<
    Array<{
      title: string;
      uri: string;
    }>
  >;

  // Alarm scheduling methods
  scheduleAlarm: (
    timestamp: number,
    title: string,
    message: string,
    requestCodeStr: string,
    recurrenceType: string,
    recurrencePattern: string,
  ) => Promise<string>;

  scheduleRecurringAlarm: (
    timestamp: number,
    title: string,
    message: string,
    requestCodeStr: string,
    recurrenceType: string,
    daysOfWeek: number[],
    dayOfMonth: number,
    interval: number,
  ) => Promise<string>;

  cancelAlarm: (requestCodeStr: string) => Promise<boolean>;
  cancelAllAlarms: () => Promise<boolean>;
}

export class AlarmService {
  private static alarmModule: AlarmModuleInterface = AlarmModule;

  // Configuration methods
  static async configureAlarm(options: AlarmConfigOptions): Promise<boolean> {
    return await AlarmModule.alarmConfig(
      options.sound || null,
      options.vibrate || null,
      options.snoozeMinutes || null,
      options.smallIcon || null,
      options.bigIcon || null,
    );
  }

  static async getConfiguration() {
    return await AlarmModule.getAlarmConfig();
  }

  static async getRingtone(uri: string) {
    return await AlarmModule.getRingtone(uri);
  }

  static async getAllRingtones() {
    return await AlarmModule.getAllRingtones();
  }

  // Alarm scheduling
  static async scheduleAlarm(alarmConfig: AlarmConfig): Promise<string> {
    const {
      timestamp,
      title = 'Alarm',
      message,
      requestCodeStr = `alarm_${Date.now()}`,
      recurrenceType = 'ONCE',
      daysOfWeek = [],
      dayOfMonth = 0,
      interval = 1,
    } = alarmConfig;

    if (recurrenceType === 'ONCE') {
      return await AlarmModule.scheduleAlarm(
        timestamp,
        title,
        message,
        requestCodeStr,
        recurrenceType,
        '',
      );
    } else {
      return await AlarmModule.scheduleRecurringAlarm(
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

  static async cancelAlarm(requestCodeStr: string): Promise<boolean> {
    return await AlarmModule.cancelAlarm(requestCodeStr);
  }

  static async cancelAllAlarms(): Promise<boolean> {
    return await AlarmModule.cancelAllAlarms();
  }

  // Helper methods for common patterns
  static async scheduleDailyAlarm(
    time: string,
    title: string,
    message: string,
    requestCodeStr: string = `daily_${time}_${Date.now()}`,
  ): Promise<string> {
    const timestamp = this.getTimestampFromTime(time);
    return this.scheduleAlarm({
      timestamp,
      title,
      message,
      requestCodeStr,
      recurrenceType: 'DAILY',
      interval: 1,
    });
  }

  static async scheduleWeeklyAlarm(
    time: string,
    title: string,
    message: string,
    daysOfWeek: number[],
    requestCodeStr: string = `weekly_${time}_${Date.now()}`,
  ): Promise<string> {
    const timestamp = this.getTimestampFromTime(time);
    return this.scheduleAlarm({
      timestamp,
      title,
      message,
      requestCodeStr,
      recurrenceType: 'WEEKLY',
      daysOfWeek,
      interval: 1,
    });
  }

  static async scheduleMonthlyAlarm(
    time: string,
    title: string,
    message: string,
    dayOfMonth: number,
    requestCodeStr: string = `monthly_${time}_${Date.now()}`,
  ): Promise<string> {
    const timestamp = this.getTimestampFromTime(time);
    return this.scheduleAlarm({
      timestamp,
      title,
      message,
      requestCodeStr,
      recurrenceType: 'MONTHLY',
      dayOfMonth,
      interval: 1,
    });
  }

  static async scheduleYearlyAlarm(
    time: string,
    title: string,
    message: string,
    requestCodeStr: string = `yearly_${time}_${Date.now()}`,
  ): Promise<string> {
    const timestamp = this.getTimestampFromTime(time);
    return this.scheduleAlarm({
      timestamp,
      title,
      message,
      requestCodeStr,
      recurrenceType: 'YEARLY',
      interval: 1,
    });
  }

  static async scheduleCustomIntervalAlarm(
    time: string,
    title: string,
    message: string,
    intervalDays: number,
    requestCodeStr: string = `custom_${intervalDays}_${Date.now()}`,
  ): Promise<string> {
    const timestamp = this.getTimestampFromTime(time);
    return this.scheduleAlarm({
      timestamp,
      title,
      message,
      requestCodeStr,
      recurrenceType: 'CUSTOM',
      interval: intervalDays,
    });
  }

  static getTimestampFromTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
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

  static async scheduleSpecificDateAlarm(
    date: Date,
    title: string,
    message: string,
    requestCodeStr: string = `date_${date.getTime()}`,
  ): Promise<string> {
    return this.scheduleAlarm({
      timestamp: date.getTime(),
      title,
      message,
      requestCodeStr,
      recurrenceType: 'ONCE',
    });
  }

  static get DayOfWeek() {
    return {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    } as const;
  }

  // Helper to generate unique request codes
  static generateRequestCode(prefix: string = 'alarm'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
