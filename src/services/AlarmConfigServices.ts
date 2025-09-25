import { NativeModules } from 'react-native';
import {
  AlarmConfigNativeModule,
  AlarmConfigData,
  Ringtone,
} from '../types/AlarmConfig';

const { AlarmConfig } = NativeModules;

export class AlarmConfigServices {
  private readonly nativeModule: AlarmConfigNativeModule;

  constructor() {
    this.nativeModule = AlarmConfig as AlarmConfigNativeModule;
  }

  // --- Snooze Minutes ---
  async setSnoozeMinutes(minutes: number): Promise<boolean> {
    if (minutes <= 0 || minutes > 60) {
      throw new Error('Snooze minutes must be between 1 and 60');
    }
    return this.nativeModule.setSnoozeMinutes(minutes);
  }

  async getSnoozeMinutes(): Promise<number> {
    return this.nativeModule.getSnoozeMinutes();
  }

  // --- Ringtone ---
  async setRingtone(uri: string | null): Promise<boolean> {
    if (uri && !this.isValidUri(uri)) {
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

  // --- Vibrate ---
  async setVibrate(enabled: boolean): Promise<boolean> {
    return this.nativeModule.setVibrate(enabled);
  }

  async getVibrate(): Promise<boolean> {
    return this.nativeModule.getVibrate();
  }

  // --- Icons ---
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

  // --- Full Config ---
  async getConfig(): Promise<AlarmConfigData> {
    return this.nativeModule.getConfig();
  }

  // --- Enhanced Methods ---
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

  private isValidUri(uri: string): boolean {
    try {
      return (
        uri.startsWith('content://') ||
        uri.startsWith('file://') ||
        uri.includes('android_asset')
      );
    } catch {
      return false;
    }
  }
}
