// hooks/useAlarm.ts
import { useState, useCallback } from 'react';
import { AlarmService } from '../services/AlarmServices';
import { AlarmScheduleConfig } from '../types/Alarm';

const alarmService = new AlarmService();

const useAlarm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Main scheduling method
  const scheduleAlarm = useCallback(
    async (config: AlarmScheduleConfig): Promise<string> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await alarmService.scheduleAlarm(config);
        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to schedule alarm',
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Alarm management
  const cancelAlarm = useCallback(
    async (requestCodeStr: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await alarmService.cancelAlarm(requestCodeStr);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to cancel alarm');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const cancelAllAlarms = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await alarmService.cancelAllAlarms();
      return result;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to cancel all alarms',
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Convenience methods
  const scheduleDailyAlarm = useCallback(
    async (
      time: string,
      message: string,
      title: string = 'Daily Alarm',
      requestCodeStr?: string,
    ): Promise<string> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await alarmService.scheduleDailyAlarm(
          time,
          message,
          title,
          requestCodeStr,
        );
        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to schedule daily alarm',
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const scheduleWeeklyAlarm = useCallback(
    async (
      time: string,
      message: string,
      daysOfWeek: number[],
      title: string = 'Weekly Alarm',
      requestCodeStr?: string,
    ): Promise<string> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await alarmService.scheduleWeeklyAlarm(
          time,
          message,
          daysOfWeek,
          title,
          requestCodeStr,
        );
        return result;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to schedule weekly alarm',
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const scheduleMonthlyAlarm = useCallback(
    async (
      time: string,
      message: string,
      dayOfMonth: number,
      title: string = 'Monthly Alarm',
      requestCodeStr?: string,
    ): Promise<string> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await alarmService.scheduleMonthlyAlarm(
          time,
          message,
          dayOfMonth,
          title,
          requestCodeStr,
        );
        return result;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to schedule monthly alarm',
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const scheduleCustomIntervalAlarm = useCallback(
    async (
      time: string,
      message: string,
      intervalDays: number,
      title: string = 'Custom Alarm',
      requestCodeStr?: string,
    ): Promise<string> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await alarmService.scheduleCustomIntervalAlarm(
          time,
          message,
          intervalDays,
          title,
          requestCodeStr,
        );
        return result;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to schedule custom alarm',
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const scheduleSpecificDateAlarm = useCallback(
    async (
      date: Date,
      message: string,
      title: string = 'Alarm',
      requestCodeStr?: string,
    ): Promise<string> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await alarmService.scheduleSpecificDateAlarm(
          date,
          message,
          title,
          requestCodeStr,
        );
        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to schedule date alarm',
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Utility methods
  const generateRequestCode = useCallback(
    (prefix: string = 'alarm'): string => {
      return alarmService.generateRequestCode(prefix);
    },
    [],
  );

  // hooks/useAlarm.ts - Fix the getTimestampFromTime method
  const getTimestampFromTime = useCallback((timeString: string): number => {
    return alarmService.getTimestampFromTime(timeString);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,

    // Alarm Management
    scheduleAlarm,
    cancelAlarm,
    cancelAllAlarms,

    // Convenience Methods
    scheduleDailyAlarm,
    scheduleWeeklyAlarm,
    scheduleMonthlyAlarm,
    scheduleCustomIntervalAlarm,
    scheduleSpecificDateAlarm,

    // Utilities
    generateRequestCode,
    getTimestampFromTime,
    clearError,

    // Constants
    DayOfWeek: AlarmService.DayOfWeek,
  };
};

export default useAlarm;