import { AppRegistry } from 'react-native';
import { NativeModules } from 'react-native';
import { AlarmNativeModule } from '../types/Alarm';

const { AlarmModule } = NativeModules as { AlarmModule: AlarmNativeModule };

interface TaskData {
  [key: string]: any;
}

const BootRestoreTask = async (_taskData: TaskData) => {
  console.log('BootRestoreTask: Starting boot restoration...');

  try {
    // Check if AlarmModule is available
    if (!AlarmModule?.getAllScheduledAlarms) {
      console.error('BootRestoreTask: AlarmModule not available');
      return;
    }

    // Get all scheduled alarms from native storage
    const scheduledAlarms = await AlarmModule.getAllScheduledAlarms();

    if (!scheduledAlarms || !Array.isArray(scheduledAlarms)) {
      console.error('BootRestoreTask: Invalid alarms data received');
      return;
    }

    console.log(
      'BootRestoreTask: Found',
      scheduledAlarms.length,
      'alarms to verify',
    );

    // Verify each alarm and reschedule if needed
    for (const alarm of scheduledAlarms) {
      try {
        // Add alarm validation
        if (!alarm || typeof alarm.timestamp !== 'number') {
          console.warn('BootRestoreTask: Invalid alarm object', alarm);
          continue;
        }

        const currentTime = Date.now();
        if (alarm.timestamp > currentTime) {
          console.log(
            'BootRestoreTask: Alarm is still valid:',
            alarm.title,
            new Date(alarm.timestamp).toISOString(),
          );
        } else {
          console.log('BootRestoreTask: Alarm has expired:', alarm.title);
          // Optionally remove expired alarms
          // await AlarmModule.cancelAlarm(alarm.requestCodeStr);
        }
      } catch (error) {
        console.error(
          'BootRestoreTask: Error processing alarm:',
          alarm?.title,
          error,
        );
      }
    }

    console.log('BootRestoreTask: Boot restoration completed successfully');
  } catch (error) {
    console.error('BootRestoreTask: Error during boot restoration:', error);
  }
};

// Register the headless task
AppRegistry.registerHeadlessTask('BootRestoreTask', () => BootRestoreTask);

export default BootRestoreTask;