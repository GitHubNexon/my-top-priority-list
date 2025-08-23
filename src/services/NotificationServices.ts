import { Notes } from "../types/Notes";
import notifee, {
  AlarmType,
  AndroidImportance,
  RepeatFrequency,
  TriggerType,
} from "@notifee/react-native";
import { addDays, isBefore, setDay } from "date-fns";

export class NotificationService {
  static async scheduleNoteNotification(note: Notes) {
    if (!note.Time) return; // Time is required

    const dayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    const time = new Date(note.Time);
    const hour = time.getHours();
    const minutes = time.getMinutes();

    const channelId = await notifee.createChannel({
      id: "notes-reminders",
      name: "Your Priorities",
      sound: "urgent",
      importance: AndroidImportance.HIGH,
    });

    // IF there are valid recurring days
    if (note.Days && note.Days.length > 0) {
      for (const day of note.Days) {
        const dayIndex = dayMap[day];
        if (dayIndex === null) continue;

        let triggerDate = setDay(new Date(), dayIndex, { weekStartsOn: 0 });
        triggerDate.setHours(hour, minutes, 0, 0);

        // If the time has already passed today, push to next week
        if (isBefore(triggerDate, new Date())) {
          triggerDate = addDays(triggerDate, 7);
        }

        const notificationId = `${note.id}-${day}`; // Unique per day
        await notifee.createTriggerNotification(
          {
            id: notificationId,
            title: note.Title,
            body: note.Description || 'You have a scheduled note',
            android: {
              channelId,
              sound: 'urgent',
              largeIcon: 'notif_icon',
              smallIcon: 'notif_icon',
              pressAction: { id: 'default' },
              actions: [
                {
                  title: 'Stop Alarm',
                  pressAction: { id: 'stop' },
                },
              ],
            },
            data: {
              noteId: note.id,
              noteType: note.TypeOfNote.type,
            },
          },
          {
            type: TriggerType.TIMESTAMP,
            timestamp: triggerDate.getTime(),
            repeatFrequency: RepeatFrequency.WEEKLY,
            alarmManager: {
              type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE,
              allowWhileIdle: true,
            },
          },
        );
      }
    } else {
      // Fallback to one-time notification using note.Date + note.Time
      const time = new Date(note.Time);
      const triggerDate = note.Date ? new Date(note.Date) : new Date();
      triggerDate.setHours(time.getHours());
      triggerDate.setMinutes(time.getMinutes());
      triggerDate.setSeconds(0);
      triggerDate.setMilliseconds(0);

      // Optionally skip past times
      if (triggerDate.getTime() < Date.now()) {
        console.log(`Skipped scheduling past notification: ${note.id}`);
        return;
      }

      await notifee.createTriggerNotification(
        {
          id: note.id,
          title: note.Title,
          body: note.Description || 'You have a scheduled note',
          android: {
            channelId,
            sound: 'urgent',
            largeIcon: 'notif_icon',
            smallIcon: 'notif_icon',
            pressAction: { id: 'default' },
            actions: [
              {
                title: 'Stop Alarm',
                pressAction: { id: 'stop' },
              },
            ],
          },
          data: {
            noteId: note.id,
            noteType: note.TypeOfNote.type,
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: triggerDate.getTime(),
          alarmManager: {
            type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE,
            allowWhileIdle: true,
          },
        },
      );
    }
  }

  static async cancelNoteNotification(noteId: string) {
    try {
      // Get all scheduled notification IDs
      const triggerNotificationIds = await notifee.getTriggerNotificationIds();

      // Filter all IDs that belong to this note (e.g., note.id, note.id-Mon, etc.)
      const matchingIds = triggerNotificationIds.filter((id) =>
        id.startsWith(noteId)
      );

      // Cancel all matching trigger notifications
      if (matchingIds.length > 0) {
        await notifee.cancelTriggerNotifications(matchingIds);

        // Cancel the visible notifications as well (optional but recommended)
        for (const id of matchingIds) {
          await notifee.cancelNotification(id);
        }

        console.log("Cancelled notifications for:", matchingIds);
      } else {
        // Fallback: still try to cancel the base noteId
        await notifee.cancelTriggerNotifications([noteId]);
        await notifee.cancelNotification(noteId);
        console.log("Cancelled fallback notification for:", noteId);
      }
    } catch (error) {
      console.error("Error cancelling notifications:", error);
    }
  }

  static async cancelAllNotifications() {
    try {
      // Get all pending notifications
      const pending = await notifee.getTriggerNotificationIds();

      // Cancel them individually
      await notifee.cancelTriggerNotifications(pending);

      // Additional Android cleanup
      await notifee.cancelAllNotifications();

      console.log("Cancelled all notifications");
    } catch (error) {
      console.error("Error cancelling all notifications:", error);
    }
  }

  static async updateNoteNotification(note: Notes) {
    // First cancel existing notification
    await this.cancelNoteNotification(note.id);

    // Then schedule new one if time exists
    if (note.Time) {
      await this.scheduleNoteNotification(note);
    }
  }

  static async initializeNotifications(notes: Notes[]) {
    // Clear all existing note notifications
    await notifee.cancelAllNotifications();

    // Schedule notifications for all notes with time
    for (const note of notes) {
      if (note.Time) {
        await this.scheduleNoteNotification(note);
      }
    }
  }
}
