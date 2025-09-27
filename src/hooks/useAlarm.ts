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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    scheduleAlarm,
    cancelAlarm,
    cancelAllAlarms,
    clearError,
  };
};

export default useAlarm;