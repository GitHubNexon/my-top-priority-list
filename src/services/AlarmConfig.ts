import { NativeModules } from "react-native";

const { AlarmConfig } = NativeModules;

export type AlarmConfigOptions = {
  snoozeMinutes?: number;
  soundUri?: string | null;
  vibrate?: boolean;
  smallIcon?: string | null;
  bigIcon?: string | null;
};

export default {
  // --- Snooze Minutes ---
  setSnoozeMinutes: (minutes: number): Promise<boolean> =>
    AlarmConfig.setSnoozeMinutes(minutes),
  getSnoozeMinutes: (): Promise<number> => AlarmConfig.getSnoozeMinutes(),

  // --- Ringtone ---
  setRingtone: (uri: string | null): Promise<boolean> =>
    AlarmConfig.setRingtone(uri),
  getSelectedRingtone: (): Promise<{ title: string; uri: string } | null> =>
    AlarmConfig.getSelectedRingtone(),

  // --- Vibrate ---
  setVibrate: (enabled: boolean): Promise<boolean> =>
    AlarmConfig.setVibrate(enabled),
  getVibrate: (): Promise<boolean> => AlarmConfig.getVibrate(),

  // --- Small Icon ---
  setSmallIcon: (name: string | null): Promise<boolean> =>
    AlarmConfig.setSmallIcon(name),
  getSmallIcon: (): Promise<string> => AlarmConfig.getSmallIcon(),

  // --- Big Icon ---
  setBigIcon: (name: string | null): Promise<boolean> =>
    AlarmConfig.setBigIcon(name),
  getBigIcon: (): Promise<string> => AlarmConfig.getBigIcon(),

  // --- Full Config ---
  getConfig: (): Promise<Required<AlarmConfigOptions>> =>
    AlarmConfig.getConfig(),
};
