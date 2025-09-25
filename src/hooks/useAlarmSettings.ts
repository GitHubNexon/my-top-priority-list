import { useCallback, useState } from "react";
import { Ringtone } from "../types/AlarmConfig";
import useAlarmConfig from "./useAlarmConfig";

// Hook for managing alarm settings state
const useAlarmSettings = () => {
  const [settings, setSettings] = useState<{
    currentSound: Ringtone | null;
    availableSounds: Ringtone[];
    vibration: boolean;
    snoozeMinutes: number;
    icons: { small: string; big: string };
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    getAlarmSettings,
    setAlarmSound,
    setVibration,
    setSnoozeMinutes,
    getCurrentVibrationStatus,
    getAvailableAlarmSounds
  } = useAlarmConfig();

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const alarmSettings = await getAlarmSettings();
      const vibrationStatus = await getCurrentVibrationStatus();

      setSettings({
        ...alarmSettings,
        vibration: vibrationStatus.vibrateSetting,
      });

      return { ...alarmSettings, vibrationStatus };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAlarmSettings, getCurrentVibrationStatus]);

  const updateAlarmSound = useCallback(
    async (soundUri: string | null) => {
      try {
        await setAlarmSound(soundUri);
        // Refresh settings after update
        await loadSettings();
      } catch (err) {
        throw err;
      }
    },
    [setAlarmSound, loadSettings],
  );

  const loadAvailableRingtones = useCallback(async (): Promise<Ringtone[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const ringtones = await getAvailableAlarmSounds();
      setSettings(prev =>
        prev ? { ...prev, availableSounds: ringtones } : null,
      );
      return ringtones;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ringtones');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAvailableAlarmSounds]);

  const updateVibration = useCallback(
    async (enabled: boolean) => {
      try {
        await setVibration(enabled);
        // Refresh settings after update
        await loadSettings();
      } catch (err) {
        throw err;
      }
    },
    [setVibration, loadSettings],
  );

  const updateSnoozeMinutes = useCallback(
    async (minutes: number) => {
      try {
        await setSnoozeMinutes(minutes);
        // Refresh settings after update
        await loadSettings();
      } catch (err) {
        throw err;
      }
    },
    [setSnoozeMinutes, loadSettings],
  );

  return {
    settings,
    isLoading,
    error,
    loadSettings,
    updateAlarmSound,
    updateVibration,
    loadAvailableRingtones,
    updateSnoozeMinutes,
  };
};

export default useAlarmSettings;