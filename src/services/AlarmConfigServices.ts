import { NativeModules } from 'react-native';
import {
  AlarmConfigNativeModule,
  AlarmConfigData,
  Ringtone,
} from '../types/AlarmConfig';
import { isValidUri } from '../utils/alarmConfig';
import { AlarmTimeoutAction } from '../types/Alarm';

const { AlarmConfig } = NativeModules;

export class AlarmConfigServices {
  private readonly nativeModule: AlarmConfigNativeModule;

  constructor() {
    this.nativeModule = AlarmConfig as AlarmConfigNativeModule;
  }

  // Snooze Minutes
  async setSnoozeMinutes(minutes: number): Promise<boolean> {
    if (minutes <= 0 || minutes > 60) {
      throw new Error('Snooze minutes must be between 1 and 60');
    }
    return this.nativeModule.setSnoozeMinutes(minutes);
  }

  async getSnoozeMinutes(): Promise<number> {
    return this.nativeModule.getSnoozeMinutes();
  }

  async setAlarmTimeoutAction(action: AlarmTimeoutAction): Promise<boolean> {
    return this.nativeModule.setAlarmTimeoutAction(action);
  }

  async getAlarmTimeoutAction(): Promise<AlarmTimeoutAction> {
    const result = await this.nativeModule.getAlarmTimeoutAction();
    // Validate and cast to enum
    if (result === 'SNOOZE' || result === 'STOP') {
      return result as AlarmTimeoutAction;
    }
    // Return default if invalid value
    console.warn(
      `Invalid alarm timeout action received: ${result}, defaulting to SNOOZE`,
    );
    return AlarmTimeoutAction.SNOOZE;
  }

  // Ringtone
  async setRingtone(uri: string | null): Promise<boolean> {
    if (uri && !isValidUri(uri)) {
      throw new Error('Invalid sound URI format');
    }
    return this.nativeModule.setRingtone(uri);
  }

  async getSelectedRingtone(): Promise<Ringtone | null> {
    return this.nativeModule.getSelectedRingtone();
  }

  async getAllRingtones(): Promise<Ringtone[]> {
    return this.nativeModule.getAllRingtones();
  }

  // Vibrate
  async setVibrate(enabled: boolean): Promise<boolean> {
    return this.nativeModule.setVibrate(enabled);
  }

  async getVibrate(): Promise<boolean> {
    return this.nativeModule.getVibrate();
  }

  // Icons
  async setSmallIcon(name: string): Promise<boolean> {
    if (!name || name.trim().length === 0) {
      throw new Error('Icon name cannot be empty');
    }
    return this.nativeModule.setSmallIcon(name);
  }

  async getSmallIcon(): Promise<string> {
    return this.nativeModule.getSmallIcon();
  }

  async setBigIcon(name: string): Promise<boolean> {
    if (!name || name.trim().length === 0) {
      throw new Error('Icon name cannot be empty');
    }
    return this.nativeModule.setBigIcon(name);
  }

  async getBigIcon(): Promise<string> {
    return this.nativeModule.getBigIcon();
  }

  // Alarm Timeout Settings
  async setMaxAlarmDuration(seconds: number): Promise<boolean> {
    if (seconds < 0) {
      throw new Error('Max alarm duration cannot be negative');
    }
    return this.nativeModule.setMaxAlarmDuration(seconds);
  }

  async getMaxAlarmDuration(): Promise<number> {
    return this.nativeModule.getMaxAlarmDuration();
  }

  // Full Config
  async getConfig(): Promise<AlarmConfigData> {
    const config = await this.nativeModule.getConfig();
    const timeoutAction = await this.getAlarmTimeoutAction(); // Now returns proper type

    return {
      ...config,
      alarmTimeoutAction: timeoutAction,
    };
  }

  // Enhanced Methods
  async resetToDefaultSound(): Promise<boolean> {
    return this.setRingtone(null);
  }

  async testSoundPreview(soundUri?: string): Promise<void> {
    // This would require additional native implementation
    const soundToTest =
      soundUri || (await this.getSelectedRingtone())?.uri || 'default';
    console.log('Previewing alarm sound:', soundToTest);
    // In a real implementation, you'd call a native method to play a preview
  }

  async getAlarmSettings(): Promise<{
    currentSound: Ringtone | null;
    availableSounds: Ringtone[];
    vibration: boolean;
    snoozeMinutes: number;
    maxAlarmDuration: number;
    autoSnoozeOnTimeout: boolean;
    icons: { small: string; big: string };
  }> {
    const [currentSound, availableSounds, vibration, snoozeMinutes, config] =
      await Promise.all([
        this.getSelectedRingtone(),
        this.getAllRingtones(),
        this.getVibrate(),
        this.getSnoozeMinutes(),
        this.getConfig(),
      ]);

    return {
      currentSound,
      availableSounds: availableSounds || [],
      vibration,
      snoozeMinutes,
      maxAlarmDuration: config.maxAlarmDuration || 0,
      autoSnoozeOnTimeout: config.autoSnoozeOnTimeout || false,
      icons: {
        small: config.smallIcon,
        big: config.bigIcon,
      },
    };
  }

  async clearAllSettings(): Promise<boolean> {
    if (this.nativeModule.clearAllSettings) {
      return this.nativeModule.clearAllSettings();
    }
    // Fallback: clear individual settings
    await Promise.all([
      this.setRingtone(null),
      this.setVibrate(true),
      this.setSnoozeMinutes(5),
      this.setMaxAlarmDuration(0), // Reset to infinite
    ]);
    return true;
  }

  async getCurrentVibrationStatus(): Promise<{
    vibrateSetting: boolean;
    hasVibrator: boolean;
    willVibrate: boolean;
  }> {
    return this.nativeModule.getCurrentVibrationStatus();
  }

  // Helper method to get timeout settings in a user-friendly format
  async getTimeoutSettings(): Promise<{
    maxAlarmDuration: number;
    isInfinite: boolean;
    formattedDuration: string;
  }> {
    const [maxDuration] = await Promise.all([this.getMaxAlarmDuration()]);

    return {
      maxAlarmDuration: maxDuration,
      isInfinite: maxDuration === 0,
      formattedDuration:
        maxDuration === 0 ? 'Infinite' : `${maxDuration} seconds`,
    };
  }
}