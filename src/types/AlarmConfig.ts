export interface AlarmConfigNativeModule {
  setSnoozeMinutes(minutes: number): Promise<boolean>;
  getSnoozeMinutes(): Promise<number>;
  setMaxAlarmDuration(duration: number): Promise<boolean>;
  getMaxAlarmDuration(): Promise<number>;
  setRingtone(uri: string | null): Promise<boolean>;
  getSelectedRingtone(): Promise<Ringtone | null>;
  getAllRingtones(): Promise<Ringtone[]>;
  setVibrate(enabled: boolean): Promise<boolean>;
  getVibrate(): Promise<boolean>;
  setSmallIcon(name: string): Promise<boolean>;
  getSmallIcon(): Promise<string>;
  setBigIcon(name: string): Promise<boolean>;
  getBigIcon(): Promise<string>;
  getConfig(): Promise<AlarmConfigData>;
  clearAllSettings(): Promise<boolean>;
  getCurrentVibrationStatus(): Promise<VibrationStatus>;
  setAlarmTimeoutAction(action: AlarmTimeoutAction): Promise<boolean>;
  getAlarmTimeoutAction(): Promise<AlarmTimeoutAction>;
}

export enum AlarmTimeoutAction {
  SNOOZE = 'SNOOZE',
  STOP = 'STOP',
}

export interface AlarmConfigData {
  snoozeMinutes: number;
  maxAlarmDuration: number;
  autoSnoozeOnTimeout: boolean;
  soundUri: string | null;
  vibrate: boolean;
  smallIcon: string;
  bigIcon: string;
  alarmTimeoutAction: AlarmTimeoutAction;
}

export interface Ringtone {
  title: string;
  uri: string;
}

export interface VibrationStatus {
  vibrateSetting: boolean;
  hasVibrator: boolean;
  willVibrate: boolean;
}

export interface AlarmSettings {
  currentSound: Ringtone | null;
  availableSounds: Ringtone[];
  vibration: boolean;
  snoozeMinutes: number;
  maxAlarmDuration: number;
  autoSnoozeOnTimeout: boolean;
  icons: { small: string; big: string };
}

export interface AlarmConfigState {
  isLoading: boolean;
  error: string | null;
  settings: AlarmSettings | null;
}