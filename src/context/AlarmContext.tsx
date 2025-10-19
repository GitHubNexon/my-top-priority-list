import React, { createContext, useCallback, useState, useEffect } from 'react';
import { AlarmService } from '../services/AlarmServices';
import {
    AlarmScheduleConfig,
    AlarmState,
    AlarmError,
    NotificationPermissionStatus,
    InitializationResult
} from '../types/Alarm';

interface AlarmContextValue extends AlarmState {
    scheduleAlarm: (config: AlarmScheduleConfig) => Promise<string>;
    cancelAlarm: (requestCodeStr: string) => Promise<boolean>;
    cancelAllAlarms: () => Promise<boolean>;
    getScheduledAlarms: () => Promise<AlarmScheduleConfig[]>;
    checkPermission: () => Promise<boolean>;
    requestFullScreenIntentPermission: () => Promise<boolean>;
    openAppSettings: () => Promise<boolean>;
    refreshInitializationStatus: () => Promise<void>;
    retryInitialization: () => Promise<void>;
    requestNotificationPermission: () => Promise<NotificationPermissionStatus>;
    checkNotificationPermission: () => Promise<NotificationPermissionStatus>;
    clearAllAlarms: () => Promise<boolean>;
    clearError: () => void;
}

export const AlarmContext = createContext<AlarmContextValue | undefined>(undefined);

// Singleton service instance
const alarmService = new AlarmService();

const AlarmProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, setState] = useState<AlarmState>({
        isLoading: false,
        isInitializing: true,
        error: null,
        hasExactAlarmPermission: null,
        systemInfo: null,
        initializationStatus: null,
        scheduledAlarms: [],
    });

    const setError = useCallback((error: AlarmError | null): void => {
        setState(prev => ({ ...prev, error }));
    }, []); // Empty dependency array since setState is stable

    const setLoading = useCallback((isLoading: boolean): void => {
        setState(prev => ({ ...prev, isLoading }));
    }, []); // Empty dependency array since setState is stable

    const initializeAlarmSystem = useCallback(async (): Promise<void> => {
        try {
            setState(prev => ({ ...prev, isInitializing: true, error: null }));

            const [sysInfo, status] = await Promise.all([
                alarmService.getSystemInfo(),
                alarmService.getInitializationStatus()
            ]);

            setState(prev => ({ ...prev, systemInfo: sysInfo, initializationStatus: status }));

            const result = await alarmService.initialize();

            if (result === InitializationResult.PERMISSION_NEEDED) {
                setError({
                    code: 'PERMISSION_NEEDED',
                    message: 'SCHEDULE_EXACT_ALARM permission required for Android 12+'
                });
            }

            const hasPermission = await alarmService.checkExactAlarmPermission();
            setState(prev => ({ ...prev, hasExactAlarmPermission: hasPermission }));
        } catch (err) {
            setError({
                code: 'INITIALIZATION_FAILED',
                message: err instanceof Error ? err.message : 'Failed to initialize alarm system',
                details: err
            });
        } finally {
            setState(prev => ({ ...prev, isInitializing: false }));
        }
    }, [setError]); // Only depends on setError

    // Initialize alarm system on mount
    useEffect(() => {
        initializeAlarmSystem();
    }, [initializeAlarmSystem]); // Now depends on the memoized initializeAlarmSystem

    const scheduleAlarm = useCallback(async (config: AlarmScheduleConfig): Promise<string> => {
        if (state.isInitializing) {
            throw new Error('Alarm system is still initializing');
        }

        if (state.hasExactAlarmPermission === false) {
            throw new Error('SCHEDULE_EXACT_ALARM permission required for Android 12+');
        }

        setLoading(true);
        setError(null);

        try {
            const result = await alarmService.scheduleAlarm(config);
            return result;
        } catch (err) {
            const error: AlarmError = {
                code: 'SCHEDULE_FAILED',
                message: err instanceof Error ? err.message : 'Failed to schedule alarm',
                details: err
            };
            setError(error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [state.isInitializing, state.hasExactAlarmPermission, setLoading, setError]);

    const cancelAlarm = useCallback(async (requestCodeStr: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const result = await alarmService.cancelAlarm(requestCodeStr);
            return result;
        } catch (err) {
            const error: AlarmError = {
                code: 'CANCEL_FAILED',
                message: err instanceof Error ? err.message : 'Failed to cancel alarm',
                details: err
            };
            setError(error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError]);

    const cancelAllAlarms = useCallback(async (): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const result = await alarmService.cancelAllAlarms();
            setState(prev => ({ ...prev, scheduledAlarms: [] }));
            return result;
        } catch (err) {
            const error: AlarmError = {
                code: 'CANCEL_ALL_FAILED',
                message: err instanceof Error ? err.message : 'Failed to cancel all alarms',
                details: err
            };
            setError(error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError]);

    const getScheduledAlarms = useCallback(async (): Promise<AlarmScheduleConfig[]> => {
        try {
            const alarms = await alarmService.getAllScheduledAlarms();
            setState(prev => ({ ...prev, scheduledAlarms: alarms }));
            return alarms;
        } catch (err) {
            const error: AlarmError = {
                code: 'FETCH_ALARMS_FAILED',
                message: 'Failed to get scheduled alarms',
                details: err
            };
            setError(error);
            throw err;
        }
    }, [setError]);

    const checkPermission = useCallback(async (): Promise<boolean> => {
        try {
            const hasPermission = await alarmService.checkExactAlarmPermission();
            setState(prev => ({ ...prev, hasExactAlarmPermission: hasPermission }));
            return hasPermission;
        } catch (err) {
            const error: AlarmError = {
                code: 'PERMISSION_CHECK_FAILED',
                message: 'Failed to check alarm permission',
                details: err
            };
            setError(error);
            return false;
        }
    }, [setError]);

    const requestFullScreenIntentPermission = useCallback(async (): Promise<boolean> => {
        try {
            return await alarmService.ensureFullScreenIntentPermission();
        } catch (err) {
            const error: AlarmError = {
                code: 'FULLSCREEN_PERMISSION_FAILED',
                message: 'Failed to request full screen intent permission',
                details: err
            };
            setError(error);
            return false;
        }
    }, [setError]);

    const openAppSettings = useCallback(async (): Promise<boolean> => {
        try {
            return await alarmService.openAppSettings();
        } catch (err) {
            const error: AlarmError = {
                code: 'OPEN_SETTINGS_FAILED',
                message: 'Failed to open app settings',
                details: err
            };
            setError(error);
            return false;
        }
    }, [setError]);

    const refreshInitializationStatus = useCallback(async (): Promise<void> => {
        try {
            const status = await alarmService.getInitializationStatus();
            setState(prev => ({ ...prev, initializationStatus: status }));
        } catch (err) {
            const error: AlarmError = {
                code: 'REFRESH_STATUS_FAILED',
                message: 'Failed to refresh initialization status',
                details: err
            };
            setError(error);
        }
    }, [setError]);

    const retryInitialization = useCallback(async (): Promise<void> => {
        await initializeAlarmSystem();
    }, [initializeAlarmSystem]);

    const requestNotificationPermission = useCallback(async (): Promise<NotificationPermissionStatus> => {
        try {
            return await alarmService.requestNotificationPermission();
        } catch (err) {
            const error: AlarmError = {
                code: 'NOTIFICATION_PERMISSION_FAILED',
                message: 'Failed to request notification permission',
                details: err
            };
            setError(error);
            throw err;
        }
    }, [setError]);

    const checkNotificationPermission = useCallback(async (): Promise<NotificationPermissionStatus> => {
        try {
            return await alarmService.checkNotificationPermission();
        } catch (err) {
            const error: AlarmError = {
                code: 'NOTIFICATION_CHECK_FAILED',
                message: 'Failed to check notification permission',
                details: err
            };
            setError(error);
            throw err;
        }
    }, [setError]);

    const clearAllAlarms = useCallback(async (): Promise<boolean> => {
        try {
            const clearAll = await alarmService.clearAllAlarms();
            return clearAll;
        } catch (err) {
            const error: AlarmError = {
                code: 'CLEAR_ALL_ALARMS_FAILED',
                message: 'Failed to clear all of the alarms from local storage',
                details: err
            };
            setError(error);
            throw err;
        }
    }, [setError]);

    const clearError = useCallback((): void => {
        setError(null);
    }, [setError]);

    const value: AlarmContextValue = {
        ...state,
        scheduleAlarm,
        cancelAlarm,
        cancelAllAlarms,
        getScheduledAlarms,
        checkPermission,
        requestFullScreenIntentPermission,
        openAppSettings,
        refreshInitializationStatus,
        retryInitialization,
        requestNotificationPermission,
        checkNotificationPermission,
        clearAllAlarms,
        clearError,
    };

    return (
        <AlarmContext.Provider value={value}>
            {children}
        </AlarmContext.Provider>
    );
};

export default AlarmProvider;