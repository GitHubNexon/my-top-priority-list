package com.mypriorities.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class SnoozeReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        // Stop current sound
        context.stopService(Intent(context, AlarmSoundService::class.java))

        val originalRequestCode = intent.getIntExtra("requestCode", System.currentTimeMillis().toInt())
        val title = intent.getStringExtra("title") ?: "Snoozed Alarm"
        val message = intent.getStringExtra("message") ?: "Snoozed Alarm"
        val snoozeMinutes = intent.getIntExtra("snoozeMinutes", 10)
        val snoozeTime = System.currentTimeMillis() + (snoozeMinutes * 60 * 1000L)
        
        // Generate a unique request code string for the snooze alarm
        val snoozeRequestCodeStr = "snooze_${originalRequestCode}_${System.currentTimeMillis()}"
        val snoozeRequestCode = AlarmStorageHelper.generateRequestCode(snoozeRequestCodeStr)

        // Use the storage-aware method (this will automatically encrypt the alarm)
        AlarmScheduler.scheduleAlarm(
            context,
            snoozeTime,
            snoozeRequestCode,
            snoozeRequestCodeStr,
            "$title (Snoozed)",
            message,
            RecurrenceHelper.TYPE_ONCE,
            ""
        )
        
        AlarmNotificationHelper.cancelAlarmNotification(context)
    }
}