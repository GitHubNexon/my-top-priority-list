import { useCallback, useState } from 'react';
import useAlarm from './useAlarm';
import { AlarmScheduleConfig } from '../types/Alarm';

// Hook for managing multiple alarms state
const useAlarmManager = () => {
  const [scheduledAlarms, setScheduledAlarms] = useState<Set<string>>(
    new Set(),
  );

  // Only use the error from useAlarm, don't create a separate one
  const {
    scheduleAlarm,
    cancelAlarm,
    cancelAllAlarms,
    isLoading,
    error,
    clearError,
  } = useAlarm();

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
    // State
    scheduledAlarms: Array.from(scheduledAlarms),
    scheduledAlarmsCount: scheduledAlarms.size,
    isLoading,
    error,

    // Actions
    scheduleAlarm: scheduleAndTrackAlarm,
    cancelAlarm: cancelAndUntrackAlarm,
    cancelAllAlarms: cancelAllTrackedAlarms,
    isAlarmScheduled,
    getScheduledAlarmsCount,
    clearError,
  };
};

export default useAlarmManager;