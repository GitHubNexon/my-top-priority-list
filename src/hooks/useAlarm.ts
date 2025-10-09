import { useState, useCallback, useEffect } from 'react';
import { AlarmService } from '../services/AlarmServices';
import { AlarmScheduleConfig } from '../types/Alarm';

const alarmService = new AlarmService();

const useAlarm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasExactAlarmPermission, setHasExactAlarmPermission] = useState<
    boolean | null
  >(null);

  // Initialize alarm system on mount
  useEffect(() => {
    initializeAlarmSystem();
  }, []);

  const initializeAlarmSystem = useCallback(async () => {
    try {
      setIsInitializing(true);
      // FIXED: Use the correct method name
      const result = await alarmService.initializeAlarm();

      if (result === 'PERMISSION_NEEDED') {
        setError('SCHEDULE_EXACT_ALARM permission required for Android 14+');
      }

      const hasPermission = await alarmService.checkExactAlarmPermission();
      setHasExactAlarmPermission(hasPermission);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to initialize alarm system',
      );
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Updated scheduling method
  const scheduleAlarm = useCallback(
    async (config: AlarmScheduleConfig): Promise<string> => {
      if (isInitializing) {
        throw new Error('Alarm system is still initializing');
      }

      if (hasExactAlarmPermission === false) {
        throw new Error(
          'SCHEDULE_EXACT_ALARM permission required for Android 14+',
        );
      }

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
    [isInitializing, hasExactAlarmPermission],
  );

  // Check permission method
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      const hasPermission = await alarmService.checkExactAlarmPermission();
      setHasExactAlarmPermission(hasPermission);
      return hasPermission;
    } catch (err) {
      setError('Failed to check alarm permission');
      return false;
    }
  }, []);

  // Retry initialization
  const retryInitialization = useCallback(async (): Promise<void> => {
    await initializeAlarmSystem();
  }, [initializeAlarmSystem]);

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

  // Get all scheduled alarms from storage
  const getScheduledAlarms = useCallback(async (): Promise<any[]> => {
    try {
      return await alarmService.getAllScheduledAlarms();
    } catch (err) {
      setError('Failed to get scheduled alarms');
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading: isLoading || isInitializing, // Combined loading state
    isInitializing,
    error,
    hasExactAlarmPermission,

    // Actions
    scheduleAlarm,
    cancelAlarm,
    cancelAllAlarms,
    getScheduledAlarms,
    checkPermission,
    retryInitialization,
    clearError,
  };
};

export default useAlarm;