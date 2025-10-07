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
import { useAlarm, useAlarmConfig, useAlarmManager, useAlarmSettings, useTheme } from '../../../hooks';
import { AlarmConfigServices } from '../../../services/AlarmConfigServices';
import { Ringtone } from '../../../types/AlarmConfig';

const ChartScreen = () => {
  const alarmConfigService = new AlarmConfigServices();
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
  const [showRingtonePicker, setShowRingtonePicker] = useState(false);
  const [availableRingtones, setAvailableRingtones] = useState<Ringtone[]>([]);
  const [selectedRingtone, setSelectedRingtone] = useState<Ringtone | null>(null);
  const [maxAlarmDuration, setMaxAlarmDuration] = useState('0'); // 0 = infinite
  const [autoSnoozeOnTimeout, setAutoSnoozeOnTimeout] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    alarmSettings.loadSettings();
  }, []);

  // Load available ringtones when component mounts
  useEffect(() => {
    alarmSettings.loadAvailableRingtones();
  }, []);

  // Update local state when settings load
  // Update the useEffect that loads settings
  useEffect(() => {
    if (alarmSettings.settings) {
      setSnoozeMinutes(alarmSettings.settings.snoozeMinutes.toString());
      setVibrationEnabled(alarmSettings.settings.vibration);
      setMaxAlarmDuration(alarmSettings.settings.maxAlarmDuration.toString());
      setAutoSnoozeOnTimeout(alarmSettings.settings.autoSnoozeOnTimeout);
    }
  }, [alarmSettings.settings]);

  // ===== SETTINGS FUNCTIONS =====

  // Add these functions to handle timeout settings
  const handleSaveMaxAlarmDuration = async () => {
    try {
      const seconds = parseInt(maxAlarmDuration, 10);
      if (seconds >= 0) {
        await alarmConfig.setMaxAlarmDuration(seconds);
        await alarmSettings.updateMaxAlarmDuration(seconds);
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

  const handleToggleAutoSnooze = async (enabled: boolean) => {
    try {
      setAutoSnoozeOnTimeout(enabled);
      await alarmConfig.setAutoSnoozeOnTimeout(enabled);
      await alarmSettings.updateAutoSnoozeOnTimeout(enabled);
      Alert.alert('Success',
        enabled
          ? 'Alarm will auto-snooze on timeout'
          : 'Alarm will auto-stop on timeout'
      );
    } catch (error) {
      setAutoSnoozeOnTimeout(!enabled); // Revert on error
      Alert.alert('Error', 'Failed to update auto snooze setting');
    }
  };

  // Function to load available ringtones
  const loadAvailableRingtones = async () => {
    try {
      const ringtones = await alarmConfig.getAvailableAlarmSounds();
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
      await alarmSettings.updateAlarmSound(ringtone.uri);
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

  // Function to reset to default sound
  const handleResetToDefaultSound = async () => {
    try {
      await alarmConfig.resetToDefaultSound();
      await alarmSettings.updateAlarmSound(null);
      setSelectedRingtone(null);
      Alert.alert('Success', 'Reset to default alarm sound');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset sound');
    }
  };

  // ===== ALARM SCHEDULING FUNCTIONS =====

  const schedule5SecondAlarm = async () => {
    try {
      const requestCode = await alarmManager.scheduleAlarm({
        timestamp: Date.now() + 300000, // 5 seconds from now
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
      if (error instanceof Error) {
        Alert.alert('Error', `Failed to schedule alarm: ${error.message}`)
      }
    }
  };

  const getCurrentVibrationMode = () => {
    // try {
    //   const mode = alarmConfigService.getCurrentVibrationStatus();
    //   const ringtones = alarmConfigService.getAllRingtones();
    //   console.log(`Vibrate: ${(await mode).hasVibrator} - ${(await mode).vibrateSetting} - ${(await mode).willVibrate}`);
    //   console.log(`Ringtones: ${ringtones} `);
    // } catch (error: unknown) {
    //   if(error instanceof Error) {
    //     Alert.alert('Error', `Failed to schedule alarm: ${error.message}`)
    //   }
    // }
    alarmConfigService.getAllRingtones()
      .then(ringtones => {
        console.log('Ringtones:', ringtones);
        // ringtones is an array of objects: [{title: string, uri: string}, ...]
        ringtones.forEach((ringtone, index) => {
          console.log(`${index + 1}. ${ringtone.title}: ${ringtone.uri}`);
        });
      })
      .catch(error => {
        console.error('Error getting ringtones:', error);
      });
  };

  const scheduleDailyAlarm = async () => {
    try {
      const requestCode = await alarmManager.scheduleAlarm({
        timestamp: Date.now(),
        title: alarmTitle,
        message: alarmMessage,
        recurrenceType: 'DAILY',
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

        <View style={{ marginBottom: 15, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: primaryFontColor }}>Auto Snooze on Timeout: </Text>
          <Switch
            value={autoSnoozeOnTimeout}
            onValueChange={handleToggleAutoSnooze}
          />
          <Text style={{ color: primaryFontColor }}>
            {autoSnoozeOnTimeout ? 'Enabled' : 'Disabled'}
          </Text>
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
            onPress={getCurrentVibrationMode}
            disabled={alarmManager.isLoading}
            style={styles.buttons}
          >
            <Text style={[styles.textButtons, {
              color: primaryFontColor,
            }]}>Vibration Mode</Text>
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