// hooks/useAlarmConfig.ts
import { useState, useCallback } from 'react';
import { AlarmConfigServices } from '../services/AlarmConfigServices';
import { Ringtone, AlarmConfigData } from '../types/AlarmConfig';

const alarmConfigService = new AlarmConfigServices();

const useAlarmConfig = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Snooze Minutes
  const setSnoozeMinutes = useCallback(
    async (minutes: number): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await alarmConfigService.setSnoozeMinutes(minutes);
        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to set snooze minutes',
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getSnoozeMinutes = useCallback(async (): Promise<number> => {
    setIsLoading(true);
    setError(null);
    try {
      return await alarmConfigService.getSnoozeMinutes();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get snooze minutes',
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ringtone Management
  const setAlarmSound = useCallback(
    async (soundUri: string | null): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await alarmConfigService.setRingtone(soundUri);
        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to set alarm sound',
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getCurrentAlarmSound =
    useCallback(async (): Promise<Ringtone | null> => {
      setIsLoading(true);
      setError(null);
      try {
        return await alarmConfigService.getSelectedRingtone();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to get alarm sound',
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, []);

  const getAvailableAlarmSounds = useCallback(async (): Promise<Ringtone[]> => {
    setIsLoading(true);
    setError(null);
    try {
      return await alarmConfigService.getAllRingtones();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get available sounds',
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetToDefaultSound = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      return await alarmConfigService.resetToDefaultSound();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset sound');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Vibration
  const setVibration = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        return await alarmConfigService.setVibrate(enabled);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to set vibration',
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getVibration = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      return await alarmConfigService.getVibrate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get vibration setting',
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Icons
  const setSmallIcon = useCallback(async (name: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      return await alarmConfigService.setSmallIcon(name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set small icon');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSmallIcon = useCallback(async (): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      return await alarmConfigService.getSmallIcon();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get small icon');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setBigIcon = useCallback(async (name: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      return await alarmConfigService.setBigIcon(name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set big icon');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBigIcon = useCallback(async (): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      return await alarmConfigService.getBigIcon();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get big icon');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Complete Configuration
  const getAlarmConfig = useCallback(async (): Promise<AlarmConfigData> => {
    setIsLoading(true);
    setError(null);
    try {
      return await alarmConfigService.getConfig();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get alarm config',
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAlarmSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await alarmConfigService.getAlarmSettings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get alarm settings',
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAllSettings = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      return await alarmConfigService.clearAllSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCurrentVibrationStatus = useCallback(async (): Promise<{
    vibrateSetting: boolean;
    hasVibrator: boolean;
    willVibrate: boolean
  }> => {
    setIsLoading(true);
    setError(null);
    try {
      return await alarmConfigService.getCurrentVibrationStatus();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get vibration status',
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testSoundPreview = useCallback(
    async (soundUri?: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await alarmConfigService.testSoundPreview(soundUri);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to test sound');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,

    // Actions
    setSnoozeMinutes,
    getSnoozeMinutes,
    setAlarmSound,
    getCurrentAlarmSound,
    getAvailableAlarmSounds,
    resetToDefaultSound,
    setVibration,
    getVibration,
    setSmallIcon,
    getSmallIcon,
    setBigIcon,
    getBigIcon,
    getAlarmConfig,
    getAlarmSettings,
    clearAllSettings,
    getCurrentVibrationStatus,
    testSoundPreview,
    clearError,
  };
};

export default useAlarmConfig;
