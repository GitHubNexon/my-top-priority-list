/* eslint-disable react-native/no-inline-styles */
import WIP from '../../../assets/images/undraw_analytics_6mru.svg';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { AlarmTimeoutAction, Ringtone } from '../../../types/AlarmConfig';
import { useAlarmManager, useAlarmSettings, useTheme } from '../../../hooks';
import { RecurrenceType } from '../../../types/Alarm';

const ChartScreen = () => {
  const { theme } = useTheme();
  const themeColor = theme.myColors?.triadic;
  const primaryFontColor = theme.fontColors?.primary;

  // Use all hooks - these now come from Context providers
  const alarmSettings = useAlarmSettings();
  const alarmManager = useAlarmManager();

  // Local state for demo
  const [snoozeMinutes, setSnoozeMinutes] = useState('5');
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [alarmMessage, setAlarmMessage] = useState('Wake up! This is a test alarm');
  const [alarmTitle, setAlarmTitle] = useState('Test Alarm');
  const [showRingtonePicker, setShowRingtonePicker] = useState(false);
  const [availableRingtones, setAvailableRingtones] = useState<Ringtone[] | undefined>([]);
  const [selectedRingtone, setSelectedRingtone] = useState<Ringtone | null>(null);
  const [maxAlarmDuration, setMaxAlarmDuration] = useState('0'); // 0 = infinite
  const [autoSnoozeOnTimeout, setAutoSnoozeOnTimeout] = useState(false);
  const [timeoutAction, setTimeoutAction] = useState<AlarmTimeoutAction>(AlarmTimeoutAction.SNOOZE);

  // Load settings on component mount
  useEffect(() => {
    loadInitialSettings();
  }, []);

  const loadInitialSettings = async () => {
    try {
      await alarmSettings?.loadSettings();
      await loadTimeoutAction();
      await loadAvailableRingtones();
    } catch (error) {
      console.error('Failed to load initial settings:', error);
    }
  };

  // Update local state when settings load
  useEffect(() => {
    if (alarmSettings?.settings) {
      setSnoozeMinutes(alarmSettings?.settings.snoozeMinutes.toString());
      setVibrationEnabled(alarmSettings?.settings.vibration);
      setMaxAlarmDuration(alarmSettings?.settings.maxAlarmDuration.toString());
      setAutoSnoozeOnTimeout(alarmSettings?.settings.autoSnoozeOnTimeout);
      setSelectedRingtone(alarmSettings?.settings.currentSound);
    }
  }, [alarmSettings?.settings]);

  // ===== SETTINGS FUNCTIONS =====

  // Load timeout action from settings
  const loadTimeoutAction = async () => {
    try {
      const action = await alarmSettings?.getAlarmTimeoutAction();

      if (action && Object.values(AlarmTimeoutAction).includes(action)) {
        setTimeoutAction(action);
      } else {
        setTimeoutAction(AlarmTimeoutAction.SNOOZE);
      }
    } catch (error) {
      console.error('Failed to load timeout action:', error);
      setTimeoutAction(AlarmTimeoutAction.SNOOZE); // fallback on error
    }
  };

  // Add these functions to handle timeout settings
  const handleSaveMaxAlarmDuration = async () => {
    try {
      const seconds = parseInt(maxAlarmDuration, 10);
      if (seconds >= 0) {
        await alarmSettings?.setMaxAlarmDuration(seconds);
        Alert.alert('Success',
          seconds === 0
            ? 'Alarm duration set to infinite'
            : `Alarm will auto-stop after ${seconds} seconds`
        );
      } else {
        Alert.alert('Error', 'Max alarm duration cannot be negative');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save max alarm duration');
    }
  };

  // Function to load available ringtones
  const loadAvailableRingtones = async () => {
    try {
      const ringtones = await alarmSettings?.getAvailableAlarmSounds();
      setAvailableRingtones(ringtones);
    } catch (error) {
      console.error('Failed to load ringtones:', error);
    }
  };

  // Function to open ringtone picker
  const handleOpenRingtonePicker = async () => {
    try {
      await loadAvailableRingtones();
      setShowRingtonePicker(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load ringtones');
    }
  };

  // Function to select a ringtone
  const handleSelectRingtone = async (ringtone: Ringtone) => {
    try {
      setSelectedRingtone(ringtone);
      await alarmSettings?.setAlarmSound(ringtone.uri);
      setShowRingtonePicker(false);
      Alert.alert('Success', `Alarm sound set to: ${ringtone.title}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to set ringtone');
    }
  };

  const handleSaveSnoozeMinutes = async () => {
    try {
      const minutes = parseInt(snoozeMinutes, 10);
      if (minutes >= 1 && minutes <= 60) {
        await alarmSettings?.setSnoozeMinutes(minutes);
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
      await alarmSettings?.setVibration(enabled);
      Alert.alert('Success', `Vibration ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      setVibrationEnabled(!enabled); // Revert on error
      Alert.alert('Error', 'Failed to update vibration setting');
    }
  };

  const handleTestSound = async () => {
    try {
      await alarmSettings?.testSoundPreview();
      Alert.alert('Sound Test', 'Playing alarm sound preview...');
    } catch (error) {
      Alert.alert('Error', 'Sound preview not available');
    }
  };

  // Function to reset to default sound
  const handleResetToDefaultSound = async () => {
    try {
      await alarmSettings?.setAlarmSound(null);
      setSelectedRingtone(null);
      Alert.alert('Success', 'Reset to default alarm sound');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset sound');
    }
  };

  // Handle timeout action change
  const handleTimeoutActionChange = async (action: AlarmTimeoutAction) => {
    try {
      setTimeoutAction(action);
      await alarmSettings?.setAlarmTimeoutAction(action);
      Alert.alert('Success', `Timeout action set to: ${action}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update timeout action');
      // Revert on error
      loadTimeoutAction();
    }
  };

  // ===== ALARM SCHEDULING FUNCTIONS =====

  const schedule5SecondAlarm = async () => {
    try {
      const requestCode = await alarmManager?.scheduleAlarm({
        timestamp: Date.now() + 10000, // 5 seconds from now
        title: alarmTitle,
        message: alarmMessage,
        recurrenceType: RecurrenceType.ONCE,
      });

      Alert.alert(
        'Alarm Scheduled!',
        `Alarm will trigger in 5 seconds\nRequest Code: ${requestCode}`
      );
      console.log('Alarm scheduled ✅ with code:', requestCode);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert('Error', `Failed to schedule alarm: ${error.message}`);
      }
    }
  };

  const getCurrentVibrationMode = async () => {
    try {
      const vibrationStatus = await alarmSettings?.getVibration();
      Alert.alert(
        'Vibration Status',
        `Has Vibrator: ${vibrationStatus?.valueOf ? 'Yes' : 'No'}\n` +
        `Vibration Setting: ${vibrationStatus?.valueOf ? 'On' : 'Off'}\n` +
        `Will Vibrate: ${vibrationStatus?.valueOf ? 'Yes' : 'No'}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to get vibration status');
    }
  };

  const scheduleDailyAlarm = async () => {
    try {
      // Schedule for next day at 9:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      const requestCode = await alarmManager?.scheduleAlarm({
        timestamp: tomorrow.getTime(),
        title: alarmTitle,
        message: alarmMessage,
        recurrenceType: RecurrenceType.ONCE,
      });
      Alert.alert('Daily Alarm Scheduled!', `Request Code: ${requestCode}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert('Error', `Failed to schedule daily alarm: ${error.message}`);
      }
    }
  };

  const cancelAllAlarms = async () => {
    try {
      await alarmManager?.cancelAllAlarms();
      Alert.alert('Success', 'All alarms cancelled');
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel alarms');
    }
  };

  // ===== RENDER =====

  if (alarmSettings?.isLoading && !alarmSettings?.settings) {
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
      <ScrollView style={{
        backgroundColor: 'transparent'
      }}>

        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          marginVertical: 10,
          color: primaryFontColor,
        }}>
          ⏰ Timeout Action
        </Text>

        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: primaryFontColor }}>
            When alarm duration expires:
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <TouchableOpacity
              onPress={() => handleTimeoutActionChange(AlarmTimeoutAction.SNOOZE)}
              style={[
                styles.buttons,
                timeoutAction === 'SNOOZE' && { backgroundColor: '#2e7d32' }
              ]}
            >
              <Text style={[styles.textButtons, { color: primaryFontColor }]}>
                Snooze Alarm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTimeoutActionChange(AlarmTimeoutAction.STOP)}
              style={[
                styles.buttons,
                timeoutAction === 'STOP' && { backgroundColor: '#2e7d32' }
              ]}
            >
              <Text style={[styles.textButtons, { color: primaryFontColor }]}>
                Stop Alarm
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={{ color: primaryFontColor, fontStyle: 'italic', marginTop: 5 }}>
            Current: {timeoutAction === 'SNOOZE' ? 'Snooze Alarm' : 'Stop Alarm'}
          </Text>
        </View>

        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 20,
          color: primaryFontColor,
        }}>
          Alarm System Demo
        </Text>

        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: 10,
          color: primaryFontColor,
        }}>
          🔔 Sound Settings
        </Text>

        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: primaryFontColor }}>
            Current Sound: {selectedRingtone?.title || 'Default Alarm Sound'}
          </Text>

          <View style={{ flexDirection: 'row', marginTop: 5, flexWrap: 'wrap' }}>
            <TouchableOpacity
              onPress={handleOpenRingtonePicker}
              style={styles.buttons}
            >
              <Text style={[styles.textButtons, { color: primaryFontColor }]}>
                Change Ringtone
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTestSound}
              style={styles.buttons}
            >
              <Text style={[styles.textButtons, { color: primaryFontColor }]}>
                Test Sound
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleResetToDefaultSound}
              style={styles.buttons}
            >
              <Text style={[styles.textButtons, { color: primaryFontColor }]}>
                Reset to Default
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={showRingtonePicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowRingtonePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: themeColor }]}>
              <Text style={[styles.modalTitle, { color: primaryFontColor }]}>
                Select Ringtone
              </Text>

              <FlatList
                data={availableRingtones}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.ringtoneItem,
                      selectedRingtone?.uri === item.uri && styles.selectedRingtone
                    ]}
                    onPress={() => handleSelectRingtone(item)}
                  >
                    <Text style={{ color: primaryFontColor }}>
                      {item.title}
                    </Text>
                    {selectedRingtone?.uri === item.uri && (
                      <Text style={styles.selectedText}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={{ color: primaryFontColor, textAlign: 'center', padding: 20 }}>
                    No ringtones available
                  </Text>
                }
              />

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowRingtonePicker(false)}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Timeout Settings Section */}
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          marginVertical: 10,
          color: primaryFontColor,
        }}>
          ⏱️ Alarm Timeout Settings
        </Text>

        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: primaryFontColor }}>
            Max Alarm Duration (seconds, 0 = infinite):
          </Text>
          <TextInput
            value={maxAlarmDuration}
            onChangeText={setMaxAlarmDuration}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              padding: 8,
              marginVertical: 5,
              color: primaryFontColor,
            }}
          />
          <TouchableOpacity
            onPress={handleSaveMaxAlarmDuration}
            style={styles.buttons}
          >
            <Text style={[styles.textButtons, { color: primaryFontColor }]}>
              Save Duration
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: primaryFontColor, fontStyle: 'italic', marginBottom: 15 }}>
          {maxAlarmDuration === '0'
            ? 'Alarm will ring until manually stopped'
            : `Alarm will ${autoSnoozeOnTimeout ? 'auto-snooze' : 'auto-stop'} after ${maxAlarmDuration} seconds`
          }
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
            disabled={alarmManager?.isLoading}
            style={styles.buttons}
          >
            <Text style={[styles.textButtons, {
              color: primaryFontColor,
            }]}>Set Alarm (5 seconds)</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 10 }}>
          <TouchableOpacity
            onPress={getCurrentVibrationMode}
            disabled={alarmManager?.isLoading}
            style={styles.buttons}
          >
            <Text style={[styles.textButtons, {
              color: primaryFontColor,
            }]}>Vibration Status</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 10 }}>
          <TouchableOpacity
            onPress={scheduleDailyAlarm}
            disabled={alarmManager?.isLoading}
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
            disabled={alarmManager?.isLoading}
            style={[styles.buttons, {
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
        <Text style={{ color: primaryFontColor, }}>Current Snooze: {alarmSettings?.settings?.snoozeMinutes || 5} minutes</Text>
        <Text style={{ color: primaryFontColor, }}>Vibration: {alarmSettings?.settings?.vibration ? 'On' : 'Off'}</Text>
        <Text style={{ color: primaryFontColor, }}>Max Duration: {alarmSettings?.settings?.maxAlarmDuration === 0 ? 'Infinite' : `${alarmSettings?.settings?.maxAlarmDuration} seconds`}</Text>
        <Text style={{ color: primaryFontColor, }}>Timeout Action: {timeoutAction}</Text>

        {/* Error Display */}
        {(alarmSettings?.error || alarmSettings?.error || alarmManager?.error || alarmManager?.error) && (
          <View style={{ marginTop: 15, padding: 10, backgroundColor: '#ffebee' }}>
            <Text style={{ color: 'red', fontWeight: 'bold' }}>Errors:</Text>
            {alarmSettings?.error && <Text style={{ color: 'red' }}>Config: {alarmSettings?.error}</Text>}
            {alarmSettings?.error && <Text style={{ color: 'red' }}>Settings: {alarmSettings?.error}</Text>}
            {alarmManager?.error && <Text style={{ color: 'red' }}>Alarm: {alarmManager?.error.message}</Text>}
            <TouchableOpacity
              onPress={() => {
                alarmSettings?.clearError();
                alarmSettings?.clearError();
                alarmManager?.clearError();
                alarmManager?.clearError();
              }}
              style={styles.buttons}
            >
              <Text style={styles.textButtons}>Clear Errors</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading Indicator */}
        {(alarmSettings?.isLoading || alarmSettings?.isLoading || alarmManager?.isLoading || alarmManager?.isLoading) && (
          <View style={{ marginTop: 15 }}>
            <Text style={{ color: primaryFontColor }}>Loading...</Text>
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
    fontWeight: '600',
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
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#d66767',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  ringtoneItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedRingtone: {
    backgroundColor: 'rgba(54, 146, 79, 0.2)',
  },
  selectedText: {
    color: '#36924f',
    fontWeight: 'bold',
  },
});

export default ChartScreen;