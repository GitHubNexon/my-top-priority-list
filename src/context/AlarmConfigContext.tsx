import React, { createContext, useCallback, useState } from 'react';
import { AlarmConfigServices } from '../services/AlarmConfigServices';
import {
    Ringtone,
    AlarmConfigData,
    AlarmSettings,
    AlarmConfigState,
    VibrationStatus,
    AlarmTimeoutAction
} from '../types/AlarmConfig';

interface AlarmConfigContextValue extends AlarmConfigState {
    // Snooze
    setSnoozeMinutes: (minutes: number) => Promise<boolean>;
    getSnoozeMinutes: () => Promise<number>;

    // Sound
    setAlarmSound: (soundUri: string | null) => Promise<boolean>;
    getCurrentAlarmSound: () => Promise<Ringtone | null>;
    getAvailableAlarmSounds: () => Promise<Ringtone[]>;
    resetToDefaultSound: () => Promise<boolean>;
    testSoundPreview: (soundUri?: string) => Promise<void>;

    // Vibration
    setVibration: (enabled: boolean) => Promise<boolean>;
    getVibration: () => Promise<boolean>;
    getCurrentVibrationStatus: () => Promise<VibrationStatus>;

    // Icons
    setSmallIcon: (name: string) => Promise<boolean>;
    getSmallIcon: () => Promise<string>;
    setBigIcon: (name: string) => Promise<boolean>;
    getBigIcon: () => Promise<string>;

    // Timeout
    setMaxAlarmDuration: (seconds: number) => Promise<boolean>;
    getMaxAlarmDuration: () => Promise<number>;
    setAlarmTimeoutAction: (action: AlarmTimeoutAction) => Promise<boolean>;
    getAlarmTimeoutAction: () => Promise<AlarmTimeoutAction>;

    // Configuration
    getAlarmConfig: () => Promise<AlarmConfigData>;
    getAlarmSettings: () => Promise<AlarmSettings>;
    clearAllSettings: () => Promise<boolean>;

    // Utility
    clearError: () => void;
    loadSettings: () => Promise<AlarmSettings>;
}

export const AlarmConfigContext = createContext<AlarmConfigContextValue | undefined>(undefined);

// Singleton service instance
const alarmConfigService = new AlarmConfigServices();

const AlarmConfigProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, setState] = useState<AlarmConfigState>({
        isLoading: false,
        error: null,
        settings: null,
    });

    const setError = useCallback((error: string | null): void => {
        setState(prev => ({ ...prev, error }));
    }, []);

    const setLoading = useCallback((isLoading: boolean): void => {
        setState(prev => ({ ...prev, isLoading }));
    }, []);

    const setSettings = useCallback((settings: AlarmSettings | null): void => {
        setState(prev => ({ ...prev, settings }));
    }, []);

    const executeWithLoading = useCallback(async <T,>(
        operation: () => Promise<T>,
        errorMessage: string
    ): Promise<T> => {
        setLoading(true);
        setError(null);

        try {
            return await operation();
        } catch (err) {
            const message = err instanceof Error ? err.message : errorMessage;
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError]);

    // Snooze Minutes
    const setSnoozeMinutes = useCallback(async (minutes: number): Promise<boolean> => {
        return executeWithLoading(
            () => alarmConfigService.setSnoozeMinutes(minutes),
            'Failed to set snooze minutes'
        );
    }, [executeWithLoading]);

    const getSnoozeMinutes = useCallback(async (): Promise<number> => {
        return executeWithLoading(
            () => alarmConfigService.getSnoozeMinutes(),
            'Failed to get snooze minutes'
        );
    }, [executeWithLoading]);

    // Sound Management
    const setAlarmSound = useCallback(async (soundUri: string | null): Promise<boolean> => {
        return executeWithLoading(
            () => alarmConfigService.setRingtone(soundUri),
            'Failed to set alarm sound'
        );
    }, [executeWithLoading]);

    const getCurrentAlarmSound = useCallback(async (): Promise<Ringtone | null> => {
        return executeWithLoading(
            () => alarmConfigService.getSelectedRingtone(),
            'Failed to get alarm sound'
        );
    }, [executeWithLoading]);

    const getAvailableAlarmSounds = useCallback(async (): Promise<Ringtone[]> => {
        return executeWithLoading(
            () => alarmConfigService.getAllRingtones(),
            'Failed to get available sounds'
        );
    }, [executeWithLoading]);

    const resetToDefaultSound = useCallback(async (): Promise<boolean> => {
        return executeWithLoading(
            () => alarmConfigService.resetToDefaultSound(),
            'Failed to reset sound'
        );
    }, [executeWithLoading]);

    // Vibration
    const setVibration = useCallback(async (enabled: boolean): Promise<boolean> => {
        return executeWithLoading(
            () => alarmConfigService.setVibrate(enabled),
            'Failed to set vibration'
        );
    }, [executeWithLoading]);

    const getVibration = useCallback(async (): Promise<boolean> => {
        return executeWithLoading(
            () => alarmConfigService.getVibrate(),
            'Failed to get vibration setting'
        );
    }, [executeWithLoading]);

    // Icons
    const setSmallIcon = useCallback(async (name: string): Promise<boolean> => {
        return executeWithLoading(
            () => alarmConfigService.setSmallIcon(name),
            'Failed to set small icon'
        );
    }, [executeWithLoading]);

    const getSmallIcon = useCallback(async (): Promise<string> => {
        return executeWithLoading(
            () => alarmConfigService.getSmallIcon(),
            'Failed to get small icon'
        );
    }, [executeWithLoading]);

    const setBigIcon = useCallback(async (name: string): Promise<boolean> => {
        return executeWithLoading(
            () => alarmConfigService.setBigIcon(name),
            'Failed to set big icon'
        );
    }, [executeWithLoading]);

    const getBigIcon = useCallback(async (): Promise<string> => {
        return executeWithLoading(
            () => alarmConfigService.getBigIcon(),
            'Failed to get big icon'
        );
    }, [executeWithLoading]);

    // Timeout Settings
    const setMaxAlarmDuration = useCallback(async (seconds: number): Promise<boolean> => {
        return executeWithLoading(
            () => alarmConfigService.setMaxAlarmDuration(seconds),
            'Failed to set max alarm duration'
        );
    }, [executeWithLoading]);

    const getMaxAlarmDuration = useCallback(async (): Promise<number> => {
        return executeWithLoading(
            () => alarmConfigService.getMaxAlarmDuration(),
            'Failed to get max alarm duration'
        );
    }, [executeWithLoading]);

    const setAlarmTimeoutAction = useCallback(async (action: AlarmTimeoutAction): Promise<boolean> => {
        return executeWithLoading(
            () => alarmConfigService.setAlarmTimeoutAction(action),
            'Failed to set timeout action'
        );
    }, [executeWithLoading]);

    const getAlarmTimeoutAction = useCallback(async (): Promise<AlarmTimeoutAction> => {
        return executeWithLoading(
            async () => {
                const result = await alarmConfigService.getAlarmTimeoutAction();
                // Cast the string to AlarmTimeoutAction enum
                if (result === 'SNOOZE' || result === 'STOP') {
                    return result as AlarmTimeoutAction;
                }
                // Default fallback
                return AlarmTimeoutAction.SNOOZE;
            },
            'Failed to get timeout action'
        );
    }, [executeWithLoading]);

    // Configuration
    const getAlarmConfig = useCallback(async (): Promise<AlarmConfigData> => {
        return executeWithLoading(
            () => alarmConfigService.getConfig(),
            'Failed to get alarm config'
        );
    }, [executeWithLoading]);

    const getAlarmSettings = useCallback(async (): Promise<AlarmSettings> => {
        return executeWithLoading(
            () => alarmConfigService.getAlarmSettings(),
            'Failed to get alarm settings'
        );
    }, [executeWithLoading]);

    const clearAllSettings = useCallback(async (): Promise<boolean> => {
        return executeWithLoading(
            () => alarmConfigService.clearAllSettings(),
            'Failed to clear settings'
        );
    }, [executeWithLoading]);

    const getCurrentVibrationStatus = useCallback(async (): Promise<VibrationStatus> => {
        return executeWithLoading(
            () => alarmConfigService.getCurrentVibrationStatus(),
            'Failed to get vibration status'
        );
    }, [executeWithLoading]);

    const testSoundPreview = useCallback(async (soundUri?: string): Promise<void> => {
        return executeWithLoading(
            () => alarmConfigService.testSoundPreview(soundUri),
            'Failed to test sound'
        );
    }, [executeWithLoading]);

    const loadSettings = useCallback(async (): Promise<AlarmSettings> => {
        const settings = await getAlarmSettings();
        setSettings(settings);
        return settings;
    }, [getAlarmSettings]);

    const clearError = useCallback((): void => {
        setError(null);
    }, [setError]);

    const value: AlarmConfigContextValue = {
        ...state,
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
        setMaxAlarmDuration,
        getMaxAlarmDuration,
        setAlarmTimeoutAction,
        getAlarmTimeoutAction,
        getAlarmConfig,
        getAlarmSettings,
        clearAllSettings,
        getCurrentVibrationStatus,
        testSoundPreview,
        clearError,
        loadSettings,
    };

    return (
        <AlarmConfigContext.Provider value={value}>
            {children}
        </AlarmConfigContext.Provider>
    );
};

export default AlarmConfigProvider;