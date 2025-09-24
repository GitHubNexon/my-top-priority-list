/* eslint-disable react-native/no-inline-styles */
import WIP from '../../../assets/images/undraw_analytics_6mru.svg';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAlarm, useAlarmConfig, useAlarmManager, useAlarmSettings, useTheme } from '../../../hooks';

const ChartScreen = () => {
  const { theme } = useTheme();
  const themeColor = theme.myColors?.triadic;
  const primaryFontColor = theme.fontColors?.primary

  // Use all hooks
  const alarmConfig = useAlarmConfig();
  const alarmSettings = useAlarmSettings();
  const alarmManager = useAlarmManager();
  const alarm = useAlarm();

  // Local state for demo
  const [snoozeMinutes, setSnoozeMinutes] = useState('5');
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [alarmMessage, setAlarmMessage] = useState('Wake up! This is a test alarm');
  const [alarmTitle, setAlarmTitle] = useState('Test Alarm');

  // Load settings on component mount
  useEffect(() => {
    alarmSettings.loadSettings();
  }, []);

  // Update local state when settings load
  useEffect(() => {
    if (alarmSettings.settings) {
      setSnoozeMinutes(alarmSettings.settings.snoozeMinutes.toString());
      setVibrationEnabled(alarmSettings.settings.vibration);
    }
  }, [alarmSettings.settings]);

  // ===== SETTINGS FUNCTIONS =====

  const handleSaveSnoozeMinutes = async () => {
    try {
      const minutes = parseInt(snoozeMinutes, 10);
      if (minutes >= 1 && minutes <= 60) {
        await alarmConfig.setSnoozeMinutes(minutes);
        await alarmSettings.updateSnoozeMinutes(minutes);
        Alert.alert('Success', `Snooze minutes set to ${minutes}`);
      } else {
        Alert.alert('Error', 'Snooze minutes must be between 1 and 60');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save snooze minutes');
    }
  };

  const handleToggleVibration = async (enabled: boolean) => {
    try {
      setVibrationEnabled(enabled);
      await alarmConfig.setVibration(enabled);
      await alarmSettings.updateVibration(enabled);
      Alert.alert('Success', `Vibration ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      setVibrationEnabled(!enabled); // Revert on error
      Alert.alert('Error', 'Failed to update vibration setting');
    }
  };

  const handleTestSound = async () => {
    try {
      await alarmConfig.testSoundPreview();
      Alert.alert('Sound Test', 'Playing alarm sound preview...');
    } catch (error) {
      Alert.alert('Error', 'Sound preview not available');
    }
  };

  const handleResetToDefaultSound = async () => {
    try {
      await alarmConfig.resetToDefaultSound();
      await alarmSettings.updateAlarmSound(null);
      Alert.alert('Success', 'Reset to default alarm sound');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset sound');
    }
  };

  // ===== ALARM SCHEDULING FUNCTIONS =====

  const schedule5SecondAlarm = async () => {
    try {
      const requestCode = await alarmManager.scheduleAlarm({
        timestamp: Date.now() + 5000, // 5 seconds from now
        title: alarmTitle,
        message: alarmMessage,
        recurrenceType: 'ONCE',
      });

      Alert.alert(
        'Alarm Scheduled!',
        `Alarm will trigger in 5 seconds\nRequest Code: ${requestCode}`
      );
      console.log('Alarm scheduled ✅ with code:', requestCode);
    } catch (error: unknown) {
      if(error instanceof Error) {
        Alert.alert('Error', `Failed to schedule alarm: ${error.message}`)
      }
    }
  };

  const scheduleDailyAlarm = async () => {
    try {
      const requestCode = await alarm.scheduleDailyAlarm(
        '09:00', // 9:00 AM
        alarmMessage,
        alarmTitle
      );
      Alert.alert('Daily Alarm Scheduled!', `Request Code: ${requestCode}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert('Error', `Failed to schedule daily alarm: ${error.message}`);
      }
    }
  };

  const cancelAllAlarms = async () => {
    try {
      await alarmManager.cancelAllAlarms();
      Alert.alert('Success', 'All alarms cancelled');
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel alarms');
    }
  };

  // ===== RENDER =====

  if (alarmSettings.isLoading && !alarmSettings.settings) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading alarm settings...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, {
      backgroundColor: themeColor,
    }]}>
      {/* <WIP
        width='100%'
        height='100%'
        style={styles.backgroundImage}
      /> */}

      <ScrollView style={{
        backgroundColor: 'transparent'
      }}>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 20,
          color: primaryFontColor,
        }}>
          Alarm System Demo
        </Text>

        {/* Settings Section */}
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: 10,
          color: primaryFontColor,
        }}>
          ⚙️ Alarm Settings
        </Text>

        {/* Snooze Minutes */}
        <View style={{ marginBottom: 15 }}>
          <Text style={{
            color: primaryFontColor,
          }}>Snooze Minutes (1-60):</Text>
          <TextInput
            value={snoozeMinutes}
            onChangeText={setSnoozeMinutes}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              padding: 8,
              marginVertical: 5,
              color: primaryFontColor,
            }}
          />
          <TouchableOpacity
            onPress={handleSaveSnoozeMinutes}
            style={styles.buttons}
          >
            <Text style={[styles.textButtons, {
              color: primaryFontColor,
            }]}>Save Snooze Minutes</Text>
          </TouchableOpacity>
        </View>

        {/* Vibration Toggle */}
        <View style={{ marginBottom: 15, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: primaryFontColor, }}>Vibration: </Text>
          <Switch
            value={vibrationEnabled}
            onValueChange={handleToggleVibration}
          />
          <Text style={{ color: primaryFontColor, }}>{vibrationEnabled ? 'Enabled' : 'Disabled'}</Text>
        </View>

        {/* Sound Settings */}
        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: primaryFontColor, }}>Current Sound: {alarmSettings.settings?.currentSound?.title || 'Default'}</Text>
          <View style={{ flexDirection: 'row', marginTop: 5 }}>
            <TouchableOpacity
              onPress={handleTestSound}
              style={styles.buttons}
            >
              <Text style={[styles.textButtons, {
                color: primaryFontColor,
              }]}>Test Sound</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleResetToDefaultSound}
              style={styles.buttons}
            >
              <Text style={[styles.textButtons, {
                color: primaryFontColor,
              }]}>Reset to Default</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Alarm Configuration Section */}
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          marginVertical: 10,
          color: primaryFontColor,
        }}>
          🔔 Alarm Configuration
        </Text>

        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: primaryFontColor, }}>Alarm Title:</Text>
          <TextInput
            value={alarmTitle}
            onChangeText={setAlarmTitle}
            style={{
              borderWidth: 1,
              padding: 8,
              marginVertical: 5,
              color: primaryFontColor,
            }}
          />
        </View>

        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: primaryFontColor, }}>Alarm Message:</Text>
          <TextInput
            value={alarmMessage}
            onChangeText={setAlarmMessage}
            style={{
              borderWidth: 1,
              padding: 8,
              marginVertical: 5,
              color: primaryFontColor,
            }}
          />
        </View>

        {/* Alarm Actions Section */}
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          marginVertical: 10,
          color: primaryFontColor,
        }}>
          ⏰ Alarm Actions
        </Text>

        <View style={{ marginBottom: 10 }}>
          <TouchableOpacity
            onPress={schedule5SecondAlarm}
            disabled={alarmManager.isLoading}
            style={styles.buttons}
          >
            <Text style={[styles.textButtons, {
              color: primaryFontColor,
            }]}>Set Alarm</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 10 }}>
          <TouchableOpacity
            onPress={scheduleDailyAlarm}
            disabled={alarm.isLoading}
            style={styles.buttons}
          >
            <Text style={[styles.textButtons, {
              color: primaryFontColor,
            }]}>Daily Alarm 9:00 AM</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 10 }}>
          <TouchableOpacity
            onPress={cancelAllAlarms}
            disabled={alarmManager.isLoading}
            style={[styles.buttons,{
              backgroundColor: '#d66767'
            }]}
          >
            <Text style={[styles.textButtons, {
              color: primaryFontColor,
            }]}>Cancel All Alarms</Text>
          </TouchableOpacity>
        </View>

        {/* Status Information */}
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          marginVertical: 10,
          color: primaryFontColor,
        }}>
          📊 Status
        </Text>

        <Text style={{ color: primaryFontColor, }}>Scheduled Alarms: {alarmManager.scheduledAlarmsCount}</Text>
        <Text style={{ color: primaryFontColor, }}>Current Snooze: {alarmSettings.settings?.snoozeMinutes || 5} minutes</Text>
        <Text style={{ color: primaryFontColor, }}>Vibration: {alarmSettings.settings?.vibration ? 'On' : 'Off'}</Text>

        {/* Error Display */}
        {(alarmConfig.error || alarmSettings.error || alarmManager.error || alarm.error) && (
          <View style={{ marginTop: 15, padding: 10, backgroundColor: '#ffebee' }}>
            <Text style={{ color: 'red', fontWeight: 'bold' }}>Errors:</Text>
            {alarmConfig.error && <Text style={{ color: 'red' }}>Config: {alarmConfig.error}</Text>}
            {alarmSettings.error && <Text style={{ color: 'red' }}>Settings: {alarmSettings.error}</Text>}
            {alarmManager.error && <Text style={{ color: 'red' }}>Manager: {alarmManager.error}</Text>}
            {alarm.error && <Text style={{ color: 'red' }}>Alarm: {alarm.error}</Text>}
            <TouchableOpacity
              onPress={() => {
                alarmConfig.clearError();
                alarmSettings.loadSettings(); // Reload to clear error state
                alarmManager.clearError();
                alarm.clearError();
              }}
              disabled={alarmManager.isLoading}
              style={styles.buttons}
            >
              <Text style={styles.textButtons}>Clear Errors</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading Indicator */}
        {(alarmConfig.isLoading || alarmSettings.isLoading || alarmManager.isLoading || alarm.isLoading) && (
          <View style={{ marginTop: 15 }}>
            <Text>Loading...</Text>
          </View>
        )}
      </ScrollView>

    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 80,
    fontWeight: 600,
  },
  box: {
    height: 60,
    width: 60,
    backgroundColor: '#fff'
  },
  backgroundImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  buttons: {
    backgroundColor: '#36924f',
    height: 46,
    width: 200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  textButtons: {
    fontSize: 16
  }
});

export default ChartScreen;