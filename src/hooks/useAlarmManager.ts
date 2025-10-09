import { useCallback, useState, useEffect } from 'react';
import useAlarm from './useAlarm';
import { AlarmScheduleConfig } from '../types/Alarm';

// Hook for managing multiple alarms state
const useAlarmManager = () => {
  const [scheduledAlarms, setScheduledAlarms] = useState<Set<string>>(
    new Set(),
  );

  // Use all state from useAlarm to keep everything synchronized
  const {
    scheduleAlarm,
    cancelAlarm,
    cancelAllAlarms,
    getScheduledAlarms,
    isLoading,
    isInitializing,
    error,
    hasExactAlarmPermission,
    systemInfo,
    initializationStatus,
    checkPermission,
    requestFullScreenIntentPermission,
    openAppSettings,
    refreshInitializationStatus,
    retryInitialization,
    clearError,
  } = useAlarm();

  // Load existing alarms on initialization
  useEffect(() => {
    if (!isInitializing) {
      loadExistingAlarms();
    }
  }, [isInitializing]);

  const loadExistingAlarms = useCallback(async () => {
    try {
      const alarms = await getScheduledAlarms();
      const alarmIds = alarms.map(alarm => alarm.requestCodeStr);
      setScheduledAlarms(new Set(alarmIds));
    } catch (err) {
      console.error('Failed to load existing alarms:', err);
    }
  }, [getScheduledAlarms]);

  const scheduleAndTrackAlarm = useCallback(
    async (config: AlarmScheduleConfig): Promise<string> => {
      const requestCode = await scheduleAlarm(config);
      setScheduledAlarms(prev => new Set(prev).add(requestCode));
      return requestCode;
    },
    [scheduleAlarm],
  );

  const cancelAndUntrackAlarm = useCallback(
    async (requestCodeStr: string): Promise<boolean> => {
      const result = await cancelAlarm(requestCodeStr);
      if (result) {
        setScheduledAlarms(prev => {
          const newSet = new Set(prev);
          newSet.delete(requestCodeStr);
          return newSet;
        });
      }
      return result;
    },
    [cancelAlarm],
  );

  const cancelAllTrackedAlarms = useCallback(async (): Promise<boolean> => {
    const result = await cancelAllAlarms();
    if (result) {
      setScheduledAlarms(new Set());
    }
    return result;
  }, [cancelAllAlarms]);

  const refreshAlarms = useCallback(async (): Promise<void> => {
    await loadExistingAlarms();
  }, [loadExistingAlarms]);

  const isAlarmScheduled = useCallback(
    (requestCodeStr: string): boolean => {
      return scheduledAlarms.has(requestCodeStr);
    },
    [scheduledAlarms],
  );

  const getScheduledAlarmsCount = useCallback((): number => {
    return scheduledAlarms.size;
  }, [scheduledAlarms]);

  return {
    // State (all synchronized from useAlarm)
    scheduledAlarms: Array.from(scheduledAlarms),
    scheduledAlarmsCount: scheduledAlarms.size,
    isLoading,
    isInitializing,
    error,
    hasExactAlarmPermission,
    systemInfo,
    initializationStatus,

    // Actions
    scheduleAlarm: scheduleAndTrackAlarm,
    cancelAlarm: cancelAndUntrackAlarm,
    cancelAllAlarms: cancelAllTrackedAlarms,
    refreshAlarms,
    isAlarmScheduled,
    getScheduledAlarmsCount,
    checkPermission,
    requestFullScreenIntentPermission,
    openAppSettings,
    refreshInitializationStatus,
    retryInitialization,
    clearError,
  };
};

export default useAlarmManager;