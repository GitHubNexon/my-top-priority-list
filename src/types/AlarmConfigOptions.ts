export interface RingtoneInfo {
  title: string;
  uri: string;
}

export interface AlarmConfigOptions {
  snoozeMinutes: number;
  selectedRingtone: RingtoneInfo | null; // currently selected ringtone
}
