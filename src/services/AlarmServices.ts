import { NativeModules } from 'react-native';

const { AlarmModule, AlarmConfig } = NativeModules;

type RecurrenceType =
  | 'ONCE'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'YEARLY'
  | 'CUSTOM';

interface AlarmScheduleConfig {
  timestamp: number;
  title?: string;
  message: string;
  requestCodeStr?: string;
  recurrenceType?: RecurrenceType;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  interval?: number;
}

export class AlarmService {
  // ========================
  // 🔹 Config Methods
  // ========================
  static async setSnoozeMinutes(minutes: number) {
    return await AlarmConfig.setSnoozeMinutes(minutes);
  }

  static async getSnoozeMinutes(): Promise<number> {
    return await AlarmConfig.getSnoozeMinutes();
  }

  static async setSoundUri(uri: string | null) {
    return await AlarmConfig.setSoundUri(uri);
  }

  static async getSoundUri(): Promise<string | null> {
    return await AlarmConfig.getSoundUri();
  }

  static async getConfig(): Promise<{
    snoozeMinutes: number;
    soundUri: string | null;
  }> {
    return await AlarmConfig.getConfig();
  }

  // ========================
  // 🔹 Scheduling
  // ========================
  static async scheduleAlarm(cfg: AlarmScheduleConfig): Promise<string> {
    const {
      timestamp,
      title = 'Alarm',
      message,
      requestCodeStr = `alarm_${Date.now()}`,
      recurrenceType = 'ONCE',
      daysOfWeek = [],
      dayOfMonth = 0,
      interval = 1,
    } = cfg;

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

  // ========================
  // 🔹 Recurrence Helpers
  // ========================
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

  // ========================
  // 🔹 Utils
  // ========================
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

  static generateRequestCode(prefix: string = 'alarm'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
