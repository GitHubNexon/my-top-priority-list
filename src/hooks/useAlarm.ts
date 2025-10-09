import { useState, useCallback, useEffect } from 'react';
import { AlarmService } from '../services/AlarmServices';
import {
  AlarmScheduleConfig,
  SystemInfo,
  InitializationStatus,
} from '../types/Alarm';

const alarmService = new AlarmService();

const useAlarm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasExactAlarmPermission, setHasExactAlarmPermission] = useState<
    boolean | null
  >(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [initializationStatus, setInitializationStatus] =
    useState<InitializationStatus | null>(null);

  // Initialize alarm system on mount
  useEffect(() => {
    initializeAlarmSystem();
  }, []);

  const initializeAlarmSystem = useCallback(async () => {
    try {
      setIsInitializing(true);
      setError(null);

      // Get system info first
      const sysInfo = await alarmService.getSystemInfo();
      setSystemInfo(sysInfo);

      // Get initialization status
      const status = await alarmService.getInitializationStatus();
      setInitializationStatus(status);

      // Initialize alarm system
      const result = await alarmService.initialize();

      if (result === 'PERMISSION_NEEDED') {
        setError('SCHEDULE_EXACT_ALARM permission required for Android 12+');
      }

      // Check exact alarm permission
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
          'SCHEDULE_EXACT_ALARM permission required for Android 12+',
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

  // Request full screen intent permission
  const requestFullScreenIntentPermission =
    useCallback(async (): Promise<boolean> => {
      try {
        return await alarmService.ensureFullScreenIntentPermission();
      } catch (err) {
        setError('Failed to request full screen intent permission');
        return false;
      }
    }, []);

  // Open app settings
  const openAppSettings = useCallback(async (): Promise<boolean> => {
    try {
      return await alarmService.openAppSettings();
    } catch (err) {
      setError('Failed to open app settings');
      return false;
    }
  }, []);

  // Refresh initialization status
  const refreshInitializationStatus = useCallback(async (): Promise<void> => {
    try {
      const status = await alarmService.getInitializationStatus();
      setInitializationStatus(status);
    } catch (err) {
      setError('Failed to refresh initialization status');
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
    isLoading: isLoading || isInitializing,
    isInitializing,
    error,
    hasExactAlarmPermission,
    systemInfo,
    initializationStatus,

    // Actions
    scheduleAlarm,
    cancelAlarm,
    cancelAllAlarms,
    getScheduledAlarms,
    checkPermission,
    requestFullScreenIntentPermission,
    openAppSettings,
    refreshInitializationStatus,
    retryInitialization,
    clearError,
  };
};

export default useAlarm;