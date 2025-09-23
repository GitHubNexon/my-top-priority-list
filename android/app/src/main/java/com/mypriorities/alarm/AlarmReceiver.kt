package com.mypriorities.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action

        when (action) {
            "STOP_ALARM" -> {
                stopAlarm(context)
            }

            "SNOOZE_ALARM" -> {
                snoozeAlarm(context, intent)
            }

            else -> {
                // Normal alarm trigger from AlarmManager
                triggerAlarm(context, intent)
            }
        }
    }

    private fun triggerAlarm(context: Context, intent: Intent) {
        val title = intent.getStringExtra("title") ?: "Alarm"
        val message = intent.getStringExtra("message") ?: "Wake up!"
        val requestCode = intent.getIntExtra("requestCode", -1)

        // Start the sound service; service will create and post the single notification (startForeground).
        val soundIntent = Intent(context, AlarmSoundService::class.java).apply {
            putExtra("title", title)
            putExtra("message", message)
            putExtra("requestCode", requestCode)
            // If you want to pass a custom uri: putExtra("soundUri", uri)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(soundIntent)
        } else {
            context.startService(soundIntent)
        }

        // NOTE: The service will decide whether to attach a full-screen intent (when screen is off/locked)
        // so the receiver no longer posts a second notification or starts the Activity itself.
    }

    private fun stopAlarm(context: Context) {
        // Stop alarm sound (service will clean up)
        context.stopService(Intent(context, AlarmSoundService::class.java))
        // Cancel the notification
        AlarmNotificationHelper.cancelAlarmNotification(context)
    }

    private fun snoozeAlarm(context: Context, intent: Intent) {
        val requestCode = intent.getIntExtra("requestCode", -1)
        val title = intent.getStringExtra("title") ?: "Alarm"
        val message = intent.getStringExtra("message") ?: "Wake up!"
        val snoozeMinutes = intent.getIntExtra("snoozeMinutes", 5)

        // Stop current alarm
        stopAlarm(context)

        // Schedule snooze
        AlarmScheduler.scheduleSnooze(context, snoozeMinutes, requestCode, title, message)
    }
}