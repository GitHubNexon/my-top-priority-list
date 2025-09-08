package com.mypriorities.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class SnoozeReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        // Stop current sound
        context.stopService(Intent(context, AlarmSoundService::class.java))

        val requestCode = intent.getIntExtra("requestCode", System.currentTimeMillis().toInt())
        val title = intent.getStringExtra("title") ?: "Snoozed Alarm"
        val message = intent.getStringExtra("message") ?: "Snoozed Alarm"
        val snoozeMinutes = intent.getIntExtra("snoozeMinutes", 10)
        val snoozeTime = System.currentTimeMillis() + (snoozeMinutes * 60 * 1000L)

        AlarmScheduler.scheduleAlarm(
            context,
            snoozeTime,
            requestCode,
            title,
            message,
            RecurrenceHelper.TYPE_ONCE,
            ""
        )
        AlarmNotificationHelper.cancelAlarmNotification(context)
    }
}