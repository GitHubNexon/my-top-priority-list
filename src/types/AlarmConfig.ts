
export interface AlarmConfigNativeModule {
  setSnoozeMinutes(minutes: number): Promise<boolean>;
  getSnoozeMinutes(): Promise<number>;
  setRingtone(uri: string | null): Promise<boolean>;
  getSelectedRingtone(): Promise<Ringtone | null>;
  getAllRingtones(): Promise<Ringtone[]>;
  setVibrate(enabled: boolean): Promise<boolean>;
  getVibrate(): Promise<boolean>;
  setSmallIcon(name: string | null): Promise<boolean>;
  getSmallIcon(): Promise<string>;
  setBigIcon(name: string | null): Promise<boolean>;
  getBigIcon(): Promise<string>;
  getConfig(): Promise<AlarmConfigData>;
  clearAllSettings?(): Promise<boolean>;
  getCurrentVibrationStatus(): Promise<{
    vibrateSetting: boolean;
    hasVibrator: boolean;
  }>;
}

export interface AlarmConfigData {
  snoozeMinutes: number;
  soundUri: string | null;
  vibrate: boolean;
  smallIcon: string;
  bigIcon: string;
}

export interface Ringtone {
  title: string;
  uri: string;
}