package com.mypriorities.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.PowerManager
import android.util.Log

class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        Log.d("AlarmReceiver", "Received action: $action")

        when (action) {
            "STOP_ALARM" -> {
                Log.d("AlarmReceiver", "Stopping alarm")
                stopAlarm(context)
            }

            "SNOOZE_ALARM" -> {
                Log.d("AlarmReceiver", "Snoozing alarm")
                snoozeAlarm(context, intent)
            }

            else -> {
                // Normal alarm trigger from AlarmManager
                Log.d("AlarmReceiver", "Alarm triggered!")
                triggerAlarm(context, intent)
            }
        }
    }

    private fun triggerAlarm(context: Context, intent: Intent) {
        val title = intent.getStringExtra("title") ?: "Alarm"
        val message = intent.getStringExtra("message") ?: "Wake up!"
        val requestCode = intent.getIntExtra("requestCode", -1)

        // Start alarm sound service
        val soundIntent = Intent(context, AlarmSoundService::class.java).apply {
            putExtra("title", title)
            putExtra("message", message)
            putExtra("requestCode", requestCode)
        }
        context.startForegroundService(soundIntent)

        // Show fullscreen activity if screen is off/locked
        if (isScreenOffOrLocked(context)) {
            showFullscreenActivity(context, title, message, requestCode)
        } else {
            // Show notification if screen is on
            AlarmNotificationHelper.showAlarmNotification(context, title, message, requestCode)
        }
    }

    private fun stopAlarm(context: Context) {
        // Stop alarm sound
        context.stopService(Intent(context, AlarmSoundService::class.java))
        // Cancel notification
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

    private fun isScreenOffOrLocked(context: Context): Boolean {
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        return !powerManager.isInteractive
    }

    private fun showFullscreenActivity(context: Context, title: String, message: String, requestCode: Int) {
        val activityIntent = Intent(context, AlarmActivity::class.java).apply {
            putExtra("title", title)
            putExtra("message", message)
            putExtra("requestCode", requestCode)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        context.startActivity(activityIntent)
    }
}