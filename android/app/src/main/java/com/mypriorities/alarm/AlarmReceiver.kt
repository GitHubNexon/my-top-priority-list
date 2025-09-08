package com.mypriorities.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        Log.d("AlarmReceiver", "Received action: $action")

        when (action) {
            "STOP_ALARM" -> {
                // Stop alarm sound
                context.stopService(Intent(context, AlarmSoundService::class.java))
                // Cancel notification
                AlarmNotificationHelper.cancelAlarmNotification(context)
            }

            "SNOOZE_ALARM" -> {
                // Stop alarm sound first
                context.stopService(Intent(context, AlarmSoundService::class.java))
                AlarmNotificationHelper.cancelAlarmNotification(context)

                // Example: reschedule alarm in 5 mins (customize if you store snoozeMinutes in prefs)
                val snoozeMinutes = intent.getIntExtra("snoozeMinutes", 5)
                AlarmScheduler.scheduleSnooze(context, snoozeMinutes)
            }

            else -> {
                // Normal alarm trigger from AlarmManager
                Log.d("AlarmReceiver", "Alarm triggered!")

                // Start playing alarm sound
                context.startForegroundService(Intent(context, AlarmSoundService::class.java))

                // Show alarm notification
                AlarmNotificationHelper.showAlarmNotification(
                    context,
                    "Alarm",
                    "Wake up! ⏰"
                )
            }
        }
    }
}
